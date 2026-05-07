package apiKey

import (
	"ultra-ai-core-service/pkg/api_key/handler"
	"ultra-ai-core-service/pkg/api_key/repository"
	"ultra-ai-core-service/pkg/api_key/service"

	"gorm.io/gorm"
)

type Module struct {
	Handler handler.ApiKeyHandler
	Service service.ApiKeyService
	Repo    repository.ApiKeyRepository
}

func New(db *gorm.DB, encryptionKey string) *Module {
	r := repository.NewApiKeyRepository(db)
	s := service.NewApiKeyService(r)
	h := handler.NewApiKeyHandler(s, encryptionKey)

	return &Module{
		Handler: h,
		Service: s,
		Repo:    r,
	}
}
