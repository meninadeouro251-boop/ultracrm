package types

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UltraAuthUser represents the user data from /api/v1/me response
type UltraAuthUser struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	DisplayName  *string   `json:"display_name"`
	Availability string    `json:"availability"`
	MFAEnabled   bool      `json:"mfa_enabled"`
	Confirmed    bool      `json:"confirmed"`
	Type         string    `json:"type"`
	Role         *Role     `json:"role"`
}

type UltraAuthFeature struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type UltraAuthPlan struct {
	ID       uuid.UUID        `json:"id"`
	PlanName string           `json:"name"`
	IsActive bool             `json:"is_active"`
	IsCustom bool             `json:"is_custom"`
	StartsAt string           `json:"starts_at"`
	EndsAt   string           `json:"ends_at"`
	Features []UltraAuthFeature `json:"features"`
}

// UltraAuthAccount represents an account from /api/v1/me response
type UltraAuthAccount struct {
	ID         uuid.UUID        `json:"id"`
	Name       string           `json:"name"`
	Status     string           `json:"status"`
	Locale     string           `json:"locale"`
	CreatedAt  string           `json:"created_at"`
	UpdatedAt  string           `json:"updated_at"`
	Features   json.RawMessage  `json:"features"`
	ActivePlan *UltraAuthPlan     `json:"active_plan,omitempty"`
}

// UltraAuthValidateToken represents the complete response from /api/v1/me
type UltraAuthValidateToken struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data"`
}

type UltraAuthValidateTokenData struct {
	User     UltraAuthUser      `json:"user"`
	Accounts []UltraAuthAccount `json:"accounts"`
}

// PermissionResponse representa a resposta da API de validação de permissão
type PermissionResponse struct {
	HasPermission bool   `json:"has_permission"`
	PermissionKey string `json:"permission_key"`
	Message       string `json:"message,omitempty"`
}

// PermissionRequest representa a requisição para validação de permissão via POST
type PermissionRequest struct {
	PermissionKey string `json:"permission_key" binding:"required"`
}

// PermissionChecker interface para validação de permissões
type PermissionChecker interface {
	RequirePermission(resource, action string) gin.HandlerFunc
	CheckPermission(authToken, permissionKey string) (bool, error)
}

type Role struct {
	ID   uuid.UUID `json:"id"`
	Key  string    `json:"key"`
	Name string    `json:"name"`
}
