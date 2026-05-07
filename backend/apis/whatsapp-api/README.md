# WhatsApp Baileys Service

Serviço NestJS para conectar WhatsApp via Baileys ao ULTRA CRM, sem dependencia da Ultra API.

## Instalação

```bash
cd whatsapp-baileys-service
npm install
```

## Configuração

Crie um arquivo `.env`:

```env
PORT=3001
CRM_URL=http://localhost:3000
```

## Executar

```bash
# Desarrollo
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## API Endpoints

### Criar Instância (conectar WhatsApp)
```bash
POST /whatsapp/create
Body: { "instanceName": "minha-instancia" }
```

Retorna QR Code para escanear com o WhatsApp.

### Verificar Status
```bash
GET /whatsapp/status/:instanceName
```

### Obter QR Code
```bash
GET /whatsapp/qr/:instanceName
```

### Enviar Mensagem
```bash
POST /whatsapp/send/:instanceName
Body: { 
  "to": "5511999999999", 
  "message": "Olá! Como posso ajudar?" 
}
```

### Enviar Mídia
```bash
POST /whatsapp/media/:instanceName
Body: { 
  "to": "5511999999999", 
  "mediaUrl": "https://exemplo.com/imagem.jpg",
  "caption": "Descrição da imagem",
  "mimetype": "image/jpeg"
}
```

### Enviar Botões
```bash
POST /whatsapp/buttons/:instanceName
Body: { 
  "to": "5511999999999", 
  "message": "Escolha uma opção:",
  "buttons": [
    { "id": "btn_1", "title": "Opção 1" },
    { "id": "btn_2", "title": "Opção 2" }
  ]
}
```

### Desconectar
```bash
POST /whatsapp/logout/:instanceName
```

## Configuração no CRM

Configure o Webhook no seu CRM para receber mensagens do Baileys:

```
URL: http://seu-servico:3001/webhooks/baileys
```

## Arquitetura

```
whatsapp-baileys-service/
├── src/
│   ├── whatsapp/
│   │   └── whatsapp.service.ts    # Serviço principal Baileys
│   ├── api/
│   │   └── whatsapp.controller.ts # Controlador REST
│   ├── app.module.ts
│   └── main.ts
├── auth/                          # Diretório de autenticação
├── package.json
└── tsconfig.json
```

## Integração com CRM

O serviço envía automáticamente as mensagens recebidas para o CRM via webhook:

- `POST {CRM_URL}/api/webhooks/baileys` - Mensagens recebidas
- `POST {CRM_URL}/api/webhooks/baileys/status` - Status da conexão