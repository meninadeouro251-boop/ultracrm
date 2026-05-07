package core

import (
	"ultra-ai-core-service/internal/config"
	"ultra-ai-core-service/pkg/core/service"

	"gorm.io/gorm"
)

// Module represents the core module
type Module struct {
	HealthService service.HealthService
}

// New creates a new core module
func New(db *gorm.DB, healthConfig *config.HealthCheckConfig) *Module {
	healthService := service.NewHealthService(db, healthConfig)

	return &Module{
		HealthService: healthService,
	}
}
