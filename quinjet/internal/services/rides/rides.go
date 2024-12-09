package rides

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

type RidesHandler struct {
	db    *sql.DB
	redis *redis.Client
}

func NewRidesHandler(db *sql.DB, redis *redis.Client) http.Handler {
	handler := &RidesHandler{
		db:    db,
		redis: redis,
	}

	mux := http.NewServeMux()
	mux.Handle("POST /new", http.HandlerFunc(handler.handlePostRide))
	mux.HandleFunc("GET /status/{requestID}", http.HandlerFunc(handler.handleGetRideStatus))
	mux.HandleFunc("GET /available/{x}/{y}", http.HandlerFunc(handler.handleGetAvailableRides))

	return mux
}

// POST /rides
// Request body: { "requestId": "some_id" }
// Response: 201 Created
func (h *RidesHandler) handlePostRide(w http.ResponseWriter, r *http.Request) {

	var req struct {
		RequestID string     `json:"requestID"`
		Level     [][]int    `json:"level"`
		Location  [2]float32 `json:"pickup"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("Failed to decode request body:", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.RequestID == "" || len(req.Level) == 0 || req.Location == [2]float32{} {
		log.Println("Missing required fields")
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	timestamp := time.Now().Unix()

	for _, level := range req.Level {
		if len(level) != 2 {
			http.Error(w, "Invalid level data", http.StatusBadRequest)
			return
		}
		gridKey := fmt.Sprintf("grid::priority_queue:%d:%d", level[0], level[1])
		if err := h.redis.ZAdd(ctx, gridKey, redis.Z{
			Score:  float64(timestamp),
			Member: req.RequestID,
		}).Err(); err != nil {
			http.Error(w, "Failed to update priority queue", http.StatusInternalServerError)
			return
		}
	}

	// Store request details in hashset for faster access by Leena's client -> user
	requestKey := fmt.Sprintf("ride::request:%s", req.RequestID)
	requestDetails := map[string]interface{}{
		// "user_id":   "", // Placeholder, update as needed
		"pickup":    string(fmt.Sprintf("%f,%f", req.Location[0], req.Location[1])),
		"status":    "pending",
		"timestamp": timestamp,
	}

	if err := h.redis.HSet(ctx, requestKey, requestDetails).Err(); err != nil {
		log.Println("Failed to store ride details:", err)
		http.Error(w, "Failed to store ride details", http.StatusInternalServerError)
		return
	}
	// Set expiry of this request to 20 seconds
	// if err := h.redis.Expire(ctx, requestKey, 20*time.Second).Err(); err != nil {
	// 	log.Println("Failed to set expiry for ride details:", err)
	// 	http.Error(w, "Failed to set expiry for ride details", http.StatusInternalServerError)
	// 	return
	// }

	w.WriteHeader(http.StatusCreated)
	response := map[string]string{
		"requestID": req.RequestID,
		"message":   "Ride created successfully",
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GET /rides/{requestID}
// Response: Status of the ride from Redis
func (h *RidesHandler) handleGetRideStatus(w http.ResponseWriter, r *http.Request) {
	requestID := r.PathValue("requestID")

	if requestID == "" {
		http.Error(w, "Missing requestID", http.StatusBadRequest)
		return
	}

	// Check Redis for the ride details in the hash
	ctx := context.Background()
	requestKey := fmt.Sprintf("ride::request:%s", requestID)
	status, err := h.redis.HGet(ctx, requestKey, "status").Result()

	// Handle errors
	if errors.Is(err, redis.Nil) {
		log.Printf("Ride not found: %s", requestID)
		http.Error(w, "Ride not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Printf("Failed to fetch ride status for %s: %v", requestID, err)
		http.Error(w, "Failed to fetch ride status", http.StatusInternalServerError)
		return
	}

	// Check the status and respond accordingly
	if status == "pending" {
		w.WriteHeader(http.StatusAccepted)
		response := fmt.Sprintf(`{"requestId":"%s","status":"%s"}`, requestID, status)
		w.Write([]byte(response))
		return
	} else if status == "success" {
		autoID, err := h.redis.HGet(ctx, requestKey, "auto_id").Result()
		if err != nil {
			log.Printf("Failed to fetch auto_id for %s: %v", requestID, err)
			http.Error(w, "Failed to fetch auto_id", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		response := fmt.Sprintf(`{"requestId":"%s","status":"%s","autoId":"%s"}`, requestID, status, autoID)
		w.Write([]byte(response))
		return
	}

	// Default response for other statuses
	w.Header().Set("Content-Type", "application/json")
	response := fmt.Sprintf(`{"requestId":"%s","status":"%s"}`, requestID, status)
	w.Write([]byte(response))
}

func (h *RidesHandler) handleGetAvailableRides(w http.ResponseWriter, r *http.Request) {
	pathX := r.PathValue("x")
	pathY := r.PathValue("y")

	// Validate the path parameters
	if pathX == "" || pathY == "" {
		http.Error(w, "Missing required fields: x and y", http.StatusBadRequest)
		return
	}

	// Convert path parameters to integers
	x, err := strconv.Atoi(pathX)
	if err != nil {
		http.Error(w, "Invalid path parameter x", http.StatusBadRequest)
		return
	}

	y, err := strconv.Atoi(pathY)
	if err != nil {
		http.Error(w, "Invalid path parameter y", http.StatusBadRequest)
		return
	}

	// Get the available rides from the Redis cache
	rides, err := h.getAvailableRides(x, y)
	if err != nil {
		http.Error(w, "Failed to get available rides: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Marshal the rides into JSON
	data, err := json.Marshal(rides)
	if err != nil {
		http.Error(w, "Failed to marshal response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Write the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (h *RidesHandler) getAvailableRides(x, y int) ([]string, error) {
	// Get the key for the priority queue
	ctx := context.Background()
	key := fmt.Sprintf("grid::priority_queue:%d:%d", x, y)

	// Fetch the rides from the priority queue sorted set
	rides, err := h.redis.ZRangeByScore(ctx, key, &redis.ZRangeBy{
		Min:    "-inf",
		Max:    "+inf",
		Offset: 0,
		Count:  100,
	}).Result()

	if err != nil {
		return nil, fmt.Errorf("could not fetch rides from Redis: %v", err)
	}

	return rides, nil
}
