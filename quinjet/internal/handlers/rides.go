// internal/handlers/rides.go
package handlers

import (
	"encoding/json"
	"net/http"
)

// CreateRide handles POST /api/rides
func CreateRide(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type RideRequest struct {
		UserID string `json:"user_id"`
		From   string `json:"from"`
		To     string `json:"to"`
	}

	var rideReq RideRequest
	if err := json.NewDecoder(r.Body).Decode(&rideReq); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Example response
	response := map[string]string{
		"status":  "ride created",
		"user_id": rideReq.UserID,
	}
	json.NewEncoder(w).Encode(response)
}

// AcceptRide handles POST /api/rides/accept
func AcceptRide(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rideID := r.URL.Query().Get("ride_id")
	driverID := r.URL.Query().Get("driver_id")

	if rideID == "" || driverID == "" {
		http.Error(w, "Missing ride_id or driver_id", http.StatusBadRequest)
		return
	}

	response := map[string]string{
		"status":    "ride accepted",
		"ride_id":   rideID,
		"driver_id": driverID,
	}
	json.NewEncoder(w).Encode(response)
}

// AvailableRides handles GET /api/rides/available
func AvailableRides(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Example list of available rides
	rides := []map[string]string{
		{"ride_id": "1", "from": "Point A", "to": "Point B"},
		{"ride_id": "2", "from": "Point C", "to": "Point D"},
	}

	json.NewEncoder(w).Encode(rides)
}
