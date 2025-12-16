import api from "@/lib/axios";

const authService = {
  register: async (
    name: string,
    email: string,
    password: string,
    birthdate: string,
    address: string
  ) => {
    try {
      const res = await api.post(
        "/auth/register",
        { name, email, password, birthdate, address },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const res = await api.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/users/me", { withCredentials: true });
      return res.data.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  refresh: async () => {
    try {
      const res = await api.post("/auth/refresh", { withCredentials: true });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default authService;
