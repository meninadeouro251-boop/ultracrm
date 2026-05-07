FROM nginx:alpine

# Default upstream targets. Override any of these at deploy time when the
# backend service names in your stack differ from the defaults below.
ENV AUTH_UPSTREAM=ultra_auth:3001 \
    CRM_UPSTREAM=ultra_crm:3000 \
    CORE_UPSTREAM=ultra_core:5555 \
    PROCESSOR_UPSTREAM=ultra_processor:8000 \
    BOT_RUNTIME_UPSTREAM=ultra_bot_runtime:8080 \
    FRONTEND_UPSTREAM=ultra_frontend:80 \
    CORS_ALLOWED_ORIGIN=localhost:5173

# Limit envsubst to the upstream vars so nginx's own $variables (e.g. $host,
# $request_uri) are not touched at render time.
ENV NGINX_ENVSUBST_FILTER="^(AUTH|CRM|CORE|PROCESSOR|BOT_RUNTIME|FRONTEND)_UPSTREAM$|^CORS_ALLOWED_ORIGIN$"

COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
