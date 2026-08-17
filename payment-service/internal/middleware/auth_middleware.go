package middleware

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	userServiceURL string
	client         *http.Client
}

type AuthResponse struct {
	Data struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	} `json:"data"`
}

func NewAuthMiddleware() *AuthMiddleware {
	url := os.Getenv("USER_SERVICE_URL")
	if url == "" {
		url = "http://user_service_container:8084"
	}
	return &AuthMiddleware{userServiceURL: url, client: &http.Client{Timeout: 5 * time.Second}}
}

func (m *AuthMiddleware) Authenticated(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, echo.Map{"message": "missing authorization token"})
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid authorization format"})
		}
		req, err := http.NewRequest(http.MethodGet, m.userServiceURL+"/auth/check", nil)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"message": "failed to create authentication request"})
		}
		req.Header.Set("Authorization", authHeader)
		resp, err := m.client.Do(req)
		if err != nil {
			return c.JSON(http.StatusServiceUnavailable, echo.Map{"message": "user-service tidak tersedia"})
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid or expired session"})
		}
		var authResponse AuthResponse
		if err := json.NewDecoder(resp.Body).Decode(&authResponse); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"message": "invalid auth response"})
		}
		userID, err := strconv.Atoi(authResponse.Data.UserID)
		if err != nil || userID < 1 {
			return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid user session"})
		}
		c.Set("user_id", userID)
		c.Set("user_role", authResponse.Data.Role)
		return next(c)
	}
}
