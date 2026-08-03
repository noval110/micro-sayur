package client

import (
	"bytes"
	"encoding/json"
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
	baseURL    string
	httpClient *http.Client
}

func NewProductClient(baseURL string) ProductClient {
	return &productClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (c *productClient) GetProductByID(productID int) (*ProductResponse, error) {
	url := fmt.Sprintf("%s/products/%d", c.baseURL, productID)
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("produk ID %d tidak ditemukan (status: %d)", productID, resp.StatusCode)
	}

	var productResp ProductResponse
	if err := json.NewDecoder(resp.Body).Decode(&productResp); err != nil {
		return nil, err
	}

	return &productResp, nil
}

func (c *productClient) ReduceStock(productID int, quantity int) error {
	url := fmt.Sprintf("%s/products/%d/reduce-stock", c.baseURL, productID)
	payload, err := json.Marshal(map[string]int{"quantity": quantity})
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("gagal mengurangi stok produk ID %d (status: %d)", productID, resp.StatusCode)
	}

	return nil
}
