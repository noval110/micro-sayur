package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func InitDB() *sql.DB {
	dsn := os.Getenv("DATABASE_URL")
	var database string
	if dsn == "" {
		host := getEnv("DB_HOST", "127.0.0.1")
		port := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "postgres")
		password := getEnv("DB_PASSWORD", "postgres")
		database = getEnv("DB_NAME", "sayur_order_db")
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, database)
	} else {
		database = "PaaS Cloud"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi database: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Gagal ping database: %v", err)
	}

	fmt.Printf("Berhasil terhubung ke database %s!\n", database)
	return db
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
