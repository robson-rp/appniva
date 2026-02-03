# Copilot instructions

## Project overview
- Monorepo with the web app in frontend/ (backend/ is currently empty).
- Frontend stack: Vite + React + TypeScript, Tailwind/shadcn-ui, React Router, React Query, Supabase.

## Backend (Laravel) rules of engagement
- Backend must be derived strictly from frontend usage; do not invent entities/fields/business rules.
- Phase 1 (mandatory): reverse‑engineer frontend (forms, API payloads, TS types, tables/filters, implicit relations) before any PHP.
- Phase 1 output must include: detected entities, fields per entity (Field | Type | Required? | Source file), inferred relationships, and a text-only logical DB model.
- Stop and request confirmation after Phase 1 before any migrations/scaffolding.
- Phase 2: always scaffold with Artisan first (e.g., make:model -mcr, make:request, make:policy), never manual file creation.
- Phase 3: MySQL migrations follow 3NF where possible, use constrained foreign keys with cascade, add indexes for UI filters, match column types to frontend payloads; explain tradeoffs if denormalizing.
- Phase 4: thin controllers, Form Requests for validation, API Resources for output, business logic in Services/Actions.
- Phase 5: Sanctum for SPA auth, policies for authorization, OWASP basics (no raw SQL, hide sensitive fields, rate limit auth/mutations).
- Phase 6–8: queues for >500ms tasks, large seed datasets (≥10k) for listable entities, feature tests for 200/201/422/401/403 plus frontend contract checks (date formats, snake_case vs camelCase, JSON shapes).
- Phase 9: provide API base URL config, frontend API service layer with Sanctum token handling and centralized error handling (401/403/422/500).

## Architecture & data flow
- App entry: frontend/src/main.tsx mounts frontend/src/App.tsx with providers (ThemeProvider, QueryClientProvider, AuthProvider, TooltipProvider, and toasters).
- Routing is centralized in frontend/src/App.tsx. The /app route uses frontend/src/components/layout/ResponsiveRouteWrapper.tsx to redirect:
  - Unauthed -> /auth
  - Not onboarded -> /onboarding
  - Mobile/tablet -> /home (MobileLayout)
  - Desktop -> /dashboard (AppLayout)
- Auth/profile state lives in frontend/src/contexts/AuthContext.tsx. Use useAuth() in hooks/components instead of calling Supabase auth directly.
- Data access follows a hook pattern in frontend/src/hooks/use*.ts (React Query + Supabase). Example: frontend/src/hooks/useAccounts.ts.
  - Queries are keyed by user id and enabled only when a user exists.
  - Mutations invalidate relevant queries and surface feedback via Sonner toasts.
- Supabase types are generated in frontend/src/integrations/supabase/types.ts (do not edit by hand).

## Integrations & configuration
- Supabase client: frontend/src/integrations/supabase/client.ts. Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
- PWA config is in frontend/vite.config.ts (vite-plugin-pwa + Workbox cache for Supabase domain).

## UI & i18n conventions
- Use the @ alias for frontend/src (tsconfig + Vite).
- Shared UI components live in frontend/src/components/ui; utilities like cn() are in frontend/src/lib/utils.ts.
- i18n setup is in frontend/src/i18n/index.ts with translations in frontend/src/i18n/locales/*.json.

## Developer workflows (frontend/)
- Install deps: npm install
- Dev server: npm run dev (Vite uses port 8080)
- Build: npm run build (or npm run build:dev)
- Lint: npm run lint
- Preview: npm run preview
