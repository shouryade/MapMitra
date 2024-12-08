package api

import (
	"database/sql"
	"log"
	"net/http"
	"quinjet/internal/services/health"
	"quinjet/internal/services/rides"

	"github.com/redis/go-redis/v9"
)

type APIServer struct {
	addr  string
	db    *sql.DB
	redis *redis.Client
}

func NewAPIServer(addr string, db *sql.DB, redis *redis.Client) *APIServer {
	return &APIServer{
		addr:  addr,
		db:    db,
		redis: redis,
	}
}

func (s *APIServer) Run() error {
	router := http.NewServeMux()

	// health
	router.Handle("/health/", http.StripPrefix("/health", health.NewHealthHandler()))
	// rides
	router.Handle("/rides/", http.StripPrefix("/rides", rides.NewRidesHandler(s.db, s.redis)))

	v1 := http.NewServeMux()
	v1.Handle("/api/v1/", http.StripPrefix("/api/v1", router))

	server := http.Server{
		Addr:    s.addr,
		Handler: v1,
	}
	log.Println("Listening on", s.addr)
	return server.ListenAndServe()
}