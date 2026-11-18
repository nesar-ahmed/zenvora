# Zenvora

Zenvora is a multi-vendor local commerce and delivery platform connecting
customers, restaurants, grocery stores, local retailers and delivery partners.
This repository contains the local-first MVP implementation for Zenvora.

Current scope:

- **Backend:** FastAPI, SQLAlchemy, Alembic and SQLite with health, users,
  locations, businesses and catalog modules.
- **Frontend:** Next.js App Router with country/city selection, authentication,
  a searchable food feed and shop menus.
- **Tests:** unit and integration tests only. No end-to-end tests, coverage
  reporting or production deployment files yet.

Cart, checkout, payments, driver assignment and order workflows are
intentionally not implemented yet.

## Requirements

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Node.js 20.9+
- npm

## Backend setup

```bash
cd backend
uv sync

# First-time setup: create the backend environment file.
cp .env.example .env

# Apply database migrations and seed demo data.
uv run alembic upgrade head
uv run python -m app.database.seed

uv run uvicorn app.main:app --reload --port 8000
```

- API: <http://localhost:8000>
- Health check: <http://localhost:8000/api/v1/health>
- OpenAPI docs: <http://localhost:8000/docs>

### API endpoints

**Health**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Service health check |

**Users**

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/users/register` | Register a customer account |
| `POST` | `/api/v1/users/login` | Log in and receive a JWT access token |
| `GET` | `/api/v1/users/me` | Get the authenticated user's profile |
| `PATCH` | `/api/v1/users/me` | Update the authenticated user's profile |

**Locations and discovery**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/locations` | List countries, cities and delivery areas |
| `GET` | `/api/v1/products` | Browse available food with filters and sorting |
| `GET` | `/api/v1/products/categories` | List categories available in a city |

`/api/v1/products` supports:

| Parameter | Description |
| --- | --- |
| `country_code` | Two-letter country code, for example `IE` |
| `city` | City name, for example `Dublin` |
| `category` | Product category |
| `q` | Search across dishes, descriptions and shop names |
| `min_price` / `max_price` | Price range in integer minor units |
| `sort` | `recommended`, `rating_desc`, `price_asc`, `price_desc`, `newest` |
| `limit` / `offset` | Pagination |

**Businesses and products**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/businesses` | List approved, active businesses |
| `GET` | `/api/v1/businesses/{slug}` | Get one approved business |
| `GET` | `/api/v1/businesses/{slug}/products` | List a business's available products |

The business list supports `country_code`, `city`, `category`, `q`, `limit`
and `offset` query parameters.

### Authentication

Passwords are hashed with Argon2id and access tokens are signed JWTs. Send the
token on authenticated requests:

```http
GET /api/v1/users/me
Authorization: Bearer <access_token>
```

### Demo data

Demo records live as JSON files in `backend/data/seeds/` and are loaded by
`app/database/seed.py`. The seeder is idempotent.

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@zenvora.dev` | `SuperAdmin123!` |
| Admin | `admin@zenvora.dev` | `Admin123!` |
| Customer | `customer@zenvora.dev` | `Customer123!` |
| Merchant | `merchant@zenvora.dev` | `Merchant123!` |
| Driver | `driver@zenvora.dev` | `Driver123!` |

Seeded marketplace data spans three countries and five cities:

| Country | City | Shops |
| --- | --- | --- |
| Ireland | Dublin | Bella's Kitchen, Fresh Basket, Corner & Co., Spice Route, Green Bowl |
| Ireland | Cork | The Harbour Grill, Cork Coffee Roasters |
| United Kingdom | London | Shoreditch Pizza Co., Brick Lane Curry House |
| United Kingdom | Manchester | Northern Noodle Bar |
| Germany | Berlin | Berlin Döner House, Mitte Bowl |

The seed contains **12 shops** and **37 products** with ratings, delivery
times, delivery fees, categories and price ranges. All shops are approved and
owned by `merchant@zenvora.dev`.

See `backend/data/seeds/README.md` for the file format and how to add future
datasets such as orders, deliveries and reviews.

### Database

SQLite is stored at `backend/data/zenvora.db` by default. The engine enables
foreign keys, WAL mode, a busy timeout and `synchronous=NORMAL` on every
connection. Create a new migration after changing models:

