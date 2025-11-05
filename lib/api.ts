import axios from "axios";

// Centralized Axios instance for the frontend.
// Use NEXT_PUBLIC_API_URL to override in env when needed.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/users";

export const api = axios.create({
  baseURL: API_URL,
  // You can add other global axios defaults here (timeout, withCredentials, etc.)
});

/**
 * Sets or clears the Authorization header on the shared axios instance.
 * Call this whenever you update auth state (login/logout/refresh).
 */
export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    // delete ensures the header is removed from the defaults
    // and avoids setting it to `null` which can be problematic.
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete api.defaults.headers.common["Authorization"];
  }
};

/**
 * Installs response interceptors for the shared axios instance.
 *
 * onRefreshToken: an optional callback the app can provide that should
 * try to obtain a fresh access token (for example, using a refresh token).
 * It should return the new access token string (or null on failure).
 *
 * This function is intentionally generic and currently only provides a
 * skeleton; wire it to your backend refresh endpoint when available.
 */
export const setupInterceptors = (onRefreshToken?: () => Promise<string | null>) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as any;

      // If the request failed with 401 and we haven't retried yet, try refresh.
      if (error.response && error.response.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;
        if (onRefreshToken) {
          try {
            const newToken = await onRefreshToken();
            if (newToken) {
              setAuthToken(newToken);
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed; fall through to reject original error
            console.error("Token refresh failed", refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;