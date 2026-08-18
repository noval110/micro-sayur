package config

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"os"
)

var Ctx = context.Background()

func NewRedisClient() *redis.Client {
	var opt *redis.Options
	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl != "" {
		var err error
		opt, err = redis.ParseURL(redisUrl)
		if err != nil {
			panic(err)
		}
	} else {
		host := os.Getenv("REDIS_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("REDIS_PORT")
		if port == "" {
			port = "6379"
		}
		opt = &redis.Options{
			Addr: fmt.Sprintf("%s:%s", host, port),
		}
	}

	client := redis.NewClient(opt)

	//memastikan redis terhubung
	_, err := client.Ping(Ctx).Result()
	if err != nil {
		panic(err)
	}

	return client
}
