package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func InitDB() *sql.DB {
	// Pakai 127.0.0.1 secara langsung tanpa variabel env dulu untuk memastikan
	dsn := "host=127.0.0.1 port=5432 user=postgres password=postgres dbname=sayur_order_db sslmode=disable"

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi database: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Gagal ping database: %v", err)
	}

	fmt.Println("Berhasil terhubung ke database sayur_order_db!")
	return db
}
