package main

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	amqp "github.com/rabbitmq/amqp091-go"
)

type NotificationMessage struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
	Massage string `json:"massage"`
}

func connectRabbitMQ() (*amqp.Connection, error) {
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		return nil, fmt.Errorf("RABBITMQ_URL is required")
	}

	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("connect to RabbitMQ: %w", err)
	}

	return conn, nil
}

func sendEmail(to, subject, body string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM_EMAIL")
	fromName := os.Getenv("SMTP_FROM_NAME")

	if host == "" {
		return fmt.Errorf("SMTP_HOST is required")
	}

	if port == "" {
		port = "465"
	}

	if username == "" {
		return fmt.Errorf("SMTP_USERNAME is required")
	}

	if password == "" {
		return fmt.Errorf("SMTP_PASSWORD is required")
	}

	if from == "" {
		return fmt.Errorf("SMTP_FROM_EMAIL is required")
	}

	if fromName == "" {
		fromName = "Sayur-day"
	}

	if strings.TrimSpace(to) == "" {
		return fmt.Errorf("recipient email is empty")
	}

	if strings.TrimSpace(subject) == "" {
		subject = "Notifikasi Sayur-day"
	}

	address := fmt.Sprintf("%s:%s", host, port)

	tlsConfig := &tls.Config{
		ServerName: host,
		MinVersion: tls.VersionTLS12,
	}

	conn, err := tls.Dial("tcp", address, tlsConfig)
	if err != nil {
		return fmt.Errorf("TLS connection failed: %w", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("create SMTP client: %w", err)
	}
	defer client.Close()

	auth := smtp.PlainAuth(
		"",
		username,
		password,
		host,
	)

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("SMTP authentication failed: %w", err)
	}

	if err := client.Mail(from); err != nil {
		return fmt.Errorf("MAIL FROM failed: %w", err)
	}

	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("RCPT TO failed: %w", err)
	}

	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("open email data: %w", err)
	}

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;">
	<div style="
		max-width:600px;
		margin:auto;
		background:white;
		padding:30px;
		border-radius:12px;
	">
		<h2 style="color:#16a34a;margin-top:0;">
			Sayur-day
		</h2>

		%s

		<hr style="border:none;border-top:1px solid #eeeeee;margin:25px 0;">

		<p style="font-size:12px;color:#777;">
			Email ini dikirim otomatis oleh Sayur-day.
		</p>
	</div>
</body>
</html>
`, body)

	message := []byte(
		fmt.Sprintf(
			"From: %s <%s>\r\n"+
				"To: %s\r\n"+
				"Subject: %s\r\n"+
				"MIME-Version: 1.0\r\n"+
				"Content-Type: text/html; charset=UTF-8\r\n"+
				"\r\n"+
				"%s",
			fromName,
			from,
			to,
			subject,
			htmlBody,
		),
	)

	if _, err := writer.Write(message); err != nil {
		return fmt.Errorf("write email: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("close email writer: %w", err)
	}

	if err := client.Quit(); err != nil {
		log.Printf("SMTP quit warning: %v", err)
	}

	return nil
}

func consumeNotifications(
	conn *amqp.Connection,
	queueName string,
) error {
	channel, err := conn.Channel()
	if err != nil {
		return fmt.Errorf("open RabbitMQ channel: %w", err)
	}
	defer channel.Close()

	queue, err := channel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("declare queue %q: %w", queueName, err)
	}

	if err := channel.Qos(1, 0, false); err != nil {
		return fmt.Errorf("set consumer QoS: %w", err)
	}

	deliveries, err := channel.Consume(
		queue.Name,
		"notification-service-"+queueName,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf(
			"register consumer %q: %w",
			queueName,
			err,
		)
	}

	log.Printf("Listening for notifications on queue %q", queue.Name)

	for delivery := range deliveries {
		var notification NotificationMessage

		if err := json.Unmarshal(delivery.Body, &notification); err != nil {
			log.Printf(
				"Invalid notification payload from %s: %v",
				queueName,
				err,
			)

			if nackErr := delivery.Nack(false, false); nackErr != nil {
				log.Printf(
					"Failed to reject invalid notification: %v",
					nackErr,
				)
			}

			continue
		}

		if notification.Message == "" {
			notification.Message = notification.Massage
		}

		if notification.Subject == "" {
			notification.Subject = "Notifikasi Sayur-day"
		}

		log.Printf(
			"Notification received: queue=%q email=%q subject=%q",
			queueName,
			notification.Email,
			notification.Subject,
		)

		err := sendEmail(
			notification.Email,
			notification.Subject,
			notification.Message,
		)

		if err != nil {
			log.Printf(
				"Failed to send email to %s: %v",
				notification.Email,
				err,
			)

			if nackErr := delivery.Nack(false, false); nackErr != nil {
				log.Printf(
					"Failed to reject message: %v",
					nackErr,
				)
			}

			continue
		}

		log.Printf(
			"Email successfully sent to %s",
			notification.Email,
		)

		if err := delivery.Ack(false); err != nil {
			log.Printf(
				"Failed to acknowledge notification: %v",
				err,
			)
		}
	}

	return fmt.Errorf(
		"notification delivery channel %q closed",
		queueName,
	)
}

func startHTTPServer() {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(
			http.StatusOK,
			map[string]string{
				"service": "notification-service",
				"status":  "ok",
			},
		)
	})

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8084"
	}

	go func() {
		log.Printf(
			"notification-service HTTP server running on :%s",
			port,
		)

		if err := e.Start(":" + port); err != nil &&
			!errors.Is(err, http.ErrServerClosed) {

			log.Printf(
				"HTTP server error: %v",
				err,
			)
		}
	}()
}

func main() {
	_ = godotenv.Load()

	log.Println(
		"Starting Sayur-day notification-service...",
	)

	startHTTPServer()

	conn, err := connectRabbitMQ()
	if err != nil {
		log.Fatalf(
			"RabbitMQ connection failed: %v",
			err,
		)
	}
	defer conn.Close()

	log.Println(
		"RabbitMQ connected successfully",
	)

	go func() {
		if err := consumeNotifications(
			conn,
			"email_verification",
		); err != nil {
			log.Printf(
				"email verification consumer stopped: %v",
				err,
			)
		}
	}()

	go func() {
		if err := consumeNotifications(
			conn,
			"payment_notification",
		); err != nil {
			log.Printf(
				"payment notification consumer stopped: %v",
				err,
			)
		}
	}()

	stop := make(chan os.Signal, 1)

	signal.Notify(
		stop,
		syscall.SIGINT,
		syscall.SIGTERM,
	)

	<-stop

	log.Println(
		"Stopping notification-service...",
	)
}
