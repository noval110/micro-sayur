package client

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type ProductResponse struct {
	Data struct {
		ID    int     `json:"id"`
		Name  string  `json:"name"`
		Price float64 `json:"price"`
		Stock int     `json:"stock"`
	} `json:"data"`

	Message string `json:"message"`
}

type ProductClient interface {
	GetProductByID(productID int) (*ProductResponse, error)
	ReduceStock(productID int, quantity int) error
}

type productClient struct {
	baseURL     string
	internalKey string
	httpClient  *http.Client
}

func NewProductClient(
	baseURL string,
	internalKey string,
) ProductClient {

	return &productClient{
		baseURL:     baseURL,
		internalKey: internalKey,

		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}
func (c *productClient) GetProductByID(
	productID int,
) (*ProductResponse, error) {

	url := fmt.Sprintf(
		"%s/products/%d",
		c.baseURL,
		productID,
	)

	req, err := http.NewRequest(
		http.MethodGet,
		url,
		nil,
	)

	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf(
			"gagal menghubungi product-service: %w",
			err,
		)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf(
			"produk ID %d tidak ditemukan (status: %d)",
			productID,
			resp.StatusCode,
		)
	}

	var productResp ProductResponse

	if err := json.NewDecoder(
		resp.Body,
	).Decode(
		&productResp,
	); err != nil {

		return nil, fmt.Errorf(
			"gagal membaca response product-service: %w",
			err,
		)
	}

	return &productResp, nil
}
func (c *productClient) ReduceStock(
	productID int,
	quantity int,
) error {

	url := fmt.Sprintf(
		"%s/internal/products/%d/reduce-stock",
		c.baseURL,
		productID,
	)

	payload, err := json.Marshal(
		map[string]int{
			"quantity": quantity,
		},
	)

	if err != nil {
		return err
	}

	req, err := http.NewRequest(
		http.MethodPatch,
		url,
		bytes.NewBuffer(payload),
	)

	if err != nil {
		return err
	}

	req.Header.Set(
		"Content-Type",
		"application/json",
	)

	// Auth antar-service
	req.Header.Set(
		"X-Internal-Key",
		c.internalKey,
	)

	resp, err := c.httpClient.Do(req)

	if err != nil {
		return fmt.Errorf(
			"gagal menghubungi product-service: %w",
			err,
		)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {

		var errorResponse struct {
			Message string `json:"message"`
		}

		_ = json.NewDecoder(
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
			"gagal mengurangi stok produk ID %d (status: %d)",
			productID,
			resp.StatusCode,
		)
	}

	return nil
}
