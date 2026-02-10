# Authentication Flow — Sanctum SPA (Session-Based)

## Overview

This project uses **Laravel Sanctum SPA authentication**, which is the standard recommended approach for a Laravel API + React SPA on the same top-level domain. Authentication is handled via **httpOnly session cookies** — no tokens are stored in localStorage, cookies, or JS memory.

---

## How It Works

### 1. CSRF Cookie (before login/register)

Before any state-changing request, the frontend calls:

```
GET /sanctum/csrf-cookie
```

This sets two cookies:
- `XSRF-TOKEN` — readable by JS, sent back as `X-XSRF-TOKEN` header automatically by axios
- `laravel_session` — httpOnly session cookie

### 2. Login

```
POST /api/login  { email, password }
```

- Laravel verifies credentials via `Auth::attempt()`
- On success, regenerates the session and returns `200`
- The browser now has a valid session cookie — **no token is returned in the response body**

### 3. Authenticated Requests

All subsequent requests (e.g. `GET /api/me`, `POST /api/companies`) are automatically authenticated because:
- The browser sends the `laravel_session` cookie (via `withCredentials: true`)
- Axios sends the `X-XSRF-TOKEN` header (via `withXSRFToken: true`)
- Sanctum's stateful middleware validates the session

### 4. Logout

```
POST /api/logout
```

- Invalidates the session and regenerates the CSRF token
- The session cookie becomes invalid

---

## What Was Changed

### Backend

| File | Change |
|---|---|
| `bootstrap/app.php` | Added `$middleware->statefulApi()` — attaches Sanctum's session/cookie middleware to API routes from stateful domains |
| `app/Http/Controllers/AuthController.php` | Rewrote to use `Auth::login()`, `Auth::attempt()` + `session()->regenerate()`, and `Auth::guard('web')->logout()`. Removed all personal access token / custom JWT cookie logic |
| `routes/api.php` | Moved `GET /api/me` inside the `auth:sanctum` middleware group (session auth handles it now) |
| `.env` | Fixed `SANCTUM_STATEFUL_DOMAINS` — removed `http://` prefix (must be hostnames only, e.g. `localhost:5173`) |

### Frontend

| File | Change |
|---|---|
| `src/api/axios.ts` | Added `withXSRFToken: true`, `Accept: application/json` header, fixed env var to `VITE_BACKEND_URL`, exported `getCsrfCookie()` helper |
| `src/features/auth/Login.tsx` | Calls `getCsrfCookie()` before `POST /api/login` |
| `src/features/auth/Register.tsx` | Calls `getCsrfCookie()` before `POST /api/register` |

---

## Key Config Requirements

### `.env` (server)

```env
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost,127.0.0.1,127.0.0.1:8000
```

- `SESSION_DOMAIN` must match the domain both frontend and backend share
- `SANCTUM_STATEFUL_DOMAINS` must list frontend origins **without protocol** (no `http://`)

### `config/cors.php`

```php
'supports_credentials' => true,
```

This is required so the browser sends cookies cross-origin.

### Axios instance

```ts
const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,   // send cookies
    withXSRFToken: true,     // auto-send X-XSRF-TOKEN header
    headers: { "Accept": "application/json" },
});
```

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Create account + auto-login |
| POST | `/api/login` | Public | Start session |
| GET | `/api/me` | `auth:sanctum` | Get current user + company |
| POST | `/api/logout` | `auth:sanctum` | End session |
| CRUD | `/api/companies` | `auth:sanctum` | Company resource |

---

## Why Session Auth (Not Token-in-Cookie)

- **Standard Sanctum SPA approach** — documented and supported by Laravel
- **httpOnly cookies** — session cookie is not accessible from JavaScript, preventing XSS token theft
- **CSRF protection** — built-in via `XSRF-TOKEN` cookie + header verification
- **No custom middleware needed** — `auth:sanctum` works out of the box with `statefulApi()`
- **Automatic** — browser handles cookie sending, no manual `Authorization` headers
