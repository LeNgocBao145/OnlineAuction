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

      register: async (
        name: string,
        email: string,
        password: string,
        birthdate: string,
        address: string
      ) => {
        try {
          set({ loading: true });
          await authService.register(name, email, password, birthdate, address);
          toast.success(
            "Register successfully! You will be redirected to log in page."
          );
        } catch (error) {
          console.error(error);
          toast.error("Error register account");
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
        } catch (error) {
          console.error(error);
          toast.error("Error logging in");
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
    }),
    {
      name: "auth-storage",
      // partialize indicates that you just allow neccessary state you choose to store in local storage
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
