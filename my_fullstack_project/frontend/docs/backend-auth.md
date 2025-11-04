# Backend Auth & Password Reset - Example (Django)

This document contains example snippets for implementing the backend endpoints the frontend expects.
They are suggestions — adapt to your project's URL structure and libraries.

## Recommended packages
- `djangorestframework`
- `djangorestframework-simplejwt` for JWT / access+refresh tokens
- `django-rest-passwordreset` or Django's built-in password reset flow for sending reset emails

### SimpleJWT (token endpoints)
Install:
```
pip install djangorestframework-simplejwt
```

In `settings.py`:
```py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

In `urls.py`:
```py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api/users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

The default responses are:
- POST `/api/users/token/` -> { "access": "<jwt>", "refresh": "<refresh-token>" }
- POST `/api/users/token/refresh/` -> { "access": "<new-jwt>" }

The frontend `AuthContext` expects this shape but also supports some alternate names.

---

### Password reset (example using `django-rest-passwordreset`)
Install:
```
pip install django-rest-passwordreset
```

In `urls.py`:
```py
from django.urls import path, include

urlpatterns += [
    path('api/users/password-reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]
```

This package provides endpoints such as:
- `POST /api/users/password-reset/` - initiate reset (body: { "email": "..." })
- `POST /api/users/password-reset/confirm/` - confirm with token and set new password

If you prefer to implement your own using Django's built-in `PasswordResetForm`, you can create a small API view that accepts an email and sends the link.

---

### Notes
- The frontend expects the token endpoints at `/api/users/token/` and `/api/users/token/refresh/` and the password reset endpoint at `/api/users/password-reset/`. If your backend uses different paths, update `frontend/lib/api.ts` or `frontend/contexts/AuthContext.tsx` accordingly.
- For security, ensure your password reset link points to a frontend route that accepts and validates the token before allowing the user to set a new password.

If you'd like, I can scaffold a minimal Django example project or provide full view/serializer code for a commonly-used setup (SimpleJWT + django-rest-passwordreset).
