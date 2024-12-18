package api

import (
	"log"
	"net/http"
	"quinjet/internal/services/health"
	"quinjet/internal/services/rides"

	"github.com/redis/go-redis/v9"
	"github.com/rs/cors"
)

type APIServer struct {
	addr  string
	redis *redis.Client
}

func NewAPIServer(addr string, redis *redis.Client) *APIServer {
	return &APIServer{
		addr:  addr,
		redis: redis,
	}
}

func (s *APIServer) Run() error {
	router := http.NewServeMux()

	// health
	router.Handle("/health/", http.StripPrefix("/health", health.NewHealthHandler()))
	// rides
	router.Handle("/rides/", http.StripPrefix("/rides", rides.NewRidesHandler(s.redis)))

	v1 := http.NewServeMux()
	v1.Handle("/api/v1/", http.StripPrefix("/api/v1", router))
	handler := cors.Default().Handler(v1)
	server := http.Server{
		Addr:    s.addr,
		Handler: handler,
	}
	log.Println("Listening on", s.addr)
	return server.ListenAndServe()
}
