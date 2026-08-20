package client

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type UserClient interface {
	GetUserByID(int) (*User, error)
}

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type userClient struct {
	baseURL     string
	internalKey string
	httpClient  *http.Client
}

func NewUserClient(
	baseURL,
	internalKey string,
) UserClient {
	return &userClient{
		baseURL:     baseURL,
		internalKey: internalKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *userClient) GetUserByID(
	userID int,
) (*User, error) {
	url := fmt.Sprintf(
		"%s/internal/users/%d",
		c.baseURL,
		userID,
	)

	req, err := http.NewRequest(
		http.MethodGet,
		url,
		nil,
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set(
		"X-Internal-Key",
		c.internalKey,
	)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf(
			"gagal menghubungi user-service: %w",
			err,
		)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, errors.New("user tidak ditemukan")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf(
			"user-service merespons %s",
			resp.Status,
		)
	}

	var response struct {
		Data User `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf(
			"gagal membaca response user-service: %w",
			err,
		)
	}

	return &response.Data, nil
}
