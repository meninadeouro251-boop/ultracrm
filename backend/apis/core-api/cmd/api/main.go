package main

import (
	"context"
	"ultra-ai-core-service/internal/config"
	"ultra-ai-core-service/internal/infra/postgres"
	"ultra-ai-core-service/internal/middleware"
	"ultra-ai-core-service/internal/telemetry"
	agentModule "ultra-ai-core-service/pkg/agent"
	agentIntegrationModule "ultra-ai-core-service/pkg/agent_integration"
	apiKeyModule "ultra-ai-core-service/pkg/api_key"
	coreModule "ultra-ai-core-service/pkg/core"
	systemHandler "ultra-ai-core-service/pkg/core/handler"
	customMcpServerModule "ultra-ai-core-service/pkg/custom_mcp_server"
	customToolModule "ultra-ai-core-service/pkg/custom_tool"
	folderModule "ultra-ai-core-service/pkg/folder"
	folderShareModule "ultra-ai-core-service/pkg/folder_share"
	mcpServerModule "ultra-ai-core-service/pkg/mcp_server"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"

)

func main() {
	var devMode = flag.Bool("dev", false, "Run in development mode")
	flag.Parse()

	if *devMode {
		err := godotenv.Load(".env")
		if err != nil {
			log.Printf("Warning: Could not load .env file: %v", err)
		}
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize OpenTelemetry tracing
	ctx := context.Background()
	shutdownTracer, err := telemetry.InitTracer(ctx)
	if err != nil {
		log.Printf("Warning: Failed to initialize OpenTelemetry tracing: %v", err)
	} else {
		// Register shutdown handler for graceful tracer shutdown
		go func() {
			sigChan := make(chan os.Signal, 1)
			signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
			<-sigChan
			if shutdownTracer != nil {
				if err := shutdownTracer(ctx); err != nil {
					log.Printf("Error shutting down tracer: %v", err)
				}
			}
			os.Exit(0)
		}()
	}

	// Initialize database
	db := postgres.ConnectGorm(&cfg.DB)

	// Initialize UltraAuth middleware
	ultraAuthMiddleware := middleware.NewUltraAuthMiddleware(cfg.UltraAuth.BaseURL)

	// Initialize global Permission middleware
	middleware.InitializePermissionMiddleware(cfg.UltraAuth.BaseURL)

	// Initialize modules
	coreModule := coreModule.New(db, &cfg.HealthCheck)
	mcpServerModule := mcpServerModule.New(db)
	customToolModule := customToolModule.New(db)
	customMcpServerModule := customMcpServerModule.New(db, &cfg.AIProcessorService)
	apiKeyModule := apiKeyModule.New(db, cfg.Core.EncryptionKey)
	folderModule := folderModule.New(db)
	folderShareModule := folderShareModule.New(db, folderModule.Service)
	agentModule := agentModule.New(
		db,
		&cfg.AIProcessorService,
		folderModule.Service,
		apiKeyModule.Service,
		mcpServerModule.Service,
		customToolModule.Service,
		customMcpServerModule.Service,
		folderShareModule.Service,
	)

	// Initialize handlers
	systemHandler := systemHandler.NewSystemHandler(coreModule.HealthService)

	// Setup routes with custom logging configuration
	router := gin.New()
	router.RedirectTrailingSlash = false
	router.RedirectFixedPath = false

	// Add recovery middleware
	router.Use(gin.Recovery())

	// Add OpenTelemetry tracing middleware (if enabled)
	if os.Getenv("OTEL_TRACES_ENABLED") == "true" {
		router.Use(otelgin.Middleware("ultra-ai-core-service"))
	}

	// Add custom logger that skips health check and metrics endpoints
	router.Use(gin.LoggerWithConfig(gin.LoggerConfig{
		SkipPaths: []string{"/health", "/ready", "/metrics"},
	}))

	// Add rate limiting middleware with configuration
	router.Use(middleware.GlobalRateLimitMiddleware(cfg.RateLimit.GlobalRPS, cfg.RateLimit.GlobalBurst))
	router.Use(middleware.RateLimitMiddleware(cfg.RateLimit.ClientRPS, cfg.RateLimit.ClientBurst))

	// Add CORS middleware
	corsConfig := middleware.CORSConfig(cfg.UltraCRM.BaseURL)
	router.Use(middleware.CORS(corsConfig))

	// System routes (health and ready checks)
	systemHandler.RegisterRoutes(router)

	// API v1 routes with UltraAuth authentication
	v1 := router.Group("/api/v1")
	v1.Use(ultraAuthMiddleware.GetUltraAuthMiddleware())
	{
		customToolModule.Handler.RegisterRoutesMiddleware(v1)
		customMcpServerModule.Handler.RegisterRoutesMiddleware(v1)
		mcpServerModule.Handler.RegisterRoutesMiddleware(v1)
		folderModule.Handler.RegisterRoutesMiddleware(v1)
		// Register API keys before agents to ensure /agents/apikeys is captured first
		apiKeyModule.Handler.RegisterRoutesMiddleware(v1)
		agentModule.Handler.RegisterRoutesMiddleware(v1)
		// Register agent integrations routes
		agentIntegrationModule.InitModule(db, v1)
		folderShareModule.Handler.RegisterRoutesMiddleware(v1)
	}

	// Start server with custom logging configuration
	log.Printf("Starting server on %s", fmt.Sprintf(":%s", cfg.Core.Port))
	if err := router.Run(fmt.Sprintf(":%s", cfg.Core.Port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
