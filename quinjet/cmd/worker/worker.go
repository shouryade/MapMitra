package worker

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type Worker struct {
	redisClient *redis.Client
}

// NewWorker initializes a new Worker instance.
func NewWorker(redisClient *redis.Client) *Worker {
	return &Worker{
		redisClient: redisClient,
	}
}

// StartCleanupWorker starts the cleanup process that removes members of the priority queue
// where their score is `threshold` seconds older than the current timestamp.
func (w *Worker) StartCleanupWorker(interval int, threshold int) {
	ctx := context.Background()

	// Run in an infinite loop
	for {
		// Fetch all keys that match the pattern grid::priority_queue:x:y
		iter := w.redisClient.Scan(ctx, 0, "grid::priority_queue:*", 0).Iterator()

		for iter.Next(ctx) {
			key := iter.Val()

			// Extract x, y from the key, e.g., grid::priority_queue:x:y
			parts := strings.Split(key, ":")

			if len(parts) != 5 {
				continue // skip if the key doesn't match the expected pattern
			}

			// Get the current timestamp and subtract 20 seconds
			currentTime := time.Now().Unix()
			thresholdTime := currentTime - int64(threshold)

			// Remove members with a score less than the threshold time
			res, err := w.redisClient.ZRemRangeByScore(ctx, key, "-inf", fmt.Sprintf("%d", thresholdTime)).Result()
			log.Printf("Removed %d members from %s", res, key)

			if err != nil {
				log.Printf("Error removing members from %s: %v", key, err)
			} else {
				fmt.Printf("Cleanup Worker: Removed members with scores < %d from %s\n", thresholdTime, key)
			}
		}

		// Check for any errors from the iterator
		if err := iter.Err(); err != nil {
			log.Printf("Error scanning Redis keys: %v", err)
		}

		// Sleep for the specified interval (in seconds)
		fmt.Println("Cleanup Worker: Pausing for 5 seconds before next iteration...")
		time.Sleep(time.Duration(interval) * time.Second)
	}
}
