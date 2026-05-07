package agent

import (
	"ultra-ai-core-service/internal/config"
	"ultra-ai-core-service/pkg/agent/handler"
	"ultra-ai-core-service/pkg/agent/repository"
	"ultra-ai-core-service/pkg/agent/service"
	apiKeyService "ultra-ai-core-service/pkg/api_key/service"
	customMCPServerService "ultra-ai-core-service/pkg/custom_mcp_server/service"
	customToolService "ultra-ai-core-service/pkg/custom_tool/service"
	folderService "ultra-ai-core-service/pkg/folder/service"
	folderShareService "ultra-ai-core-service/pkg/folder_share/service"
	mcpServerService "ultra-ai-core-service/pkg/mcp_server/service"

	"gorm.io/gorm"
)

type Module struct {
	Handler handler.AgentHandler
	Service service.AgentService
	Repo    repository.AgentRepository
}

func New(
	db *gorm.DB,
	aiProcessorServiceConfig *config.AIProcessorServiceConfig,
	folderService folderService.FolderService,
	apiKeyService apiKeyService.ApiKeyService,
	mcpServerService mcpServerService.McpServerService,
	customToolService customToolService.CustomToolService,
	customMCPServerService customMCPServerService.CustomMcpServerService,
	folderShareService folderShareService.FolderShareService,
) *Module {
	r := repository.NewAgentRepository(db)
	agentBotRepo := repository.NewAgentBotRepository(db)
	ultralutionService := service.NewultralutionService(agentBotRepo)
	s := service.NewAgentService(r,
		folderService,
		apiKeyService,
		mcpServerService,
		customToolService,
		customMCPServerService,
		ultralutionService,
		aiProcessorServiceConfig.URL,
	)
	h := handler.NewAgentHandler(s, aiProcessorServiceConfig, folderShareService)

	return &Module{
		Handler: h,
		Service: s,
		Repo:    r,
	}
}
