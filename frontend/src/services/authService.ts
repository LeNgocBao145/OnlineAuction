import api from "@/lib/axios";

const authService = {
  register: async (
    email: string,
    name: string,
    password: string,
    birthdate: string,
    address: string,
    captchaToken: string
  ) => {
    const res = await api.post(
      "/auth/register",
      { name, email, password, birthdate, address, captchaToken },
      { withCredentials: true }
    );
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    return res.data;
  },

  logout: async () => {
    const res = await api.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    return res.data;
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

  sendOTP: async(email: string) => {
    try {
      const res = await api.post("/auth/send-otp", {email}, { withCredentials: true });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  verifyOTP: async(email: string, otp: string) => {
    try {
      const res = await api.post("/auth/verify-otp", {email, otp}, { withCredentials: true });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default authService;
