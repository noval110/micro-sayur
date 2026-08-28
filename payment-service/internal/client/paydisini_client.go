package client

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const PaydisiniURL = "https://api.paydisini.co.id/v1/"

type PaydisiniClient interface {
	CreateTransaction(uniqueCode string, amount float64, note string) (*json.RawMessage, error)
	CheckTransactionStatus(uniqueCode string) (string, error)
}

type paydisiniClient struct {
	apiKey string
}

func NewPaydisiniClient() PaydisiniClient {
	return &paydisiniClient{
		apiKey: os.Getenv("PAYDISINI_KEY"),
	}
}

func (c *paydisiniClient) CreateTransaction(uniqueCode string, amount float64, note string) (*json.RawMessage, error) {
	amountStr := fmt.Sprintf("%.0f", amount)
	serviceID := "11" // QRIS Merchant
	validTime := "1800"

	// md5(key . unique_code . service . amount . valid_time . 'NewTransaction')
	signatureStr := c.apiKey + uniqueCode + serviceID + amountStr + validTime + "NewTransaction"
	signature := fmt.Sprintf("%x", md5.Sum([]byte(signatureStr)))

	data := url.Values{}
	data.Set("key", c.apiKey)
	data.Set("request", "new")
	data.Set("unique_code", uniqueCode)
	data.Set("service", serviceID)
	data.Set("amount", amountStr)
	data.Set("note", note)
	data.Set("valid_time", validTime)
	data.Set("type_fee", "2")
	data.Set("payment_guide", "true")
	data.Set("signature", signature)

	req, err := http.NewRequest("POST", PaydisiniURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var response struct {
		Success bool            `json:"success"`
		Msg     string          `json:"msg"`
		Data    json.RawMessage `json:"data"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to parse paydisini response: %v", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("paydisini error: %s", response.Msg)
	}

	return &response.Data, nil
}

func (c *paydisiniClient) CheckTransactionStatus(uniqueCode string) (string, error) {
	// md5(key . unique_code . 'StatusTransaction')
	signatureStr := c.apiKey + uniqueCode + "StatusTransaction"
	signature := fmt.Sprintf("%x", md5.Sum([]byte(signatureStr)))

	data := url.Values{}
	data.Set("key", c.apiKey)
	data.Set("request", "status")
	data.Set("unique_code", uniqueCode)
	data.Set("signature", signature)

	req, err := http.NewRequest("POST", PaydisiniURL, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	var response struct {
		Success bool `json:"success"`
		Msg     string `json:"msg"`
		Data    struct {
			Status string `json:"status"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return "", fmt.Errorf("failed to parse paydisini response: %v", err)
	}

	if !response.Success {
		return "", fmt.Errorf("paydisini error: %s", response.Msg)
	}

	return response.Data.Status, nil
}
