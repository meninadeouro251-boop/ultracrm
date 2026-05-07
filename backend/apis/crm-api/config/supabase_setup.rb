#!/usr/bin/env ruby
# frozen_string_literal: true

# Script para configurar a integração com Supabase
# Execute após o Docker estar rodando:
# docker compose run --rm ultra-crm bash -c "ruby config/supabase_setup.rb"

require_relative '../config/environment'

SUPABASE_REDIRECT_URI = ENV.fetch('SUPABASE_OAUTH_REDIRECT_URI', 'http://localhost:8000/integrations/supabase/callback')

puts "=" * 60
puts "🚀 Configurando Integração com Supabase"
puts "=" * 60
puts ""

# Verificar se a variável está configurada
if ENV['SUPABASE_OAUTH_REDIRECT_URI'].nil?
  puts "⚠️  AVISO: SUPABASE_OAUTH_REDIRECT_URI não está definido no .env"
  puts "   Usando valor padrão: #{SUPABASE_REDIRECT_URI}"
  puts ""
else
  puts "✅ SUPABASE_OAUTH_REDIRECT_URI encontrado no .env"
  puts "   Valor: #{SUPABASE_REDIRECT_URI}"
  puts ""
end

# Salvar no GlobalConfig
begin
  puts "💾 Salvando configuração no banco de dados..."
  
  GlobalConfig.set('SUPABASE_OAUTH_REDIRECT_URI', SUPABASE_REDIRECT_URI)
  
  puts "✅ Configuração salva com sucesso!"
  puts ""
  
  # Verificar se foi salvo corretamente
  saved_value = GlobalConfigService.load('SUPABASE_OAUTH_REDIRECT_URI', nil)
  
  if saved_value
    puts "✅ Verificação: Configuração recuperada com sucesso"
    puts "   Valor salvo: #{saved_value}"
  else
    puts "⚠️  AVISO: Não foi possível verificar a configuração salva"
  end
  
  puts ""
  puts "=" * 60
  puts "📋 PRÓXIMOS PASSOS:"
  puts "=" * 60
  puts ""
  puts "1. No painel do Supabase (https://supabase.com/dashboard):"
  puts "   - Vá em Settings > API"
  puts "   - Em 'OAuth Redirect URLs', adicione:"
  puts "     #{SUPABASE_REDIRECT_URI}"
  puts ""
  puts "2. Reinicie os serviços:"
  puts "   docker compose restart"
  puts ""
  puts "3. Acesse o frontend e configure a integração:"
  puts "   - Vá em AI Agents > Selecionar Agente > Integrações > Supabase"
  puts "   - Clique em 'Conectar com Supabase'"
  puts ""
  puts "=" * 60
  puts "✅ Configuração concluída!"
  puts "=" * 60
  
rescue => e
  puts "❌ ERRO ao salvar configuração:"
  puts "   #{e.message}"
  puts ""
  puts "   Stack trace:"
  puts e.backtrace.first(5).join("\n")
  exit 1
end
