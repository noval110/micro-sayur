package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/streadway/amqp"
)

type NotificationMessage struct {
	Email   string `json:"email"`
	Massage string `json:"massage"`
}

func main() {
	amqpURL := os.Getenv("RABBITMQ_URL")
	if amqpURL == "" {
		amqpURL = "amqp://guest:guest@localhost:5672/"
	}

	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		log.Fatalf("[NotificationService] Gagal konek ke RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("[NotificationService] Gagal membuka channel: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"email_verification", // Sesuai dengan notif_type di user-service
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		log.Fatalf("[NotificationService] Gagal declare queue: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,  // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		log.Fatalf("[NotificationService] Gagal meregister consumer: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			var notif NotificationMessage
			err := json.Unmarshal(d.Body, &notif)
			if err != nil {
				log.Printf("Error unmarshal message: %v", err)
				continue
			}

			fmt.Println("--------------------------------------------------")
			log.Printf("📧 [NOTIFIKASI TERIKIRIM] Ke Email: %s", notif.Email)
			log.Printf("📝 Pesan: %s", notif.Massage)
			fmt.Println("--------------------------------------------------")

			// DI SINI: Kamu bisa menambahkan library SMTP (seperti net/smtp atau gomail)
			// untuk mengirimkan email beneran ke user!
		}
	}()

	log.Printf(" [*] Notification Service listening di queue '%s'. Tekan CTRL+C untuk keluar", q.Name)
	<-forever
}