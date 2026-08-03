package client

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

var ErrOrderNotFound = errors.New("order tidak ditemukan")

type OrderClient interface {
	GetOrderByID(orderID int) (*Order, error)
	UpdateOrderStatus(orderID int, status string) error
}

type Order struct {
	ID         int     `json:"id"`
	TotalPrice float64 `json:"total_price"`
	Status     string  `json:"status"`
}

type orderClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewOrderClient(baseURL string) OrderClient {
	return &orderClient{
		baseURL:    baseURL,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *orderClient) GetOrderByID(orderID int) (*Order, error) {
	endpoint := fmt.Sprintf("%s/orders/%d", c.baseURL, orderID)
	resp, err := c.httpClient.Get(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrOrderNotFound
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gagal mengambil order ID %d: order-service merespons %s", orderID, resp.Status)
	}

	var response struct {
		Data Order `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("gagal membaca respons order-service: %w", err)
	}

	return &response.Data, nil
}

func (c *orderClient) UpdateOrderStatus(orderID int, status string) error {
	endpoint := fmt.Sprintf("%s/orders/%d/status", c.baseURL, orderID)
	requestURL, err := url.Parse(endpoint)
	if err != nil {
		return err
	}

	query := requestURL.Query()
	query.Set("status", status)
	requestURL.RawQuery = query.Encode()

	req, err := http.NewRequest(http.MethodPatch, requestURL.String(), nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("gagal mengupdate status order ID %d: order-service merespons %s", orderID, resp.Status)
	}

	return nil
}
