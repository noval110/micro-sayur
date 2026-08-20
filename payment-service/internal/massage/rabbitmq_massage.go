package massage

import (
	"encoding/json"
	"fmt"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

func PublishPaymentNotification(
	email string,
	subject string,
	message string,
) error {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		return fmt.Errorf("RABBITMQ_URL belum dikonfigurasi")
	}

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		return fmt.Errorf("gagal connect RabbitMQ: %w", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return fmt.Errorf("gagal membuka channel RabbitMQ: %w", err)
	}
	defer ch.Close()

	queue, err := ch.QueueDeclare(
		"payment_notification",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("gagal membuat queue: %w", err)
	}

	payload := map[string]string{
		"email":   email,
		"subject": subject,
		"message": message,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return ch.Publish(
		"",
		queue.Name,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
		},
	)
}
