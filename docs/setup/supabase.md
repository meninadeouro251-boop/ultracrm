# 🚀 Guia de Configuração do Supabase

## ✅ O que já foi configurado:

1. ✅ Variável `SUPABASE_OAUTH_REDIRECT_URI` adicionada ao `.env`
2. ✅ Script de configuração Ruby criado: `ultra-ai-crm-community/config/supabase_setup.rb`
3. ✅ Script PowerShell criado: `setup-supabase.ps1`

---

## 📋 Passo a Passo Completo

### **Passo 1: Despausar o Docker Desktop**

O Docker está pausado no momento. Faça o seguinte:

1. Clique no ícone da baleia 🐳 na barra de tarefas (perto do relógio)
2. Clique em **"Resume"** ou **"Start"**
3. Aguarde o ícone ficar verde/animado (pode levar 1-2 minutos)

---

### **Passo 2: Executar o Script de Configuração**

Abra o PowerShell e execute:

```powershell
cd C:\Users\Jimmy\Desktop\ultra-crm-community
.\setup-supabase.ps1
```

Este script vai:
- ✅ Verificar se o Docker está rodando
- ✅ Verificar se o `.env` existe
- ✅ Configurar a variável do Supabase
- ✅ Mostrar os próximos passos

---

### **Passo 3: Iniciar os Serviços Docker**

```powershell
docker compose up -d
```

Aguarde todos os serviços iniciarem (2-3 minutos).

Para verificar o status:
```powershell
docker compose ps
```

---

### **Passo 4: Executar os Seeds (Primeira Vez Apenas)**

Se é a primeira vez que está rodando o projeto:

```powershell
# Seed do Auth Service (cria usuário admin)
docker compose run --rm ultra-auth bash -c "bundle exec rails db:prepare && bundle exec rails db:seed"

# Seed do CRM Service
docker compose run --rm ultra-crm bash -c "bundle exec rails db:prepare && bundle exec rails db:seed"
```

Ou use o Makefile (se tiver make instalado):
```powershell
make seed
```

---

### **Passo 5: Configurar Supabase no Banco de Dados**

```powershell
docker compose run --rm ultra-crm bash -c "ruby config/supabase_setup.rb"
```

Este script vai salvar a configuração do Supabase no banco de dados do CRM.

---

### **Passo 6: Configurar no Painel do Supabase**

1. Acesse: **https://supabase.com/dashboard/project/ionwsfoweyitgobtjyh**

2. Vá em **Settings** (⚙️) > **API**

3. Role até encontrar **"OAuth Redirect URLs"**

4. Clique em **"Add URL"** e adicione:
   ```
   http://localhost:8000/integrations/supabase/callback
   ```

5. Clique em **"Save"**

---

### **Passo 7: Conectar via Interface**

1. Acesse o frontend: **http://localhost:5173**

2. Faça login com:
   - Email: `support@ultracrm.com`
   - Senha: (veja no console do Docker ou use a padrão)

3. Navegue para:
   - **AI Agents** > Selecione um agente
   - Clique em **Integrações**
   - Selecione **Supabase**

4. Clique em **"Conectar com Supabase"**

5. Você será redirecionado para o Supabase para autorizar

6. Faça login no Supabase e autorize a conexão

7. Pronto! ✅ A integração está configurada

---

## 🔑 Informações do Seu Projeto Supabase

- **Project ID**: `ionwsfoweyitgobtjyh`
- **Project URL**: `https://ionwsfoweyitgobtjyh.supabase.co`
- **Redirect URI**: `http://localhost:8000/integrations/supabase/callback`

### Chaves JWT (mantenha em segredo!):

**Chave Anon (Public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbndzZm93ZXlpdGdvYnRkanloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTg5NzEsImV4cCI6MjA5MjI5NDk3MX0._wAvlNTPCs3iJWXqE4ncEel_gfMjdNIvZomQ8z1J48k
```

**Chave Service Role (SECRET - Nunca compartilhe!):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbndzZm93ZXlpdGdvYnRkanloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcxODk3MSwiZXhwIjoyMDkyMjk0OTcxfQ.Zdmx-kZgTD9QY8Q4HgFBjvKe0B7BSyLlEtiVm6YvaG0
```

---

## 🛠️ Comandos Úteis

### Verificar logs dos serviços:
```powershell
# Todos os serviços
docker compose logs -f

# Apenas CRM
docker compose logs -f ultra-crm

# Apenas Processor
docker compose logs -f ultra-processor
```

### Reiniciar serviços:
```powershell
docker compose restart
```

### Parar todos os serviços:
```powershell
docker compose down
```

### Limpar tudo (incluindo volumes):
```powershell
docker compose down -v
```

---

## ❌ Problemas Comuns

### Docker não inicia
- Verifique se o Hyper-V está habilitado (Windows)
- Reinicie o Docker Desktop
- Verifique o log do Docker em: `%APPDATA%\Docker\log.txt`

### Serviços não sobem
```powershell
# Verificar logs
docker compose logs

# Reconstruir containers
docker compose down
docker compose up -d --build
```

### Erro de conexão com banco
```powershell
# Aguardar o PostgreSQL estar pronto
docker compose logs postgres

# Reiniciar apenas o CRM
docker compose restart ultra-crm
```

### OAuth não funciona
1. Verifique se o Redirect URI está configurado corretamente no Supabase
2. Verifique se o serviço `ultra-processor` está rodando na porta 8000
3. Verifique os logs:
   ```powershell
   docker compose logs ultra-processor
   ```

---

## 📚 Recursos

- **Documentação do Projeto**: `README.md`
- **Arquivo de Configuração**: `.env`
- **Scripts de Setup**: `setup.sh`, `setup-supabase.ps1`
- **Makefile**: `Makefile` (comandos úteis)

---

## 🆘 Precisa de Ajuda?

Se encontrar algum problema:
1. Verifique os logs: `docker compose logs -f`
2. Consulte a documentação: `README.md`
3. Abra uma issue no repositório

---

**Última atualização**: 20 de Abril, 2026
