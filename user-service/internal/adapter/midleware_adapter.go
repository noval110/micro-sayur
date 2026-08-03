package adapter

import (
	"net/http"
	"strings"
	"user-service/config"
	"user-service/internal/adapter/handler/response"

	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type MiddlewareAdapterInterface interface {
	CheckToken() echo.MiddlewareFunc
}

type middlewareAdapter struct {
	cfg *config.Config
}

func (m *middlewareAdapter) CheckToken() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			respErr := response.DefaultResponse{}
			redisConn := config.NewRedisClient()
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				log.Errorf("[MiddlewareAdapter-1] CheckToken: %s", "Missing or invalid token")
				respErr.Massage = "missing or invalid token"
				respErr.Data = nil
				return c.JSON(http.StatusUnauthorized, respErr)
			}
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			getSession, err := redisConn.HGetAll(c.Request().Context(), tokenString).Result()
			if err != nil || len(getSession) == 0 {
				log.Errorf("[MiddlewareAdapter-2] CheckToken: %s", err)
				respErr.Massage = err.Error()
				respErr.Data = nil
				return c.JSON(http.StatusUnauthorized, respErr)
			}
			c.Set("user", getSession)
			return next(c)
		}
	}
}

func NewMiddlewareAdapter(cfg *config.Config) MiddlewareAdapterInterface {
	return &middlewareAdapter{
		cfg: cfg,
		
	}
}
