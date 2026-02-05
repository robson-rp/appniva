# 🚀 Appniva Backend API

## Setup

### Prerequisites
- PHP 8.2+
- MySQL 8.0+
- Composer

### Installation

```bash
# Clone e navegue ao backend
cd backend

# Instale dependências
composer install

# Crie o arquivo .env
cp .env.example .env

# Configure a conexão MySQL no .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=niva_backend
DB_USERNAME=root
DB_PASSWORD=

# Gere a chave da aplicação
php artisan key:generate

# Execute as migrações
php artisan migrate

# Inicie o servidor
php artisan serve
```

## API Documentation

### Base URL
```
http://localhost:8000/api/
```

### Authentication
Todos os endpoints requerem autenticação via **Laravel Sanctum**. 

```bash
# Login (TODO: criar endpoint)
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

# Response:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Use token em requisições subsequentes
Authorization: Bearer {token}
```

## Core Endpoints (Implemented)

### Profile Management
```
GET    /api/profiles          - Get current user profile
POST   /api/profiles          - Create profile
GET    /api/profiles/{id}     - Get profile
PUT    /api/profiles/{id}     - Update profile
DELETE /api/profiles/{id}     - Delete profile
```

### Financial Management

#### Accounts
```
GET    /api/accounts          - List accounts
POST   /api/accounts          - Create account
GET    /api/accounts/{id}     - Get account details
PUT    /api/accounts/{id}     - Update account
DELETE /api/accounts/{id}     - Delete account
```

#### Categories
```
GET    /api/categories        - List categories
POST   /api/categories        - Create category
GET    /api/categories/{id}   - Get category
PUT    /api/categories/{id}   - Update category
DELETE /api/categories/{id}   - Delete category
```

#### Transactions
```
GET    /api/transactions       - List transactions (paginated)
POST   /api/transactions       - Create transaction
GET    /api/transactions/{id}  - Get transaction
PUT    /api/transactions/{id}  - Update transaction
DELETE /api/transactions/{id}  - Delete transaction

Query Parameters:
- per_page: Items per page (default: 15)
- page: Page number
- account_id: Filter by account
- date: Filter by date
- type: Filter by type (income/expense/transfer)
```

#### Budgets
```
GET    /api/budgets           - List budgets
POST   /api/budgets           - Create budget
GET    /api/budgets/{id}      - Get budget
PUT    /api/budgets/{id}      - Update budget
DELETE /api/budgets/{id}      - Delete budget
```

### Goals & Planning

#### Goals
```
GET    /api/goals             - List goals
POST   /api/goals             - Create goal
GET    /api/goals/{id}        - Get goal
PUT    /api/goals/{id}        - Update goal
DELETE /api/goals/{id}        - Delete goal
```

#### Debt Management
```
GET    /api/debts             - List debts
POST   /api/debts             - Create debt
GET    /api/debts/{id}        - Get debt
PUT    /api/debts/{id}        - Update debt
DELETE /api/debts/{id}        - Delete debt
```

## Request/Response Examples

### Create Transaction
```bash
POST /api/transactions
Content-Type: application/json
Authorization: Bearer {token}

{
  "account_id": 1,
  "amount": 100.50,
  "type": "expense",
  "date": "2024-02-05",
  "description": "Lunch",
  "category_id": 3
}

Response (201):
{
  "data": {
    "id": 42,
    "account_id": 1,
    "amount": "100.50",
    "type": "expense",
    "date": "2024-02-05",
    "description": "Lunch",
    "category_id": 3,
    "created_at": "2024-02-05T10:30:00Z"
  }
}
```

### List Transactions with Pagination
```bash
GET /api/transactions?per_page=20&page=1&type=expense
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": 1,
      "account_id": 1,
      "amount": "50.00",
      "type": "expense",
      ...
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/transactions?page=1",
    "last": "http://localhost:8000/api/transactions?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/transactions?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 20,
    "to": 20,
    "total": 100
  }
}
```

## Validation Rules

### Profile
- **email**: required, unique, valid email format
- **name**: required, max 255 characters
- **primary_currency**: required, 3-letter code (e.g., USD, AOA)
- **monthly_income**: numeric, min 0
- **onboarding_completed**: boolean
- **is_suspended**: boolean

### Account
- **name**: required, max 255
- **type**: required, one of [savings, checking, investment, credit_card]
- **currency**: required, 3-letter code
- **current_balance**: required, numeric
- **initial_balance**: numeric (optional)
- **institution_name**: string, max 255 (optional)
- **is_active**: boolean

### Transaction
- **account_id**: required, must exist in accounts table
- **amount**: required, numeric, min 0.01
- **type**: required, one of [income, expense, transfer]
- **date**: required, valid date
- **description**: string, max 500 (optional)
- **category_id**: must exist in categories table (optional)
- **cost_center_id**: must exist in cost_centers table (optional)
- **related_account_id**: must exist in accounts table (optional)

## Error Responses

### 400 - Bad Request
```json
{
  "message": "Bad Request",
  "errors": {
    "amount": ["The amount must be at least 0.01"]
  }
}
```

### 401 - Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 - Forbidden
```json
{
  "message": "This action is unauthorized"
}
```

### 404 - Not Found
```json
{
  "message": "Not Found"
}
```

### 422 - Unprocessable Entity
```json
{
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email field is required"]
  }
}
```

## Pagination

All list endpoints support pagination:
- **per_page**: Number of items per page (default: 15, max: 100)
- **page**: Page number (default: 1)

Example:
```bash
GET /api/transactions?per_page=50&page=2
```

## Filtering & Searching

Filters vary by endpoint. Common patterns:

```bash
# By date range
GET /api/transactions?date_from=2024-01-01&date_to=2024-02-05

# By type
GET /api/transactions?type=expense

# By account
GET /api/transactions?account_id=1

# By category
GET /api/transactions?category_id=3
```

## Rate Limiting

- Auth endpoints: 6 requests per minute
- Mutation endpoints (POST, PUT, DELETE): 60 requests per minute
- Read endpoints (GET): 120 requests per minute

## Status Codes

- **200 OK** - Successful GET/PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Malformed request
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation error
- **429 Too Many Requests** - Rate limit exceeded
- **500 Server Error** - Internal server error

## Development

### Run Tests
```bash
php artisan test
```

### Run Migrations
```bash
php artisan migrate
```

### Rollback Migrations
```bash
php artisan migrate:rollback
```

### Reset Database
```bash
php artisan migrate:fresh
```

### Seed Database (with test data)
```bash
php artisan db:seed
```

---

**Last Updated**: 2026-02-05
**API Version**: v1
**Status**: In Development
