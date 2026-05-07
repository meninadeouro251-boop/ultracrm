package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"ultra-ai-core-service/internal/httpclient/response"
	"ultra-ai-core-service/internal/services"

	"github.com/gin-gonic/gin"
)

type UltraAuthMiddleware interface {
	GetUltraAuthMiddleware() gin.HandlerFunc
}

type ultraAuthMiddleware struct {
	authService services.UltraAuthService
}

func NewUltraAuthMiddleware(ultraAuthBaseURL string) UltraAuthMiddleware {
	return &ultraAuthMiddleware{
		authService: services.NewUltraAuthService(ultraAuthBaseURL),
	}
}

func (m *ultraAuthMiddleware) GetUltraAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for Bearer token first (priority)
		bearerToken := m.extractBearerToken(c)
		apiAccessToken := m.extractApiAccessToken(c)

		var token string
		var tokenType string

		// Bearer token takes priority
		if bearerToken != "" {
			token = bearerToken
			tokenType = "bearer"
		} else if apiAccessToken != "" {
			token = apiAccessToken
			tokenType = "api_access_token"
		} else {
			fmt.Printf("UltraAuth: No authentication token found\n")
			response.ErrorResponse(c, "UNAUTHORIZED", "Authentication token required", nil, http.StatusUnauthorized)
			c.Abort()
			return
		}

		fmt.Printf("UltraAuth: Using %s token for validation\n", tokenType)

		tokenDataResponse, err := m.authService.ValidateToken(c.Request.Context(), token, tokenType)
		if err != nil {
			fmt.Printf("UltraAuth: Token validation failed: %v\n", err)
			response.ErrorResponse(c, "INVALID_TOKEN", "Invalid "+tokenType+" token", nil, http.StatusUnauthorized)
			c.Abort()
			return
		}

		// Add information to the context
		ctx := context.WithValue(c.Request.Context(), "user_id", tokenDataResponse.User.ID)
		ctx = context.WithValue(ctx, "email", tokenDataResponse.User.Email)
		ctx = context.WithValue(ctx, "name", tokenDataResponse.User.Name)
		ctx = context.WithValue(ctx, "token", token)
		ctx = context.WithValue(ctx, "token_type", tokenType)
		ctx = context.WithValue(ctx, "user", tokenDataResponse.User)
		ctx = context.WithValue(ctx, "role", tokenDataResponse.User.Role)
		ctx = context.WithValue(ctx, "type", tokenDataResponse.User.Type)

		// Add api_access_token for ultralution API calls
		// For now, we'll use the Bearer token as api_access_token
		// This should be replaced with actual user's api_access_token from database
		ctx = context.WithValue(ctx, "api_access_token", token)

		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func (m *ultraAuthMiddleware) extractBearerToken(c *gin.Context) string {
	if auth := c.GetHeader("Authorization"); auth != "" {
		if strings.HasPrefix(auth, "Bearer ") {
			return strings.TrimPrefix(auth, "Bearer ")
		}
	}
	return ""
}

func (m *ultraAuthMiddleware) extractApiAccessToken(c *gin.Context) string {
	// Check for api_access_token header (without Bearer prefix)
	if token := c.GetHeader("api_access_token"); token != "" {
		return token
	}
	if token := c.GetHeader("HTTP_API_ACCESS_TOKEN"); token != "" {
		return token
	}
	return ""
}
