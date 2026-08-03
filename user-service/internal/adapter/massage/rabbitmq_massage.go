package massage

import (
	"encoding/json"
	"user-service/config"

	"github.com/labstack/gommon/log"
	"github.com/streadway/amqp"
)

func PublishMassage(email, massage, notif_type string) error {
	conn, err := config.NewConfig().NewRabbitMQ()
	if err != nil {
		log.Errorf("[PublishMassage-1] Failed to connect to RabbitMQ: %v", err)
		return err
	}

	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Errorf("[PublishMassage-2] Failed to open a channel: %v", err)
		return err
	}

	defer ch.Close()

	queue, err := ch.QueueDeclare(
		notif_type,
		true,  
		false, 
		false, 
		false,
		nil,  
	)

	if err != nil {
		log.Errorf("[PublishMassage-3] Failed to declare a queue: %v", err)
		return err
	}

	notification := map[string]string{
		"email": email,
		"massage": massage,
	}

	body, err := json.Marshal(notification)
	if err != nil {
		log.Errorf("[PublishMassage-4] Failed to marshal notification: %v", err)
		return err
	}

	return ch.Publish(
		"",
		queue.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)


}