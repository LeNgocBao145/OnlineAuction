import authService from "@/services/authService";
import { toast } from "sonner";
import { create } from "zustand";
import type { AuthState } from "@/types/Store";
import { persist } from "zustand/middleware";

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        localStorage.clear();
      },

      setAccessToken: (newAccessToken: string) => {
        set({ accessToken: newAccessToken });
      },

      // Step 1: Register info & send first OTP
      register: async (
        email: string,
        name: string,
        password: string,
        birthdate: string,
        address: string,
        captchaToken: string
      ) => {
        try {
          set({ loading: true });
          await authService.register(email, name, password, birthdate, address, captchaToken);
          toast.success(
            "OTP sent! Please check your email to verify your account."
          );
        } catch (error: any) {
          console.error(error);
          toast.error(error?.response?.data?.message || "Error sending OTP");
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Step 1b: Resend OTP (only need email)
      sendOTP: async (email: string) => {
        try {
          set({ loading: true });
          await authService.sendOTP(email);
          toast.success("OTP resent! Please check your email.");
        } catch (error) {
          console.error(error);
          toast.error("Error resending OTP");
        } finally {
          set({ loading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });

          localStorage.clear();

          const { accessToken } = await authService.login(email, password);
          set({ accessToken: accessToken });

          await get().fetchMe();

          toast.success("Welcome to AUCTIONIFY!");
        } catch (error: any) {
          console.error(error);
          toast.error(error?.response?.data?.message || "Invalid email or password");
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
          set({ accessToken: null, user: null, loading: false });
          toast.success("Signed out successfully");
        } catch (error) {
          console.error(error);
          toast.error("Error signing out");
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();
          set({ user });
        } catch (error) {
          console.error(error);
          toast.error("Error fetching data from database!");
        } finally {
          set({ loading: false });
        }
      },

      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe } = get();
          const { accessToken } = await authService.refresh();
          set({ accessToken });

          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          console.error(error);
          toast.error("Login session is expired, please sign in again!!");
          get().clearState();
        } finally {
          set({ loading: false });
        }
      },

      // Step 2: Verify OTP and create account
      verifyOTP: async (email: string, otp: string) => {
        try {
          await authService.verifyOTP(email, otp);
          toast.success("Registration successful! You can now sign in.");
        } catch (error) {
          console.error(error);
          toast.error("OTP verification failed!");
        }
      },
    }),
    {
      name: "auth-storage",
      // partialize indicates that you just allow neccessary state you choose to store in local storage
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
