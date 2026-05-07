# Ultra CRM — API Gateway

Single-entrypoint nginx that dispatches incoming requests to the five
backend services by URL path. Packaged as
`ultraapicloud/ultra-crm-gateway` and meant to sit behind a TLS-terminating
reverse proxy (Traefik, Caddy, an ALB, etc.).

## Routing

Targets are declared as nginx variables at the top of the rendered config:

| Variable                  | Receives requests for                                |
|---------------------------|------------------------------------------------------|
| `$auth_service`           | `/oauth`, `/.well-known`, `/setup/*`, `/api/v1/auth`, `/api/v1/users`, `/api/v1/accounts`, `/platform/*`, `/api/v1/super_admin` (most) |
| `$crm_service`            | `/cable`, `/webhooks/*`, `/rails/active_storage`, `/api/v1/accounts/:id/webhooks`, `/api/v1/super_admin/{whitelabel,app_configs,upload,agent_bots,installation_configs,account_users}`, catch-all for unmatched `/api/v1/*` and `/` |
| `$ultra_core_service`     | `/api/v1/{agents,folders,mcp-servers,custom-mcp-servers,custom-tools}` |
| `$processor_service`      | `/api/v1/{chat,a2a,sessions,tools,clients}`, `/api/v1/agents/:id/integrations`, `/api/v1/integrations/:provider/callback`, `/api/v1/custom-mcp-servers/discover-tools`, `/health`, `/ready` |
| `$bot_runtime_service`    | `/api/v1/bot-runtime`                                |

Full path matrix is in [`default.conf.template`](./default.conf.template).

## Configurable upstreams

Each of the five variables above is rendered at container start from an
environment variable. Defaults match the service names used by the
reference `docker-compose.yaml` and `docker-compose.swarm.yaml`.

| Env var                 | Default                   | Points to                        |
|-------------------------|---------------------------|----------------------------------|
| `AUTH_UPSTREAM`         | `ultra_auth:3001`         | `ultra-auth-service-community`   |
| `CRM_UPSTREAM`          | `ultra_crm:3000`          | `ultra-ai-crm-community`        |
| `CORE_UPSTREAM`         | `ultra_core:5555`         | `ultra-ai-core-service-community`|
| `PROCESSOR_UPSTREAM`    | `ultra_processor:8000`    | `ultra-ai-processor-community`   |
| `BOT_RUNTIME_UPSTREAM`  | `ultra_bot_runtime:8080`  | `ultra-bot-runtime`              |

Format is always `host:port`, no scheme. The gateway concatenates `http://`
at the front when rendering.

### When you need to override

If your deployment renames any of the backend services (e.g. applying a
`mycrm_` prefix, or shortening to `auth`/`crm`/…) the gateway cannot
resolve the default hostnames and every proxied request returns **502 Bad
Gateway**. Set the matching `*_UPSTREAM` env vars on the gateway service
to the service names you actually used.

### Example — prefixed service names

Stack uses `mycrm_auth`, `mycrm_crm`, `mycrm_core`, `mycrm_processor`,
`mycrm_bot_runtime`:

```yaml
services:
  mycrm_gateway:
    image: ultraapicloud/ultra-crm-gateway:latest
    environment:
      AUTH_UPSTREAM: mycrm_auth:3001
      CRM_UPSTREAM: mycrm_crm:3000
      CORE_UPSTREAM: mycrm_core:5555
      PROCESSOR_UPSTREAM: mycrm_processor:8000
      BOT_RUNTIME_UPSTREAM: mycrm_bot_runtime:8080
```

### Example — non-standard ports

If you expose the auth service on `4001` instead of `3001`:

```yaml
environment:
  AUTH_UPSTREAM: ultra_auth:4001
```

## Verifying the rendered config

To confirm the variables were substituted correctly, inspect the rendered
file inside a running container:

```bash
docker exec <gateway-container> \
  grep -E "set \$(auth|crm|ultra_core|processor|bot_runtime)_service" \
  /etc/nginx/conf.d/default.conf
```

You should see the expected hostnames. If any line still contains
`${VARNAME}` literally, the env var was not set and envsubst skipped it.

## Build

```bash
docker build -t ultra-crm-gateway:local nginx/
```

The image uses the stock `nginx:alpine` base and the image's built-in
template rendering — templates in `/etc/nginx/templates/*.template` are
processed by envsubst at container start. `NGINX_ENVSUBST_FILTER` is
restricted to the five `*_UPSTREAM` vars so the substitution pass does
not touch nginx's own runtime variables (`$host`, `$request_uri`, etc.).
