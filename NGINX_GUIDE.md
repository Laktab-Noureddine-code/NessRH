# Nginx Configuration Guide for HREM

This document explains **every line** of the `nginx.conf` file, how Nginx processes a request, and how to deploy it on your server.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Request Flow Diagram](#request-flow-diagram)
3. [Line-by-Line Explanation](#line-by-line-explanation)
4. [How to Install & Deploy](#how-to-install--deploy)
5. [Laravel .env Changes](#laravel-env-changes)
6. [React Build & VITE_BACKEND_URL](#react-build--vite_backend_url)
7. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│   React SPA  ──  axios calls /api/*  and /sanctum/csrf-cookie  │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NGINX (port 80)                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  location /   │    │ location     │    │ location         │  │
│  │  (frontend)   │    │ /api/        │    │ /sanctum/        │  │
│  │              │    │ (backend)    │    │ (csrf cookie)    │  │
│  └──────┬───────┘    └──────┬───────┘    └───────┬──────────┘  │
│         │                   │                    │              │
│    Static files        PHP-FPM              PHP-FPM            │
│   client/dist/       server/public/       server/public/       │
└─────────────────────────────────────────────────────────────────┘
```

**Nginx acts as a single entry point** — it decides whether to:
- Serve a **static file** (React build: JS, CSS, images)
- Forward the request to **PHP-FPM** (Laravel API)

This means both the frontend and backend live behind **one domain** (e.g. `hrem.local`), which eliminates CORS issues.

---

## Request Flow Diagram

Here's what happens for different types of requests:

### A) User visits `http://hrem.local/login`

```
Browser → Nginx
         → location /          (matches because /login is not /api/ or /sanctum/)
         → try_files $uri      (no file called "login" exists)
         → try_files $uri/     (no directory called "login/" exists)
         → falls back to /index.html
         → Serves client/dist/index.html
         → React Router renders the /login component
```

### B) React calls `GET /api/me`

```
Browser → Nginx
         → location /api/         (matches because path starts with /api/)
         → try_files $uri          (no static file matches)
         → falls back to @laravel  (named location)
         → @laravel rewrites to /index.php/api/me
         → location ~ ^/index\.php$ catches it
         → fastcgi_pass sends it to PHP-FPM
         → PHP-FPM runs server/public/index.php
         → Laravel routes the request to AuthController@me
         → JSON response sent back to browser
```

### C) React calls `GET /sanctum/csrf-cookie`

```
Browser → Nginx
         → location /sanctum/     (matches because path starts with /sanctum/)
         → try_files $uri          (no static file)
         → falls back to @laravel
         → @laravel rewrites to /index.php/sanctum/csrf-cookie
         → PHP-FPM → Laravel Sanctum sets XSRF-TOKEN cookie
         → 204 No Content response sent back
```

### D) Browser requests `GET /assets/index-a1b2c3.js`

```
Browser → Nginx
         → location /assets/      (matches because path starts with /assets/)
         → try_files $uri          (file exists in client/dist/assets/)
         → Serves the JS file directly with 1-year cache header
         → No PHP involved
```

---

## Line-by-Line Explanation

### Section 1: Listener

```nginx
listen       80;
```
- Tells Nginx to listen on **port 80** (standard HTTP).
- For HTTPS, you'd add `listen 443 ssl;` and SSL certificate paths.

```nginx
server_name  hrem.local;
```
- The **domain name** this server block responds to.
- Change this to your real domain in production (e.g. `hr.yourcompany.com`).
- For local dev, add `127.0.0.1 hrem.local` to your hosts file.

```nginx
charset      utf-8;
```
- Adds `charset=utf-8` to the `Content-Type` response header.
- Ensures Arabic, French, and special characters render correctly.

---

### Section 2: Logging

```nginx
access_log  /var/log/nginx/hrem_access.log;
error_log   /var/log/nginx/hrem_error.log;
```
- **access_log**: Records every HTTP request (IP, URL, status code, time).
- **error_log**: Records Nginx errors (config problems, upstream failures).
- Use `tail -f /var/log/nginx/hrem_error.log` to watch errors in real-time.

---

### Section 3: Upload Size

```nginx
client_max_body_size 20M;
```
- Maximum size of the **request body** (file uploads, JSON payloads).
- Default Nginx limit is only 1MB — too small for employee photos or documents.
- Must also match PHP's `upload_max_filesize` and `post_max_size` in `php.ini`.

---

### Section 4: Root & Index

```nginx
root /var/www/hrem/client/dist;
index index.html;
```
- **root**: The default directory Nginx looks in when serving files.
- Points to the React **production build** output (`npm run build` creates `client/dist/`).
- **index**: When a directory is requested, serve `index.html` by default.

---

### Section 5: Frontend — React SPA

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This is the **heart of SPA hosting**:

| Step | What it does | Example for `/dashboard` |
|------|-------------|--------------------------|
| `$uri` | Check if a file with this exact name exists | Does `client/dist/dashboard` exist? → **No** |
| `$uri/` | Check if a directory with this name exists | Does `client/dist/dashboard/` exist? → **No** |
| `/index.html` | Serve `index.html` as the fallback | Serves `client/dist/index.html` → **Yes!** |

**Why?** React Router handles routing in the browser. Without this, refreshing `/dashboard` would return a 404 because there's no physical file called `dashboard`. The fallback ensures React always loads and handles the route client-side.

---

### Section 6: Static Assets Caching

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```
- **`location /assets/`**: Matches requests for Vite-built assets (JS, CSS, fonts).
- **`expires 1y`**: Tells the browser to cache these files for 1 year.
- **`Cache-Control "public, immutable"`**: The file will **never change** (Vite uses content hashes in filenames like `index-a1b2c3d4.js`). If the content changes, the filename changes too.
- **`try_files $uri =404`**: Serve the file if it exists, otherwise return 404 (don't fall back to `index.html`).

---

### Section 7: Backend API

```nginx
location /api/ {
    alias /var/www/hrem/server/public/;
    try_files $uri $uri/ @laravel;

    location ~ \.php$ {
        fastcgi_pass  unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        include       fastcgi_params;
    }
}
```

| Line | Purpose |
|------|---------|
| `location /api/` | Any URL starting with `/api/` enters this block |
| `alias` | Maps the URL to the Laravel `public/` directory on disk |
| `try_files $uri $uri/ @laravel` | If no static file matches, jump to the `@laravel` named location |
| `location ~ \.php$` | Nested block — if the request ends in `.php`, send it to PHP-FPM |
| `fastcgi_pass` | The socket where **PHP-FPM** listens. Adjust `php8.2` to your version |
| `fastcgi_index` | Default PHP file to execute |
| `fastcgi_param SCRIPT_FILENAME` | Tells PHP **which file** to run |
| `include fastcgi_params` | Loads standard CGI environment variables (REQUEST_METHOD, QUERY_STRING, etc.) |

---

### Section 8: Sanctum CSRF

```nginx
location /sanctum/ {
    alias /var/www/hrem/server/public/;
    try_files $uri $uri/ @laravel;
    ...
}
```
- Identical to `/api/` but specifically for the **Sanctum CSRF cookie** endpoint.
- Your React app calls `GET /sanctum/csrf-cookie` before login to get the XSRF token.
- This token is then sent with every subsequent request for CSRF protection.

---

### Section 9: Laravel Fallback

```nginx
location @laravel {
    rewrite ^(.*)$ /index.php$1 last;
}
```
- **Named location** (starts with `@`) — can only be reached via `try_files` fallback.
- **`rewrite`**: Takes any URL (e.g. `/api/companies`) and prepends `/index.php` → `/index.php/api/companies`.
- **`last`**: After rewriting, re-evaluate all location blocks (which hits `location ~ ^/index\.php$`).
- This is how **all** Laravel routes work — everything goes through `public/index.php`.

---

### Section 10: Laravel Front Controller

```nginx
location ~ ^/index\.php$ {
    root          /var/www/hrem/server/public;
    fastcgi_pass  unix:/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include       fastcgi_params;

    fastcgi_param HTTP_HOST       $host;
    fastcgi_param REQUEST_URI     $request_uri;
    fastcgi_param QUERY_STRING    $query_string;

    fastcgi_read_timeout  300;
    fastcgi_send_timeout  300;
}
```

| Line | Purpose |
|------|---------|
| `location ~ ^/index\.php$` | Regex match — only catches requests for `/index.php` exactly |
| `root` | Overrides the global root to point to Laravel's `public/` directory |
| `fastcgi_pass` | Forwards to PHP-FPM via a Unix socket (faster than TCP) |
| `SCRIPT_FILENAME` | `$realpath_root` resolves symlinks → tells PHP the **real** path to `index.php` |
| `HTTP_HOST` | Passes the original domain name to PHP (used by Laravel's `url()` helper) |
| `REQUEST_URI` | The original URL path — Laravel uses this for routing |
| `QUERY_STRING` | Query parameters (`?page=1&search=john`) |
| `fastcgi_read_timeout 300` | Wait up to 5 minutes for PHP to respond (useful for heavy reports) |
| `fastcgi_send_timeout 300` | Wait up to 5 minutes to send data to PHP |

---

### Section 11: Security — Hidden Files

```nginx
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```
- **`~ /\.`**: Regex matches any URL containing `/.` (dot files/folders).
- Blocks access to `.env`, `.git/`, `.htaccess`, etc.
- **Critical** — your `.env` contains database passwords, API keys, and app secrets.
- `access_log off` and `log_not_found off` prevent log spam from bots probing for these files.

---

### Section 12: Block Direct PHP Execution

```nginx
location ~* \.php$ {
    return 404;
}
```
- **Catch-all** for any `.php` request not already handled by earlier location blocks.
- Prevents attackers from executing arbitrary PHP files they might upload.
- The `~*` makes the match **case-insensitive** (`.PHP`, `.Php` are also blocked).

---

## How to Install & Deploy

### Prerequisites

- Ubuntu/Debian server with:
  - **Nginx** installed
  - **PHP-FPM** installed (8.1 or 8.2)
  - **Composer** installed
  - **Node.js** installed (for building the React app)

### Step-by-Step

#### 1. Upload your project to the server

```bash
# Place code in /var/www/hrem/
sudo mkdir -p /var/www/hrem
sudo chown -R $USER:$USER /var/www/hrem

# Clone or copy your project
git clone https://github.com/your-repo/hrem.git /var/www/hrem
```

#### 2. Build the React frontend

```bash
cd /var/www/hrem/client
npm install
npm run build          # Creates client/dist/ directory
```

#### 3. Set up the Laravel backend

```bash
cd /var/www/hrem/server
composer install --optimize-autoloader --no-dev
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

#### 4. Set permissions for Laravel

```bash
cd /var/www/hrem/server
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### 5. Copy the Nginx config

```bash
# Copy config and enable it
sudo cp /var/www/hrem/nginx.conf /etc/nginx/sites-available/hrem
sudo ln -s /etc/nginx/sites-available/hrem /etc/nginx/sites-enabled/hrem

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test the config for syntax errors
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 6. (Optional) Add local domain to hosts file

```bash
# On your LOCAL machine (not the server), if testing locally:
# Linux/Mac: /etc/hosts
# Windows:   C:\Windows\System32\drivers\etc\hosts

127.0.0.1   hrem.local
```

---

## Laravel .env Changes

Update your `server/.env` for production:

```env
APP_URL=http://hrem.local
FRONTEND_URL=http://hrem.local

# Sanctum must know your domain
SANCTUM_STATEFUL_DOMAINS=hrem.local

# Session domain (no port needed since Nginx handles port 80)
SESSION_DOMAIN=hrem.local
```

**Why these matter:**
- `APP_URL` — Laravel uses this to generate URLs in emails, responses, etc.
- `SANCTUM_STATEFUL_DOMAINS` — Sanctum only issues session cookies to **listed domains**. Without this, authentication won't work.
- `SESSION_DOMAIN` — The cookie domain. Must match the domain the browser sees.

---

## React Build & VITE_BACKEND_URL

Since Nginx serves **both** frontend and backend on the same domain, you **don't need** a separate backend URL. Update or create `client/.env.production`:

```env
VITE_BACKEND_URL=
```

Leaving it empty means axios will use **relative URLs** (`/api/me` instead of `http://localhost:8000/api/me`), which is exactly what we want — Nginx handles the routing.

Your existing axios config already handles this:

```typescript
baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
```

When `VITE_BACKEND_URL` is empty, set it to `""` (empty string) or just `/` so all API calls are relative:

```env
VITE_BACKEND_URL=/
```

---

## Common Issues & Troubleshooting

### 1. "502 Bad Gateway"

**Cause:** PHP-FPM is not running or the socket path is wrong.

```bash
# Check if PHP-FPM is running
sudo systemctl status php8.2-fpm

# Start it
sudo systemctl start php8.2-fpm

# Find the correct socket path
ls /run/php/
# Update nginx.conf fastcgi_pass if the version is different
```

### 2. "404 Not Found" on API routes

**Cause:** The rewrite or alias paths are incorrect.

```bash
# Verify Laravel's public directory exists
ls /var/www/hrem/server/public/index.php

# Test from command line
curl -v http://hrem.local/api/login
```

### 3. "403 Forbidden"

**Cause:** File permissions.

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/hrem/server/storage
sudo chown -R www-data:www-data /var/www/hrem/server/bootstrap/cache
```

### 4. "419 CSRF Token Mismatch" on Login

**Cause:** Sanctum domain not configured correctly.

Verify in `server/.env`:
```env
SANCTUM_STATEFUL_DOMAINS=hrem.local
SESSION_DOMAIN=hrem.local
```

Also ensure your React app calls `/sanctum/csrf-cookie` before the login POST.

### 5. Uploaded files exceed limit

**Cause:** Nginx or PHP limit is too low.

```bash
# In nginx.conf — already set:
client_max_body_size 20M;

# In php.ini — update these:
upload_max_filesize = 20M
post_max_size = 20M
```

### 6. Finding your PHP-FPM socket version

```bash
# Check installed PHP version
php -v

# List available sockets
ls /run/php/php*-fpm.sock

# Update ALL fastcgi_pass lines in nginx.conf to match
```

---

## HTTPS (Production)

For production, use **Certbot** to add free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hr.yourcompany.com
```

Certbot will automatically:
1. Obtain an SSL certificate from Let's Encrypt
2. Modify your Nginx config to listen on port 443
3. Add a redirect from HTTP (80) → HTTPS (443)
4. Set up auto-renewal

After HTTPS is enabled, update `.env`:
```env
APP_URL=https://hr.yourcompany.com
SESSION_SECURE_COOKIE=true
```

---

## Quick Reference: Where Files Go

| What | Path on Server |
|------|---------------|
| Nginx config | `/etc/nginx/sites-available/hrem` |
| Nginx symlink | `/etc/nginx/sites-enabled/hrem` |
| React build | `/var/www/hrem/client/dist/` |
| Laravel code | `/var/www/hrem/server/` |
| Laravel entry | `/var/www/hrem/server/public/index.php` |
| Nginx access log | `/var/log/nginx/hrem_access.log` |
| Nginx error log | `/var/log/nginx/hrem_error.log` |
| PHP-FPM socket | `/run/php/php8.2-fpm.sock` |
| Hosts file (Windows) | `C:\Windows\System32\drivers\etc\hosts` |
| Hosts file (Linux) | `/etc/hosts` |
