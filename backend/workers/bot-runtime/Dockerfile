FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o bin/ultra-bot-runtime ./cmd/server

FROM alpine:3.20

WORKDIR /app
COPY --from=builder /app/bin/ultra-bot-runtime .

EXPOSE 8080

CMD ["./ultra-bot-runtime"]
