import axios from "axios";

let token: string | null = null;

export const setAuthToken = (newToken: string | null) => {
  token = newToken;
  api.defaults.headers.common["Authorization"] = newToken ? `Token ${newToken}` : "";
};

const api = axios.create({
  baseURL: "http://localhost:8000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupInterceptors = (refreshTokenFn: () => Promise<string | null>) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      return Promise.reject(error);
    }
  );
};

export default api;
