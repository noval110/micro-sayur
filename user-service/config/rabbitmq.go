package config

import (
	"fmt"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

func (cfg Config) NewRabbitMQ() (*amqp.Connection, error) {
	url := os.Getenv("RABBITMQ_URL")

	if url == "" {
		url = fmt.Sprintf(
			"amqp://%s:%s@%s:%s/",
			cfg.RabbitMQ.User,
			cfg.RabbitMQ.Password,
			cfg.RabbitMQ.Host,
			cfg.RabbitMQ.Port,
		)
	}

	conn, err := amqp.Dial(url)
	if err != nil {
		fmt.Printf("[RabbitMQ-1] Failed to connect to RabbitMQ: %v\n", err)
		return nil, err
	}

	fmt.Println("Berhasil terhubung ke RabbitMQ!")
	return conn, nil
}
