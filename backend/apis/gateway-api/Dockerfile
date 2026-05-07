FROM node:24-alpine AS builder

RUN apk update && \
    apk add --no-cache git ffmpeg wget curl bash openssl

LABEL version="2.3.1" description="Api to control whatsapp features through http requests." 
LABEL maintainer="Davidson Gomes" git="https://github.com/DavidsonGomes"
LABEL contact="contato@ultralution-api.com"

WORKDIR /ultralution

COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./tsup.config.ts ./
COPY ./patches ./patches

RUN npm ci --silent

RUN npx patch-package

COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./manager ./manager
COPY ./.env.example ./.env
COPY ./runWithProvider.js ./

COPY ./Docker ./Docker

RUN chmod +x ./Docker/scripts/* && dos2unix ./Docker/scripts/*

RUN ./Docker/scripts/generate_database.sh

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

FROM node:24-alpine AS final

RUN apk update && \
    apk add tzdata ffmpeg bash openssl

ENV TZ=America/Sao_Paulo
ENV DOCKER_ENV=true

WORKDIR /ultralution

COPY --from=builder /ultralution/package.json ./package.json
COPY --from=builder /ultralution/package-lock.json ./package-lock.json

COPY --from=builder /ultralution/node_modules ./node_modules
COPY --from=builder /ultralution/dist ./dist
COPY --from=builder /ultralution/prisma ./prisma
COPY --from=builder /ultralution/manager ./manager
COPY --from=builder /ultralution/public ./public
COPY --from=builder /ultralution/.env ./.env
COPY --from=builder /ultralution/Docker ./Docker
COPY --from=builder /ultralution/runWithProvider.js ./runWithProvider.js
COPY --from=builder /ultralution/tsup.config.ts ./tsup.config.ts

ENV DOCKER_ENV=true

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", ". ./Docker/scripts/deploy_database.sh && npm run start:prod" ]
