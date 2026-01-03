import userService from "@/services/userService";
import { create } from "zustand";
import type { UserProfileState } from "@/types/Store";
import { syncTabs } from "zustand-sync-tabs";

const useUserStore = create<UserProfileState>()(
  syncTabs(
    (set) => ({
      profile: null,
      ratings: [],
      biddings: [],
      sellings: [],
      wons: [],
      favorites: null,
      loading: false,
      error: null,

      fetchProfile: async (userId: string | number) => {
        try {
          set({ loading: true, error: null });
          const profile = await userService.getUserProfile(userId);
          set({ profile });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch profile!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (userId: string | number, data) => {
        try {
          set({ loading: true, error: null });
          const profile = await userService.updateUser(userId, data);
          set({ profile });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to update profile!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      changePassword: async (
        userId: string | number,
        oldPassword: string,
        newPassword: string,
        confirmPassword: string
      ) => {
        try {
          set({ loading: true, error: null });
          await userService.changePassword(
            userId,
            oldPassword,
            newPassword,
            confirmPassword
          );
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to change password!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      sendOTP: async (userId: string | number, email: string) => {
        try {
          set({ loading: true, error: null });
          await userService.sendOTP(userId, email);
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to send OTP!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      verifyOTP: async (
        userId: string | number,
        email: string,
        otp: string
      ) => {
        try {
          set({ loading: true, error: null });
          const profile = await userService.verifyOTP(userId, email, otp);
          set({ profile });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to verify OTP!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      fetchRatings: async (userId: string | number, page = 1, limit = 10) => {
        try {
          set({ loading: true, error: null });
          const data = await userService.getRatings(userId, page, limit);
          set({ ratings: data.ratings });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch ratings!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      fetchBiddings: async (userId: string | number, page = 1, limit = 10) => {
        try {
          set({ loading: true, error: null });
          const data = await userService.getBiddings(userId, page, limit);
          set({ biddings: data.products });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch biddings!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      fetchSellings: async (userId: string | number, page = 1, limit = 10) => {
        try {
          set({ loading: true, error: null });
          const data = await userService.getSellings(userId, page, limit);
          set({ sellings: data.products });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch sellings!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      fetchWons: async (userId: string | number, page = 1, limit = 10) => {
        try {
          set({ loading: true, error: null });
          const data = await userService.getWons(userId, page, limit);
          set({ wons: data.products });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch won auctions!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      fetchFavorites: async (userId: string | number, params?: any) => {
        try {
          set({ loading: true, error: null });
          const data = await userService.getFavorites(userId, params);
          set({ favorites: data });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch favorites!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      markFavorite: async (
        userId: string | number,
        productId: string | number
      ) => {
        try {
          set({ loading: true, error: null });
          await userService.markFavorite(userId, productId);
          // Refresh favorites after marking
          const data = await userService.getFavorites(userId);
          set({ favorites: data });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to mark favorite!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      unmarkFavorite: async (
        userId: string | number,
        productId: string | number
      ) => {
        try {
          set({ loading: true, error: null });
          await userService.unmarkFavorite(userId, productId);
          // Refresh favorites after unmarking
          const data = await userService.getFavorites(userId);
          set({ favorites: data });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to unmark favorite!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      requestToBeSeller: async (userId: string | number) => {
        try {
          set({ loading: true, error: null });
          await userService.requestToBeSeller(userId);
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to request seller status!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      rateSeller: async (
        userId: string | number,
        productId: string | number,
        rating: number,
        content: string
      ) => {
        try {
          set({ loading: true, error: null });
          await userService.rateSeller(userId, productId, rating, content);
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to rate seller!";
          set({ error: message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      clearUserData: () => {
        set({
          profile: null,
          ratings: [],
          biddings: [],
          sellings: [],
          wons: [],
          favorites: null,
          loading: false,
          error: null,
        });
      },
    }),{
      name: "user-store",
    }    
  )
);

export default useUserStore;
