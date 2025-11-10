## Quick guide for AI coding agents working on this repo

Purpose: provide immediate, actionable context so an AI can be productive editing the Django backend.

- Project type: Django backend (Django 5.x). Main entry: `manage.py`.
- Project package: `project_config/` (settings, urls, wsgi/asgi).
- Local app of interest: `users/` (custom user model, empty views/tests scaffolding).

Key architecture & conventions
- Single Django project with a small set of apps. Core files:
  - `project_config/settings.py` — primary configuration (DB, INSTALLED_APPS, middleware, REST + JWT config).
  - `project_config/urls.py` — root URL router (currently only `admin/`). Add API includes here.
  - `users/models.py` — custom user model: `User(AbstractBaseUser, PermissionsMixin)` and `CustomUserManager`.
    - Important: `AUTH_USER_MODEL = 'users.User'` is set in `project_config/settings.py`.
    - `USERNAME_FIELD = 'email'` and `REQUIRED_FIELDS = ['username']`. When creating superusers, a `username` is required.
  - `users/views.py` and `users/tests.py` are scaffolds (empty). Place API views/serializers here or a `users/api/` subpackage.

Database & env
- `project_config/settings.py` currently contains a PostgreSQL config with placeholder values (`NAME`, `USER`, `PASSWORD`, `HOST`, `PORT`).
  - For quick local testing you can switch to SQLite by replacing `DATABASES['default']` with a simple sqlite config, or set proper Postgres env vars.
  - Do NOT commit production secrets. `SECRET_KEY` is a placeholder string in settings.

Authentication & third-party libs
- `INSTALLED_APPS` includes `rest_framework`, `rest_framework_simplejwt`, and `corsheaders`.
  - `REST_FRAMEWORK` is configured to use JWT auth: `rest_framework_simplejwt.authentication.JWTAuthentication`.
  - CORS is permissive (`CORS_ORIGIN_ALLOW_ALL = True`) for development.
  - If you add authentication endpoints, follow SimpleJWT docs and expose token endpoints (e.g. token/obtain, token/refresh).

How to run and common commands (developer workflows)
- Create/activate virtualenv and install dependencies. The repo doesn't include `requirements.txt`; typical deps:
  - `django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, and `psycopg2-binary` (if using Postgres).

Examples (Windows PowerShell):
```powershell
# create venv
python -m venv .venv; .\.venv\Scripts\Activate.ps1
# install (example)
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary
# migrate and run
python manage.py makemigrations; python manage.py migrate
python manage.py createsuperuser   # will prompt for email + username per model
python manage.py runserver
``` 

- Run tests:
```powershell
python manage.py test
```

Where to make changes (placeholders for your partner)
- Database config: `project_config/settings.py` — replace placeholder Postgres values or swap to SQLite for local dev.
- Add API routes: edit `project_config/urls.py` to include app routes, e.g.
  - `from django.urls import include, path`
  - `path('api/users/', include('users.urls'))`
- Implement API: create `users/serializers.py`, `users/urls.py`, and flesh out `users/views.py`.
- Tests: implement tests in `users/tests.py`. Keep tests small and focused; examples should import `django.test.TestCase`.

Project-specific patterns & gotchas
- Custom user model already in place. Never switch `AUTH_USER_MODEL` after migrations without careful migration planning.
- Creating a superuser requires the `username` field because `REQUIRED_FIELDS = ['username']`.
- `INSTALLED_APPS` uses the app config path: `users.apps.UsersConfig` (edit `users/apps.py` when renaming app labels).
- `corsheaders.middleware.CorsMiddleware` is placed near the top of `MIDDLEWARE` — keep it there if you modify middleware order.

Integration points
- JWT auth: SimpleJWT is enabled in settings; add token endpoints and protect views using `permission_classes`.
- Database: default expects PostgreSQL — CI or deployment may expect Postgres; for local dev you can use SQLite but ensure production uses environment vars.

Small notes for the partner
- I left placeholders where behavior is not implemented (empty `users/views.py`, `users/tests.py`).
- If you change the user model fields or auth logic, update `project_config/settings.py` and relevant serializers/views.

If anything here is unclear or you want the document extended with examples (example `users/urls.py`, serializer templates, or CI test commands), tell me which example to add and I'll update this file.
