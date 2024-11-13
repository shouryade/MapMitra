package handlers

import (
	"fmt"
	"net/http"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.URL.Path)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Status OK"))

}
