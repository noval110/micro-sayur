package config

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"os"
)

var Ctx = context.Background()

func NewRedisClient() *redis.Client {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", host, port),
	})

	//memastikan redis terhubung
	_, err := client.Ping(Ctx).Result()
	if err != nil {
		panic(err)
	}

	return client
}
