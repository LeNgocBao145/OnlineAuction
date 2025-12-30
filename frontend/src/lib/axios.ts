import authService from "@/services/authService";
import useAuthStore from "@/stores/authStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Set accessToken into request header
api.interceptors.request.use((config) => {
  // Method getState() just get the value when this method is called
  // if there is any change of accessToken variable, it will not
  // automatically update the value of variable
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register", 
  "/auth/refresh",
  "/auth/send-otp",
  "/auth/verify-otp",
  "/products",
];

const isPublicRoute = (url: string) => {
  return PUBLIC_ROUTES.some(route => url.includes(route));
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for public routes or auth routes
    if (isPublicRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Only try refresh if user has a token (is logged in)
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;
      console.log("refresh", originalRequest._retryCount);
      try {
        const { accessToken: newToken } = await authService.refresh();
        useAuthStore.getState().setAccessToken(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        console.error(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