```bash
cd backend
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

### Backend environment

Backend settings live in `backend/.env` (copy from `backend/.env.example`).
They use the `ZENVORA_` prefix, for example:

```dotenv
ZENVORA_ENVIRONMENT=development
ZENVORA_DEBUG=false
ZENVORA_DATABASE_URL=sqlite:///./data/zenvora.db
ZENVORA_CORS_ORIGINS=["http://localhost:3000"]

ZENVORA_JWT_SECRET_KEY=dev-only-change-me-use-a-long-random-secret
ZENVORA_JWT_ALGORITHM=HS256
ZENVORA_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Frontend setup

```bash
cd frontend
npm install

# First-time setup: create the frontend environment file.
cp .env.example .env

npm run dev
```

Open <http://localhost:3000>.

Routes:

| Route | Description |
| --- | --- |
| `/` | Food discovery feed with location, search, categories and sorting |
| `/businesses` | Shops delivering in the selected city |
| `/businesses/[slug]` | Shop details, delivery info and menu |
| `/login` | Login form |
| `/register` | Customer registration |
| `/account` | Authenticated profile and logout |

On the first visit, a location picker asks for a country and city. The
selection is stored in `localStorage` and can be changed from the navbar.
The navbar also reflects the current session. After seeding, log in with the
demo customer or merchant account.

The frontend stores the JWT access token in `localStorage` for this local MVP.
Move sessions to HttpOnly cookies before a production deployment.

## Sharing API types with the frontend

Frontend types are generated from FastAPI's OpenAPI schema, so backend DTOs
and frontend types stay aligned:

```text
Pydantic schemas → FastAPI OpenAPI → openapi-typescript → typed API client
```

The generated types live in `src/types/api.d.ts` and the typed client in
`src/lib/api.ts`.

After changing a backend schema:

```bash
cd backend
uv run python -m scripts.export_openapi

cd ../frontend
npm run generate:api
npm run typecheck
```

`backend/openapi.json` and `frontend/src/types/api.d.ts` are committed so the
frontend can build without the backend running.

Using the generated types:

```ts
import type { components } from "@/types/api";

export type Business = components["schemas"]["BusinessSummary"];
export type Product = components["schemas"]["ProductResponse"];
```

Contract rules:

- Every endpoint should declare `response_model`.
- Use stable DTO names such as `UserResponse` or `BusinessSummary`.
- Never edit generated types manually.
- Do not expose SQLAlchemy models as API contracts.
- Keep money as integer minor units and timestamps as ISO strings.

## Tests and quality checks

**Backend**

```bash
cd backend
uv run pytest          # unit + integration tests
uv run ruff check .
uv run ruff format --check .
```

**Frontend**

```bash
cd frontend
npm test               # unit + integration component tests
npm run lint
npm run typecheck
```

## Project structure

```text
zenvora/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # versioned API router
│   │   ├── businesses/      # business models, schemas, service and routes
│   │   ├── catalog/         # product models, feed queries and repository
│   │   ├── core/            # logging, errors, security and time helpers
│   │   ├── database/        # SQLAlchemy base, sessions and seed loader
│   │   ├── health/          # health module
│   │   ├── locations/       # country and city discovery
│   │   ├── users/           # auth and profile module
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── migrations/          # Alembic environment and revisions
│   ├── data/seeds/          # users, businesses and products seed files
│   ├── scripts/             # OpenAPI export script
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example
│   ├── alembic.ini
│   ├── openapi.json         # generated API contract
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/             # routes, layout and providers
│   │   ├── components/      # layout, food/shop cards and UI primitives
│   │   ├── features/        # auth, locations and marketplace features
│   │   ├── lib/             # API client, visuals, formatting and helpers
│   │   └── types/           # generated API types
│   ├── tests/               # unit + integration component tests
│   ├── .env.example
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Notes

- This project is set up for local development. No production build pipeline,
  deployment configuration or server container is included.
- `guide.md` is a local-only planning document and is ignored by git.
- Each application owns its own `.env` file: `backend/.env` and
  `frontend/.env`. Only the matching `.env.example` files are committed.
- The MVP is local-first: no payment gateway, map provider, email/SMS service
  or other external integration is required.
- Business logic belongs in backend services and repositories; the frontend
  communicates only through the versioned API.
- Docker Compose and Playwright end-to-end tests are not part of this
  foundation and can be added when the related workflows exist.

## License

Released under the [MIT License](LICENSE).
