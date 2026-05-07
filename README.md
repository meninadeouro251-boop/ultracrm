<p align="center">
  <a href="https://ultracrm.com">
    <img src="./frontend/shared/public/hover-ultralution.png" alt="Ultra CRM" />
  </a>
</p>

<h1 align="center">ULTRA CRM Community</h1>

<p align="center">
  Open-source, single-tenant AI-powered customer support platform.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" /></a>
  <a href="https://docs.ultracrm.com"><img src="https://img.shields.io/badge/Docs-ultracrm.com-00ffa7" alt="Documentation" /></a>
  <a href="https://ultracrm.com/community"><img src="https://img.shields.io/badge/Community-Join%20us-white" alt="Community" /></a>
</p>

<p align="center">
  <a href="https://ultracrm.com">Website</a> &middot;
  <a href="https://docs.ultracrm.com">Documentation</a> &middot;
  <a href="https://ultracrm.com/community">Community</a> &middot;
  <a href="https://ultracrm.com/contribute">Support the project</a>
</p>

---

ULTRA CRM Community is the open-source edition of the ULTRA CRM platform — a complete suite for AI-assisted customer support. It brings together authentication, CRM, AI agents, agent processing and a modern frontend into a unified, self-hostable stack.

This repository is the **monorepo entrypoint**: it aggregates all community services as Git submodules, giving you a single place to clone, update and orchestrate the entire platform.

---

## Architecture

The platform is composed of 7 independent services:

| Service                                                                  | Role                                         | Stack                     | Default Port |
| ------------------------------------------------------------------------ | -------------------------------------------- | ------------------------- | ------------ |
| [`auth-api`](./backend/apis/auth-api)                   | Authentication, RBAC, OAuth2, token issuance | Ruby 3.4 / Rails 7.1      | `3001`       |
| [`crm-api`](./backend/apis/crm-api)                    | Conversations, contacts, inboxes, messaging  | Ruby 3.4 / Rails 7.1      | `3000`       |
| [`web-frontend`](./frontend/web)                       | Web interface                                | React / TypeScript / Vite | `5173`       |
| [`processor-api`](./backend/apis/processor-api)         | AI agent execution, sessions, tools, MCP     | Python 3.10 / FastAPI     | `8000`       |
| [`core-api`](./backend/apis/core-api)                  | Agent management, API keys, folders          | Go / Gin                  | `5555`       |
| [`bot-runtime`](./backend/workers/bot-runtime)         | Bot pipeline execution, debouncing, dispatch | Go / Gin                  | `8080`       |
| [`ultra-go`](./backend/shared/libs/ultra-go)           | High-performance WhatsApp API                | Go                        | `8081`       |

### Design principles (Community Edition)

- **Single-tenant** — one account, no multi-tenancy overhead
- **No super-admin** — all configuration via seed data and environment variables
- **No billing / plans** — all limits removed, features unlocked by default
- **Role hierarchy**: `account_owner` and `agent` — no intermediate roles
- **Account resolution** via token — no `account-id` header required between services

---

## Getting started

### Prerequisites

- Docker & Docker Compose
- Git with submodule support

### 1. Clone with submodules

```bash
git clone --recurse-submodules git@github.com:ultralutionAPI/ultra-crm-community.git
cd ultra-crm-community
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

### 2. Update all submodules to latest

```bash
git submodule update --remote --merge
```

### 3. Quick start

```bash
# Copy environment config
cp .env.example .env

# Build and start everything
make setup
```

Or manually:

```bash
cp .env.example .env
docker compose build
docker compose up -d postgres redis mailhog
# Wait for DB, then seed:
docker compose run --rm ultra-auth sh -c "bundle exec rails db:prepare && bundle exec rails db:seed"
docker compose run --rm ultra-crm sh -c "bundle exec rails db:prepare && bundle exec rails db:seed"
docker compose up -d
```

### 4. Access the platform

| URL | Service |
|-----|---------|
| http://localhost:5173 | Frontend |
| http://localhost:3000 | CRM API |
| http://localhost:3001 | Auth API |
| http://localhost:8000 | Processor API |
| http://localhost:5555 | Core API |
| http://localhost:8080 | Bot Runtime |
| http://localhost:8025 | Mailhog (email testing) |

**Default login:** `support@ultracrm.com` / `Password@123`

> **Note:** `ultra-auth-service-community` must be seeded before `ultra-ai-crm-community` — the CRM depends on the user created by the auth seed.

---

## Service dependencies

```
ultra-ai-frontend-community
    └── ultra-auth-service-community  (authentication)
    └── ultra-ai-crm-community        (conversations, contacts)
    └── ultra-ai-core-service-community (agents, tools, API keys)
    └── ultra-ai-processor-community  (agent execution, sessions)
        └── ultra-bot-runtime         (bot pipeline execution)
```

All inter-service communication uses Bearer token authentication. The token issued by `ultra-auth-service-community` is forwarded between services — no additional headers required.

---

## Submodules reference

| Submodule                          | Repository                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `auth-api`      | [ultralutionAPI/ultra-auth-service-community](https://github.com/ultralutionAPI/ultra-auth-service-community)             |
| `crm-api`       | [ultralutionAPI/ultra-ai-crm-community](https://github.com/ultralutionAPI/ultra-ai-crm-community)                        |
| `web-frontend`  | [ultralutionAPI/ultra-ai-frontend-community](https://github.com/ultralutionAPI/ultra-ai-frontend-community)               |
| `processor-api` | [ultralutionAPI/ultra-ai-processor-community](https://github.com/ultralutionAPI/ultra-ai-processor-community)             |
| `core-api`      | [ultralutionAPI/ultra-ai-core-service-community](https://github.com/ultralutionAPI/ultra-ai-core-service-community)       |
| `bot-runtime`   | [ultralutionAPI/ultra-bot-runtime](https://github.com/ultralutionAPI/ultra-bot-runtime)                                   |
| `ultra-go`      | [ultralutionAPI/ultralution-go](https://github.com/ultralutionAPI/ultralution-go)                                         |
| `gateway-api`   | [ultralutionAPI/ultralution-api](https://github.com/ultralutionAPI/ultralution-api)                                       |

---

## Contributing

Contributions are welcome! Please open an issue or pull request in the relevant submodule repository.

Join the [community](https://ultracrm.com/community) to discuss ideas, ask questions and collaborate.

Want to support the project? Visit [ultracrm.com/contribute](https://ultracrm.com/contribute).

## License

Apache 2.0 — see [LICENSE](./LICENSE) for details.

Made with love by [Ultra CRM](https://ultracrm.com).