package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"quinjet/cmd/api"
	"quinjet/configs"
	"quinjet/db"

	"github.com/go-sql-driver/mysql"
	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()
	cfg := mysql.Config{
		User:                 configs.Envs.DBUser,
		Passwd:               configs.Envs.DBPassword,
		Addr:                 configs.Envs.DBAddress,
		DBName:               configs.Envs.DBName,
		Net:                  "tcp",
		AllowNativePasswords: true,
		ParseTime:            true,
	}

	db, err := db.NewMySQLStorage(cfg)
	if err != nil {
		log.Fatal(err)
	}

	initStorage(db)

	redisClient := redis.NewClient(&redis.Options{
		Addr:     configs.Envs.RedisAddress,
		Password: "",
		DB:       0,
	})

	initRedis(redisClient, ctx)

	// worker := worker.NewWorker(redisClient)
	// go worker.StartCleanupWorker(5, 20)

	server := api.NewAPIServer(fmt.Sprintf(":%s", configs.Envs.Port), db, redisClient)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}

}

func initStorage(db *sql.DB) {
	err := db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("DB: Successfully connected!")
}
func initRedis(redisClient *redis.Client, ctx context.Context) {
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Redis: Successfully connected!")
}
