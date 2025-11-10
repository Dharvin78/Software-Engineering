# Frontend Auth integration notes

This project includes a small auth integration wired to a Django backend. Key files:

- `lib/api.ts` — centralized axios instance. Set `NEXT_PUBLIC_API_URL` to change the API base URL.
  - `api` is the axios instance.
  - `setAuthToken(token)` sets/clears the Authorization header.
  - `setupInterceptors(onRefreshToken?)` installs a response interceptor that can call `onRefreshToken` when a 401 is encountered.

- `contexts/AuthContext.tsx` — high-level auth provider used across the app.
  - `login(email, password)` — POSTs to `/token/`, stores access (and refresh if provided), and fetches `/me/`.
  - `signup(userData)` — POSTs to `/register/` then calls `login`.
  - `requestPasswordReset(email)` — POSTs to `/password-reset/`.
  - `logout()` — clears tokens and navigates to `/login`.

Backend expectations (example):
- `POST /token/` -> { access, refresh }
- `POST /token/refresh/` -> { access }
- `POST /password-reset/` -> accepts { email } and triggers an email

See `docs/backend-auth.md` for example Django snippets (SimpleJWT + password reset).

Developer notes:
- If your backend returns different token keys (e.g., `token` instead of `access`), change `AuthContext` where it reads `tokenResponse.data`.
- To enable auto-refresh: implement a refresh endpoint and the frontend `onRefreshToken` callback in `AuthContext` is already wired to call `/token/refresh/` using the stored refresh token.

