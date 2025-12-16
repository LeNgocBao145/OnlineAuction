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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;
      console.log("refresh", originalRequest._retryCount);
      try {
        const { accessToken } = await authService.refresh();
        useAuthStore.getState().setAccessToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        useAuthStore.getState().clearState();
        console.error(error);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
