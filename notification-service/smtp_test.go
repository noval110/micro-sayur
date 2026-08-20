package main

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestSMTP(t *testing.T) {
	_ = godotenv.Load()

	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM_EMAIL")

	to := "EMAIL_KAMU@gmail.com"

	subject := "Subject: Test Email Sayur-day\r\n"
	mime := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n"

	body := `
	<html>
		<body style="font-family:Arial,sans-serif">
			<h2 style="color:#16a34a">Sayur-day</h2>
			<p>Halo!</p>
			<p>Ini adalah test email dari notification-service Sayur-day.</p>
			<p>Kalau email ini masuk, berarti konfigurasi SMTP berhasil.</p>
		</body>
	</html>
	`

	message := []byte(
		"From: Sayur-day <" + from + ">\r\n" +
			"To: " + to + "\r\n" +
			subject +
			mime +
			"\r\n" +
			body,
	)

	address := fmt.Sprintf("%s:%s", host, port)

	conn, err := tls.Dial(
		"tcp",
		address,
		&tls.Config{
			ServerName: host,
			MinVersion: tls.VersionTLS12,
		},
	)

	if err != nil {
		t.Fatalf("TLS connection failed: %v", err)
	}

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		t.Fatalf("SMTP client failed: %v", err)
	}
	defer client.Close()

	auth := smtp.PlainAuth(
		"",
		username,
		password,
		host,
	)

	if err := client.Auth(auth); err != nil {
		t.Fatalf("SMTP auth failed: %v", err)
	}

	if err := client.Mail(from); err != nil {
		t.Fatalf("MAIL FROM failed: %v", err)
	}

	if err := client.Rcpt(to); err != nil {
		t.Fatalf("RCPT TO failed: %v", err)
	}

	writer, err := client.Data()
	if err != nil {
		t.Fatalf("DATA failed: %v", err)
	}

	if _, err := writer.Write(message); err != nil {
		t.Fatalf("write failed: %v", err)
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("close failed: %v", err)
	}

	if err := client.Quit(); err != nil {
		t.Logf("quit warning: %v", err)
	}

	t.Log("Test email berhasil dikirim ke:", to)
}