package agent_integration

import (
	"ultra-ai-core-service/pkg/agent_integration/handler"
	"ultra-ai-core-service/pkg/agent_integration/repository"
	"ultra-ai-core-service/pkg/agent_integration/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func InitModule(db *gorm.DB, router gin.IRouter) {
	// Initialize repository
	agentIntegrationRepository := repository.NewAgentIntegrationRepository(db)

	// Initialize service
	agentIntegrationService := service.NewAgentIntegrationService(agentIntegrationRepository)

	// Initialize handler and register routes
	agentIntegrationHandler := handler.NewAgentIntegrationHandler(agentIntegrationService)
	agentIntegrationHandler.RegisterRoutesMiddleware(router)
}
