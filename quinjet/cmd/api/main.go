package main

import (
	"fmt"
	"net/http"
	"quinjet/internal/handlers"
)

func main() {
	router := http.NewServeMux()
	router.HandleFunc("GET /api/v1/health", handlers.HealthHandler)
	router.HandleFunc("POST /api/rides", handlers.CreateRide)
	router.HandleFunc("GET /api/rides/available", handlers.AvailableRides)
	router.HandleFunc("POST /api/rides/accept", handlers.AcceptRide)
	fmt.Println("API server is running on port 8080")
	err := http.ListenAndServe(":8080", router)
	if err != nil {
		fmt.Println("Error starting server:", err)
		return
	}
}
