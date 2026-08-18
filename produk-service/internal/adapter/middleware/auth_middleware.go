package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	userServiceURL string
	client         *http.Client
}

func NewAuthMiddleware() *AuthMiddleware {
	userServiceURL := os.Getenv("USER_SERVICE_URL")

	if userServiceURL == "" {
		userServiceURL = "http://127.0.0.1:8080"
	}

	return &AuthMiddleware{
		userServiceURL: userServiceURL,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// AdminOnly mengecek token user ke user-service.
// user-service /admin/check akan:
// - 401 jika token tidak valid
// - 403 jika bukan Super Admin
// - 200 jika Super Admin
func (m *AuthMiddleware) AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")

		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"message": "missing authorization token",
				"data":    nil,
			})
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"message": "invalid authorization format",
				"data":    nil,
			})
		}

		req, err := http.NewRequest(
			http.MethodGet,
			m.userServiceURL+"/admin/check",
			nil,
		)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"message": "failed to create authentication request",
				"data":    nil,
			})
		}

		req.Header.Set("Authorization", authHeader)

		resp, err := m.client.Do(req)
		if err != nil {
			return c.JSON(http.StatusServiceUnavailable, map[string]interface{}{
				"message": "authentication service unavailable",
				"data":    nil,
			})
		}
		defer resp.Body.Close()

		switch resp.StatusCode {
		case http.StatusOK:
			return next(c)

		case http.StatusUnauthorized:
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"message": "unauthorized",
				"data":    nil,
			})

		case http.StatusForbidden:
			return c.JSON(http.StatusForbidden, map[string]interface{}{
				"message": "admin access required",
				"data":    nil,
			})

		default:
			return c.JSON(http.StatusServiceUnavailable, map[string]interface{}{
				"message": "failed to verify admin access",
				"data":    nil,
			})
		}
	}
}
