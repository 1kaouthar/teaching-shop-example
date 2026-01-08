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

**Frontend Key Files:**
- `src/main.tsx` - Entry point, wraps App with AuthContext and ProductsContext
- `src/contexts/AuthContext.tsx` - Authentication state (token, user, login/logout)
- `src/contexts/ProductsContext.tsx` - Global products state management
- `src/api/products.ts` - Products API client
- `src/api/auth.ts` - Auth API (login, register)
- `src/api/orders.ts` - Orders API (create, list, get)
- `src/App.tsx` - Main component with routing
- `src/pages/` - LoginPage, RegisterPage, CheckoutPage, OrderConfirmationPage, MyOrdersPage

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
