package main

import (
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
		Password: "", // no password set
		DB:       0,  // use default DB
	})

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
