package main

import (
	"context"
	"fmt"
	"log"
	"quinjet/cmd/api"
	"quinjet/configs"

	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()

	redisClient := redis.NewClient(&redis.Options{
		Addr:     configs.Envs.RedisAddress,
		Password: "",
		DB:       0,
	})

	initRedis(redisClient, ctx)

	// worker := worker.NewWorker(redisClient)
	// go worker.StartCleanupWorker(5, 20)

	server := api.NewAPIServer(fmt.Sprintf(":%s", configs.Envs.Port), redisClient)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}

}

func initRedis(redisClient *redis.Client, ctx context.Context) {
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Redis: Successfully connected!")
}
