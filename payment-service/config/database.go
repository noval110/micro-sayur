package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func InitDB() *sql.DB {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	if host == "" {
		host = "postgres_sayur_container"
	}
	if port == "" {
		port = "5432"
	}
	if dbName == "" {
		dbName = "sayur_payment_db"
	}
	if user == "" {
		log.Fatal("DB_USER belum diatur")
	}
	if password == "" {
		log.Fatal("DB_PASSWORD belum diatur")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbName)
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Gagal membuka database payment: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("Gagal terhubung ke database payment: %v", err)
	}
	log.Println("Payment-Service terhubung ke database:", dbName)
	return db
}
