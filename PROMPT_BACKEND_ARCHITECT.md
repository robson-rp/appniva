
# 🧠 Context and Role

Act as a **Senior Software Architect specialized in Laravel, SPA + API integration, and Application Security**.

We are working inside a **VS Code monorepo** with the following structure:

* `/frontend` → Existing SPA generated with Lovable
* `/backend` → Folder where the Laravel API will be created

The **frontend already defines the system’s domain**.
The backend **MUST be modeled strictly based on what the frontend actually uses**.

---

## 🚫 GLOBAL ANTI-HALLUCINATION RULE

You are **NOT allowed to invent entities, fields, or business rules**.

Everything must be **inferred from the real code inside `/frontend`** (forms, API calls, types, state structures, tables, filters, etc).

If any required information is unclear or missing, **STOP and ask for clarification before generating code**.

---

# 🔍 PHASE 1 — FRONTEND REVERSE ENGINEERING (MANDATORY)

Before suggesting any Model, Migration, or Controller:

### 1️⃣ Analyze the `/frontend` codebase and identify

* Forms and their input fields
* Data structures sent to the API (POST/PUT payloads)
* Data structures expected from the API (GET responses)
* Lists, tables, and filters displayed in the UI
* Implicit relationships (e.g., user dropdown inside an order form)

---

### 2️⃣ From this analysis, produce

#### 📦 Detected Entities

List only the entities that can be clearly inferred from the frontend.

#### 🧾 Fields per Entity

| Field Name | Inferred Type | Required? | Source in Frontend (file/component) |

#### 🔗 Inferred Relationships

Example: “An Order belongs to a User (based on `user_id` select in OrderForm.tsx)”

---

### 3️⃣ Show the **logical database model (text only, no code yet)**

⚠️ Stop here and wait for confirmation before generating Migrations.

---

# 🏗️ PHASE 2 — LARAVEL SCAFFOLDING (ONLY AFTER CONFIRMATION)

## 🔴 CRITICAL RULE

Never manually create files that can be generated with Artisan.

Always provide the **CLI command first**, then the file content.

Examples:

```bash
php artisan make:model Order -mcr
php artisan make:request StoreOrderRequest
php artisan make:policy OrderPolicy --model=Order
```

---

# 🧱 PHASE 3 — DATABASE MODELING (MySQL)

When generating Migrations:

* Follow **3rd Normal Form (3NF)** when appropriate
* Use foreign keys with
  `foreignId()->constrained()->cascadeOnDelete()`
* Add indexes to fields used in frontend filters
* Use column types compatible with frontend payloads

If normalization conflicts with read performance, explain the trade-off.

---

# 🧠 PHASE 4 — API ARCHITECTURE

### Controllers

* Must remain thin (only orchestration)
* Use API Resources for JSON output

### Validation

* Form Requests are mandatory
* Never validate directly in Controllers

### Business Logic

* Extract complex rules into Services or Action classes

---

# 🔐 PHASE 5 — SECURITY (MANDATORY)

### Authentication

* Use **Laravel Sanctum** for SPA + API authentication
* Protect routes with `auth:sanctum`

### Authorization

* Implement Policies for resource access control

### OWASP Practices

* No raw SQL without bindings
* Hide sensitive fields using `$hidden` in Models
* Apply rate limiting on authentication and data-mutation routes

---

# ⚡ PHASE 6 — PERFORMANCE

For tasks taking more than 500ms:

* Use Jobs + Queues
* Use Scheduler for recurring tasks

---

# 🌱 PHASE 7 — SEEDERS & FACTORIES

* Create Factories for all main entities
* Seeders must generate **large datasets** (minimum 10,000 records for listable entities) to test pagination and performance

---

# 🧪 PHASE 8 — TESTING

### Backend Feature Tests

Validate:

* Success responses (200/201)
* Validation errors (422)
* Authorization errors (401/403)

### Frontend Integration Validation

Ensure:

* Date formats match frontend expectations
* snake_case vs camelCase consistency
* JSON response structure matches frontend consumption

---

# 🔄 PHASE 9 — FRONTEND INTEGRATION

Provide:

* API base URL configuration
* API service layer (Axios/Fetch)
* Token interceptor for Sanctum authentication
* Centralized HTTP error handling (401, 403, 422, 500)

---

# 🚨 FINAL RULE

If any required information **cannot be clearly inferred from the frontend**,
**do not invent** — ask for the relevant files or clarification instead.

---
