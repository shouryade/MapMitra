package rides

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// GET /rides/accept/{requestID}
// Response: Error if not in ride::request or send pickup location as {"pickup": [lat,long]}
func (h *RidesHandler) handleAcceptAvailableRide(w http.ResponseWriter, r *http.Request) {
	requestID := r.PathValue("requestID")

	if requestID == "" {
		http.Error(w, "Missing requestID", http.StatusBadRequest)
		return
	}

	// Check if the ride exists in Redis
	ctx := context.Background()
	requestKey := fmt.Sprintf("ride::request:%s", requestID)

	// Get ride details from Redis
	rideDetails, err := h.redis.HGetAll(ctx, requestKey).Result()
	if err == redis.Nil || len(rideDetails) == 0 { // Ride not found
		http.Error(w, "Ride not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to query ride details", http.StatusInternalServerError)
		return
	}

	// Extract status, pickup location, and levels
	status, ok := rideDetails["status"]
	if !ok || status != "pending" {
		http.Error(w, "Ride is not available for acceptance", http.StatusConflict)
		return
	}

	pickup, ok := rideDetails["pickup"]
	if !ok {
		http.Error(w, "Pickup location missing in ride details", http.StatusInternalServerError)
		return
	}

	levelsStr, ok := rideDetails["levels"]
	if !ok {
		http.Error(w, "Ride level details missing", http.StatusInternalServerError)
		return
	}

	// Parse levels as a slice of [x, y] coordinates
	var levels [][]int
	if err := json.Unmarshal([]byte(levelsStr), &levels); err != nil {
		http.Error(w, "Invalid levels data", http.StatusInternalServerError)
		return
	}

	// Remove the ride from all relevant priority queues
	for _, level := range levels {
		if len(level) != 2 {
			continue // Skip invalid levels
		}
		gridKey := fmt.Sprintf("grid::priority_queue:%d:%d", level[0], level[1])
		if _, err := h.redis.ZRem(ctx, gridKey, requestID).Result(); err != nil {
			log.Printf("Failed to remove ride from queue %s: %v", gridKey, err)
		}
	}

	// Remove the ride from the ride::request hash
	if _, err := h.redis.Del(ctx, requestKey).Result(); err != nil {
		http.Error(w, "Failed to remove ride from available list", http.StatusInternalServerError)
		return
	}

	// Lock the ride using SETNX
	lockKey := fmt.Sprintf("ride::lock:%s", requestID)
	if success, err := h.redis.SetNX(ctx, lockKey, "locked", 30*time.Second).Result(); err != nil {
		http.Error(w, "Failed to lock ride", http.StatusInternalServerError)
		return
	} else if !success {
		http.Error(w, "Ride is already locked", http.StatusConflict)
		return
	}

	// Send the pickup location as response
	response := map[string]interface{}{
		"pickup": pickup, // Return the pickup location as it is
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// POST /rides/reject/{requestID}
// Response: 200 OK if successful
func (h *RidesHandler) handleDeclineAvailableRide(w http.ResponseWriter, r *http.Request) {
	// Extract requestID from the URL path
	requestID := r.PathValue("requestID")

	if requestID == "" {
		http.Error(w, "Missing requestID", http.StatusBadRequest)
		return
	}

	// Check if the ride exists in the locked state
	ctx := context.Background()
	lockKey := fmt.Sprintf("ride::lock:%s", requestID)

	// Attempt to retrieve the ride's lock
	locked, err := h.redis.Exists(ctx, lockKey).Result()
	if err != nil {
		http.Error(w, "Failed to check ride lock status", http.StatusInternalServerError)
		return
	}
	if locked == 0 {
		http.Error(w, "Ride is not locked or already processed", http.StatusConflict)
		return
	}

	// Retrieve ride details from the lock or rehydrated storage
	requestKey := fmt.Sprintf("ride::request:%s", requestID)
	rideDetails, err := h.redis.HGetAll(ctx, requestKey).Result()
	if err != nil || len(rideDetails) == 0 {
		http.Error(w, "Failed to retrieve ride details", http.StatusNotFound)
		return
	}

	// Extract levels, pickup, and timestamp from ride details
	levelsStr, ok := rideDetails["levels"]
	if !ok {
		http.Error(w, "Ride levels missing", http.StatusInternalServerError)
		return
	}

	var levels [][]int
	if err := json.Unmarshal([]byte(levelsStr), &levels); err != nil {
		http.Error(w, "Invalid levels data", http.StatusInternalServerError)
		return
	}

	pickup, ok := rideDetails["pickup"]
	if !ok {
		http.Error(w, "Pickup location missing in ride details", http.StatusInternalServerError)
		return
	}

	timestampStr, ok := rideDetails["timestamp"]
	if !ok {
		http.Error(w, "Timestamp missing in ride details", http.StatusInternalServerError)
		return
	}

	timestamp, err := strconv.ParseFloat(timestampStr, 64)
	if err != nil {
		http.Error(w, "Invalid timestamp in ride details", http.StatusInternalServerError)
		return
	}

	// Reinsert the ride into the priority queues for all levels
	for _, level := range levels {
		if len(level) != 2 {
			continue // Skip invalid levels
		}
		gridKey := fmt.Sprintf("grid::priority_queue:%d:%d", level[0], level[1])
		if err := h.redis.ZAdd(ctx, gridKey, redis.Z{
			Score:  timestamp, // Use the same timestamp as before
			Member: requestID,
		}).Err(); err != nil {
			http.Error(w, "Failed to reinsert ride into priority queue", http.StatusInternalServerError)
			return
		}
	}

	// Restore the ride into the hashset
	if err := h.redis.HSet(ctx, requestKey, map[string]interface{}{
		"pickup":    pickup,
		"status":    "pending",
		"timestamp": timestamp,
		"levels":    levelsStr, // Use the same levels data
	}).Err(); err != nil {
		http.Error(w, "Failed to restore ride details", http.StatusInternalServerError)
		return
	}

	// Remove the lock
	if _, err := h.redis.Del(ctx, lockKey).Result(); err != nil {
		log.Printf("Warning: Failed to remove lock for ride %s: %v", requestID, err)
	}

	// Respond with success
	w.WriteHeader(http.StatusOK)
	response := map[string]string{
		"requestID": requestID,
		"message":   "Ride rejected and restored successfully",
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
