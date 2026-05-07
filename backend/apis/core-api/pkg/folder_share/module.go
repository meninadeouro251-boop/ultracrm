package folderShare

import (
	folderService "ultra-ai-core-service/pkg/folder/service"
	"ultra-ai-core-service/pkg/folder_share/handler"
	"ultra-ai-core-service/pkg/folder_share/repository"
	"ultra-ai-core-service/pkg/folder_share/service"

	"gorm.io/gorm"
)

type Module struct {
	Handler handler.FolderShareHandler
	Service service.FolderShareService
	Repo    repository.FolderShareRepository
}

func New(
	db *gorm.DB,
	folderService folderService.FolderService,
) *Module {
	r := repository.NewFolderShareRepository(db)
	s := service.NewFolderShareService(r, folderService)
	h := handler.NewFolderShareHandler(s, folderService)

	return &Module{
		Handler: h,
		Service: s,
		Repo:    r,
	}
}
