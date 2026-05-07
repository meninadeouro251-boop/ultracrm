# Script de Configuração do Supabase para Windows
# Execute este script após despausar o Docker Desktop

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 Configurando Integração com Supabase" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Docker está rodando
Write-Host "🔍 Verificando status do Docker..." -ForegroundColor Yellow
$dockerStatus = docker info 2>&1

if ($dockerStatus -match "error|Error") {
    Write-Host ""
    Write-Host "❌ ERRO: Docker não está rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, despause o Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  1. Clique no ícone da baleia na barra de tarefas" -ForegroundColor Yellow
    Write-Host "  2. Clique em 'Resume' ou 'Start'" -ForegroundColor Yellow
    Write-Host "  3. Aguarde o Docker iniciar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Depois execute este script novamente." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Docker está rodando!" -ForegroundColor Green
Write-Host ""

# Verificar se o arquivo .env existe
$envFile = ".env"
if (-Not (Test-Path $envFile)) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "   Copie .env.example para .env primeiro" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Verificar configuração do Supabase no .env
Write-Host "🔍 Verificando configuração do Supabase no .env..." -ForegroundColor Yellow
$supabaseConfig = Select-String -Path $envFile -Pattern "SUPABASE_OAUTH_REDIRECT_URI"

if ($supabaseConfig) {
    Write-Host "✅ SUPABASE_OAUTH_REDIRECT_URI configurado no .env" -ForegroundColor Green
    Write-Host "   $($supabaseConfig.Line)" -ForegroundColor Gray
} else {
    Write-Host "⚠️  AVISO: SUPABASE_OAUTH_REDIRECT_URI não encontrado no .env" -ForegroundColor Yellow
    Write-Host "   Adicionando automaticamente..." -ForegroundColor Yellow
    
    # Adicionar configuração ao final do arquivo
    Add-Content -Path $envFile -Value ""
    Add-Content -Path $envFile -Value "# ============================================================================="
    Add-Content -Path $envFile -Value "# SUPABASE INTEGRATION"
    Add-Content -Path $envFile -Value "# ============================================================================="
    Add-Content -Path $envFile -Value "SUPABASE_OAUTH_REDIRECT_URI=http://localhost:8000/integrations/supabase/callback"
    
    Write-Host "✅ Configuração adicionada ao .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Execute os serviços com Docker:" -ForegroundColor Yellow
Write-Host "   docker compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure o Supabase no painel:" -ForegroundColor Yellow
Write-Host "   - Acesse: https://supabase.com/dashboard/project/ionwsfoweyitgobtjyh" -ForegroundColor White
Write-Host "   - Vá em Settings > API" -ForegroundColor White
Write-Host "   - Em 'OAuth Redirect URLs', adicione:" -ForegroundColor White
Write-Host "     http://localhost:8000/integrations/supabase/callback" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Execute o script de configuração do CRM:" -ForegroundColor Yellow
Write-Host "   docker compose run --rm ultra-crm bash -c 'ruby config/supabase_setup.rb'" -ForegroundColor White
Write-Host ""
Write-Host "4. Acesse o frontend:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host "   - Vá em AI Agents > Integrações > Supabase" -ForegroundColor White
Write-Host "   - Clique em 'Conectar com Supabase'" -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ Configuração do arquivo .env concluída!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
