package config

import (
	"context"
	"crypto/tls"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

var Ctx = context.Background()

var (
	redisClient *redis.Client
	redisMu     sync.Mutex
)

func NewRedisClient() *redis.Client {
	redisMu.Lock()
	defer redisMu.Unlock()

	if redisClient != nil {
		return redisClient
	}

	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	password := os.Getenv("REDIS_PASSWORD")
	useTLS := os.Getenv("REDIS_TLS") == "true"

	options := &redis.Options{
		Addr:         fmt.Sprintf("%s:%s", host, port),
		Password:     password,
		DialTimeout:  15 * time.Second,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		PoolSize:     10,
	}

	if useTLS {
		options.TLSConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}

	client := redis.NewClient(options)

	ctx, cancel := context.WithTimeout(Ctx, 20*time.Second)
	defer cancel()

	if _, err := client.Ping(ctx).Result(); err != nil {
		_ = client.Close()
		panic(fmt.Sprintf("gagal terhubung ke Redis: %v", err))
	}

	redisClient = client

	fmt.Println("Berhasil terhubung ke Redis!")

	return redisClient
}