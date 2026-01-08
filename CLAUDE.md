# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boutique Couture is an educational e-commerce application for learning DevOps concepts. It features a React frontend and Django backend for selling baby clothing.

## Development Commands

### Running the Full Stack
```bash
# Start both frontend and backend (requires tmux)
./start-dev.sh
```
This runs frontend on http://localhost:8080 and backend on http://localhost:8000.

### Frontend (frontend/)
```bash
npm install           # Install dependencies
npm run dev -- --port 8080  # Development server with HMR
npm run build         # Production build
npm run lint          # Run ESLint
npm test              # Run Vitest tests
```

### Backend (backend/)
```bash
uv sync                                    # Install dependencies
cd core && uv run python manage.py migrate # Run migrations
uv run python manage.py runserver          # Start on localhost:8000
uv run python manage.py createsuperuser    # Create admin user
cd core && uv run python manage.py test    # Run Django tests
```

## Architecture

**Monorepo Structure:**
- `frontend/` - React 19 + Vite + TypeScript + Tailwind CSS SPA
- `backend/` - Django 5 + Django REST Framework API

**Frontend Structure (theme-based organization):**
```
src/
├── home/             # Home page + scoped components
├── auth/             # Login/Register pages + shared auth components
├── checkout/         # Checkout page + payment components
├── orders/           # Orders list + order detail pages
├── admin/orders/     # Admin orders page + admin components
├── shared/
│   ├── components/   # LoadingSpinner, StatusBadge, EmptyState, PageContainer
│   └── layouts/      # Header, ProtectedLayout, AdminLayout
├── contexts/         # AuthContext, ProductsContext
├── api/              # API clients (auth, products, orders)
├── App.tsx           # Route definitions
└── main.tsx          # Entry point with context providers
```

**Frontend Key Files:**
- `src/main.tsx` - Entry point, wraps App with AuthContext and ProductsContext
- `src/App.tsx` - Main component with routing
- `src/contexts/AuthContext.tsx` - Authentication state (token, user, login/logout)
- `src/contexts/ProductsContext.tsx` - Global products state management
- `src/api/` - API clients (auth.ts, products.ts, orders.ts)
- `src/shared/components/` - Reusable UI components
- `src/shared/layouts/` - App-level layouts (Header, ProtectedLayout, AdminLayout)

**Backend Key Files:**
- `core/api/models.py` - Product and Order models
- `core/api/urls.py` - Routes, serializers, viewsets, auth views (all in one file)
- `core/api/settings.py` - Django configuration with DRF Token Auth
- `core/api/tests.py` - Django test cases for auth and orders

**API Endpoints:**
- `GET/POST /api/products/` - List/create products
- `GET/PUT/DELETE /api/products/{id}/` - Product detail operations
- `POST /api/auth/register/` - Create user, returns token
- `POST /api/auth/login/` - Validate credentials, returns token
- `GET/POST /api/orders/` - List user's orders / create order (requires auth)
- `GET /api/orders/{id}/` - Get order detail (requires auth)
- `/admin/` - Django admin interface

## Tech Stack

- **Frontend:** React 19, Vite 7, TypeScript, Tailwind CSS 4, Heroicons, Vitest
- **Backend:** Django 5, Django REST Framework, DRF Token Auth, SQLite
- **Package Managers:** npm (frontend), uv (backend, Python 3.11)

## Development Notes

- CORS is fully open (`CORS_ALLOW_ALL_ORIGINS = True`) for local development
- SQLite database at `backend/core/db.sqlite3` comes pre-populated
- Product images stored in `frontend/public/`
- No Docker or CI/CD pipelines

## Authentication

- Uses DRF Token Authentication (not JWT)
- Token stored in localStorage on frontend
- Protected routes redirect to `/login` if not authenticated
- Auth header format: `Authorization: Token <token>`

## Dummy Payment System

- Orders require a 16-digit card number
- Card numbers starting with `0000` are rejected (simulates declined card)
- All other 16-digit numbers are accepted (simulates successful payment)
- Order status: `pending` → `paid` (success) or `failed` (declined)

## Frontend Organization Rules

### Theme-based folder structure
- Organize by feature/theme, NOT by type (no generic `components/` folder with random files)
- Each theme folder contains:
  - `page.tsx` - The main page component
  - Scoped components used only by that theme (e.g., `ProductPreview.tsx`, `PaymentForm.tsx`)
  - `page.test.tsx` - Tests alongside the component they test
- Nested routes use subfolders: `orders/order/page.tsx` for `/order/:orderId`

### Shared code location
- `shared/components/` - Only truly reusable UI components (LoadingSpinner, StatusBadge, EmptyState, PageContainer)
- `shared/layouts/` - App-level layout components (Header, ProtectedLayout, AdminLayout)
- `shared/hooks/` - Custom hooks shared across themes
- `contexts/` - Global state (AuthContext, ProductsContext)
- `api/` - API client functions

### Component guidelines
- Keep components small and focused (single responsibility)
- Extract repeated UI patterns into shared components
- Pages should compose smaller components, not contain all logic inline
- Use barrel exports (`index.ts`) for shared folders

### TypeScript imports
- Use `import type { ... }` for type-only imports (required by verbatimModuleSyntax)
- Example: `import type { ReactNode } from 'react';`
