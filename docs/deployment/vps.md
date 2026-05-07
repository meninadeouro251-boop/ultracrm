# Guia de Deploy — Ultra CRM no VPS Hostinger
# Dominio: ultrahubsystems.com.br | IP: 2.24.75.87

## Dados do Servidor

| Propriedade | Valor |
|-------------|-------|
| IP Publico  | 2.24.75.87 |
| Hostname    | srv1645744.hstgr.cloud |
| OS          | Ubuntu 24.04 LTS |
| CPUs / RAM  | 4 CPUs / 16 GB |
| Disco       | 200 GB |
| Estado      | running |

---

## ETAPA 1 — Preparar o Servidor (via SSH)

```bash
ssh root@2.24.75.87

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependencias
apt install -y docker.io docker-compose-plugin curl git ufw certbot python3-certbot-nginx nginx

# Habilitar Docker
systemctl enable docker && systemctl start docker

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## ETAPA 2 — Enviar Projeto (no Windows, via PowerShell)

```powershell
# No terminal Windows, na pasta Desktop:
cd C:\Users\Jimmy\Desktop

# Enviar projeto inteiro para o VPS
scp -r ultra-crm-community root@2.24.75.87:/opt/ultra-crm
```

No VPS:
```bash
cd /opt/ultra-crm
```

---

## ETAPA 3 — Senhas de Producao (OBRIGATORIO — gerar no VPS)

```bash
# Gerar SECRET_KEY_BASE (128 chars)
openssl rand -hex 64

# Gerar ENCRYPTION_KEY (base64)
openssl rand -base64 32

# Gerar senha Postgres forte
openssl rand -hex 16

# Gerar senha Redis forte
openssl rand -hex 16
```

Substitua no docker-compose.prod-test.yaml:
- `ultra_dev_password` -> senha Postgres gerada
- `ultra_redis_pass` -> senha Redis gerada
- A chave longa de SECRET_KEY_BASE -> a gerada acima
- `XoQPOBw2FrzjQS11utERG9qO2MsAnXFxlhIns_uUxRk=` -> ENCRYPTION_KEY gerada

---

## ETAPA 4 — DNS (no painel Hostinger)

Adicionar registros A:
  ultrahubsystems.com.br       -> A -> 2.24.75.87
  www.ultrahubsystems.com.br   -> A -> 2.24.75.87

---

## ETAPA 5 — Nginx Reverse Proxy

```bash
cat > /etc/nginx/sites-available/ultra-crm << 'ENDNGINX'
server {
    listen 80;
    server_name ultrahubsystems.com.br www.ultrahubsystems.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ultrahubsystems.com.br www.ultrahubsystems.com.br;

    ssl_certificate /etc/letsencrypt/live/ultrahubsystems.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ultrahubsystems.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    # Frontend React (porta 5173)
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # API Gateway (porta 3030)
    location ~ ^/(api|auth|webhooks|cable|rails) {
        proxy_pass http://127.0.0.1:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
ENDNGINX

ln -sf /etc/nginx/sites-available/ultra-crm /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## ETAPA 6 — SSL (Let's Encrypt)

```bash
# Aguardar DNS propagar (~5-15 min apos configurar) depois:
certbot --nginx -d ultrahubsystems.com.br -d www.ultrahubsystems.com.br

# Verificar renovacao automatica
certbot renew --dry-run
```

---

## ETAPA 7 — Build e Deploy

```bash
cd /opt/ultra-crm

# Build do frontend customizado (Ultra API branding + Ultra I.A)
docker build -t ultra-crm-frontend:latest ./ultra-ai-frontend-community

# Editar docker-compose.prod-test.yaml para usar imagem local:
# ultra_frontend:
#   image: ultra-crm-frontend:latest
#   (remover a linha "image: ultraapicloud/..." e adicionar build: context)

# Baixar imagens dos outros servicos
docker compose -f docker-compose.prod-test.yaml pull

# Subir tudo
docker compose -f docker-compose.prod-test.yaml up -d

# Acompanhar logs (Ctrl+C para sair sem parar)
docker compose -f docker-compose.prod-test.yaml logs -f
```

Aguardar ~3-5 min para todos os servicos ficarem healthy.

---

## ETAPA 8 — Verificacao

```bash
# Status dos containers
docker compose -f docker-compose.prod-test.yaml ps

# Testar frontend
curl -I https://ultrahubsystems.com.br

# Testar API
curl -I https://ultrahubsystems.com.br/auth/sign_in
```

---

## Checklist Final

- [ ] SSH root@2.24.75.87 funcionando
- [ ] Docker e docker-compose-plugin instalados
- [ ] Firewall: portas 22, 80, 443 abertas
- [ ] DNS: ultrahubsystems.com.br -> 2.24.75.87
- [ ] Senhas de producao geradas e substituidas no docker-compose
- [ ] Nginx configurado e testado (nginx -t OK)
- [ ] SSL Let's Encrypt emitido para ultrahubsystems.com.br
- [ ] Frontend buildado com Ultra API branding e Ultra I.A
- [ ] docker compose up -d executado com sucesso
- [ ] Todos containers healthy
- [ ] Acesso via https://ultrahubsystems.com.br

---

## Comandos Uteis

```bash
# Ver logs de um servico especifico
docker compose -f docker-compose.prod-test.yaml logs -f ultra_crm

# Reiniciar um servico
docker compose -f docker-compose.prod-test.yaml restart ultra_frontend

# Parar tudo
docker compose -f docker-compose.prod-test.yaml down

# Backup do banco
docker exec ultra_postgres pg_dump -U postgres ultra_community > backup_$(date +%Y%m%d).sql

# Renovar SSL (automatico via cron, mas pode forcar)
certbot renew
```

---

## Customizacoes Aplicadas no Frontend

| Mudanca | Arquivos |
|---------|---------|
| Label ultralution -> Ultra API | whatsapp.json, channelUtils.ts, adminSettings.json |
| Label ultralution Go -> Ultra API Go | Mesmos arquivos |
| Icone WhatsApp -> Logo Ultra | ChannelIcon.tsx + assets/channels/ultra-api.svg |
| Novo agente Ultra I.A (LangChain) | BasicInfoForm.tsx |
| URLs producao ultrahubsystems.com.br | docker-compose.prod-test.yaml, .env |
