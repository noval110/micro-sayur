package client

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

var ErrOrderNotFound = errors.New("order tidak ditemukan")

type OrderClient interface {
	GetOrderByID(int) (*Order, error)
	UpdateOrderStatus(int, string) error
}

type Order struct {
	ID         int     `json:"id"`
	UserID     int     `json:"user_id"`
	TotalPrice float64 `json:"total_price"`
	Status     string  `json:"status"`
}

type orderClient struct {
	baseURL     string
	internalKey string
	httpClient  *http.Client
}

func NewOrderClient(
	baseURL,
	internalKey string,
) OrderClient {

	return &orderClient{
		baseURL:     baseURL,
		internalKey: internalKey,

		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// ==========================================
// GET ORDER BY ID
// INTERNAL SERVICE
// ==========================================

func (c *orderClient) GetOrderByID(
	orderID int,
) (*Order, error) {

	url :=
		fmt.Sprintf(
			"%s/internal/orders/%d",
			c.baseURL,
			orderID,
		)

	req, err :=
		http.NewRequest(
			http.MethodGet,
			url,
			nil,
		)

	if err != nil {
		return nil, err
	}

	// Internal authentication
	req.Header.Set(
		"X-Internal-Key",
		c.internalKey,
	)

	resp, err :=
		c.httpClient.Do(req)

	if err != nil {
		return nil,
			fmt.Errorf(
				"gagal menghubungi order-service: %w",
				err,
			)
	}

	defer resp.Body.Close()

	// ========================================
	// NOT FOUND
	// ========================================

	if resp.StatusCode ==
		http.StatusNotFound {

		return nil,
			ErrOrderNotFound
	}

	// ========================================
	// OTHER ERROR
	// ========================================

	if resp.StatusCode !=
		http.StatusOK {

		var errorResponse struct {
			Message string `json:"message"`
		}

		_ =
			json.NewDecoder(
				resp.Body,
			).Decode(
				&errorResponse,
			)

		if errorResponse.Message != "" {
			return nil,
				errors.New(
					errorResponse.Message,
				)
		}

		return nil,
			fmt.Errorf(
				"order-service merespons %s",
				resp.Status,
			)
	}

	// ========================================
	// SUCCESS
	// ========================================

	var response struct {
		Data Order `json:"data"`
	}

	if err :=
		json.NewDecoder(
			resp.Body,
		).Decode(
			&response,
		); err != nil {

		return nil,
			fmt.Errorf(
				"gagal membaca response order-service: %w",
				err,
			)
	}

	return &response.Data, nil
}

// ==========================================
// UPDATE ORDER STATUS
// INTERNAL SERVICE
// ==========================================

func (c *orderClient) UpdateOrderStatus(
	orderID int,
	status string,
) error {

	body, err :=
		json.Marshal(
			map[string]string{
				"status": status,
			},
		)

	if err != nil {
		return err
	}

	url :=
		fmt.Sprintf(
			"%s/internal/orders/%d/status",
			c.baseURL,
			orderID,
		)

	req, err :=
		http.NewRequest(
			http.MethodPatch,
			url,
			bytes.NewBuffer(body),
		)

	if err != nil {
		return err
	}

	req.Header.Set(
		"Content-Type",
		"application/json",
	)

	req.Header.Set(
		"X-Internal-Key",
		c.internalKey,
	)

	resp, err :=
		c.httpClient.Do(req)

	if err != nil {
		return fmt.Errorf(
			"gagal menghubungi order-service: %w",
			err,
		)
	}

	defer resp.Body.Close()

	if resp.StatusCode !=
		http.StatusOK {

		var errorResponse struct {
			Message string `json:"message"`
		}

		_ =
			json.NewDecoder(
				resp.Body,
			).Decode(
				&errorResponse,
			)

		if errorResponse.Message != "" {
			return errors.New(
				errorResponse.Message,
			)
		}

		return fmt.Errorf(
			"order-service merespons %s",
			resp.Status,
		)
	}

	return nil
}
