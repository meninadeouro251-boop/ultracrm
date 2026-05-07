# ============================================================
# Script de Instalacao Oficial do Ultra CRM Community
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Ultra CRM Community - Instalacao Oficial" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Passo 0: Verificar Docker
Write-Host "[Passo 0] Verificando Docker Desktop..." -ForegroundColor Cyan
$dockerTest = docker info 2>&1

if ($dockerTest -match "failed|error|Error") {
    Write-Host ""
    Write-Host "ERRO: Docker Desktop nao esta rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Faca o seguinte:" -ForegroundColor Yellow
    Write-Host "  1. Abra o Docker Desktop como Administrador" -ForegroundColor White
    Write-Host "  2. Aguarde o icone da baleia ficar verde" -ForegroundColor White
    Write-Host "  3. Execute este script novamente" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "Docker Desktop esta rodando!" -ForegroundColor Green
Write-Host ""

# Passo 1: Verificar .env
$envFile = ".env"
if (-Not (Test-Path $envFile)) {
    Write-Host "[Passo 1] Criando arquivo .env..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "Arquivo .env criado!" -ForegroundColor Green
} else {
    Write-Host "[Passo 1] Arquivo .env ja existe!" -ForegroundColor Green
}
Write-Host ""

# Passo 2: Verificar submodulos
Write-Host "[Passo 2] Verificando submodulos Git..." -ForegroundColor Cyan
git submodule update --init --recursive
Write-Host "Submodulos verificados!" -ForegroundColor Green
Write-Host ""

# Passo 3: Atualizar submodulos
Write-Host "[Passo 3] Atualizando submodulos..." -ForegroundColor Cyan
git submodule update --remote --merge
Write-Host "Submodulos atualizados!" -ForegroundColor Green
Write-Host ""

# Passo 4: Docker Compose
Write-Host "[Passo 4] Preparando Docker Compose..." -ForegroundColor Cyan
Write-Host "Usando Docker Compose diretamente (sem make)" -ForegroundColor Green
Write-Host ""

# Passo 5: Executar setup
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "[Passo 5] Executando setup com Docker Compose..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este processo pode levar 15-20 minutos na primeira vez!" -ForegroundColor Yellow
Write-Host ""
Write-Host "O que vai acontecer:" -ForegroundColor Yellow
Write-Host "  1. Construir imagens Docker de todos os servicos" -ForegroundColor White
Write-Host "  2. Subir o banco de dados e aguardar estar pronto" -ForegroundColor White
Write-Host "  3. Criar tabelas e popular dados iniciais" -ForegroundColor White
Write-Host "  4. Iniciar todos os servicos" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Yellow
pause

Write-Host ""
Write-Host "Iniciando setup..." -ForegroundColor Green
Write-Host ""

# Step 1: Build
Write-Host "[1/4] Construindo imagens Docker..." -ForegroundColor Cyan
docker compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir imagens!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Start database
Write-Host "[2/4] Iniciando banco de dados..." -ForegroundColor Cyan
docker compose up -d postgres redis mailhog
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao iniciar banco de dados!" -ForegroundColor Red
    exit 1
}
Write-Host "Aguardando PostgreSQL estar pronto (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# Step 3: Seeds
Write-Host "[3/4] Executando seeds (dados iniciais)..." -ForegroundColor Cyan
Write-Host "Seeding Auth service..." -ForegroundColor Yellow
docker compose run --rm ultra-auth bash -c "bundle exec rails db:prepare && bundle exec rails db:seed"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aviso: Erro no seed do Auth (pode ser normal)" -ForegroundColor Yellow
}

Write-Host "Seeding CRM service..." -ForegroundColor Yellow
docker compose run --rm ultra-crm bash -c "bundle exec rails db:prepare && bundle exec rails db:seed"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aviso: Erro no seed do CRM (pode ser normal)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Start all
Write-Host "[4/4] Iniciando todos os servicos..." -ForegroundColor Cyan
docker compose up -d
$setupResult = $LASTEXITCODE

Write-Host ""
if ($setupResult -eq 0) {
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "SETUP CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acesse a plataforma:" -ForegroundColor Cyan
    Write-Host "   http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "Servicos disponiveis:" -ForegroundColor Cyan
    Write-Host "   Frontend:      http://localhost:5173" -ForegroundColor White
    Write-Host "   CRM API:       http://localhost:3000" -ForegroundColor White
    Write-Host "   Auth API:      http://localhost:3001" -ForegroundColor White
    Write-Host "   Processor API: http://localhost:8000" -ForegroundColor White
    Write-Host "   Core API:      http://localhost:5555" -ForegroundColor White
    Write-Host "   Mailhog:       http://localhost:8025" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "ERRO NO SETUP!" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Codigo de erro: $setupResult" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para ver os logs:" -ForegroundColor Yellow
    Write-Host "   docker compose logs -f" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
pause
