import { create } from "zustand";
import homeService from "@/services/homeService";
import type { HomeState } from "@/types/Store";

const useHomeStore = create<HomeState>((set) => ({
  endingSoon: [],
  mostBids: [],
  highestPrice: [],
  loading: false,
  error: null,

  fetchHomeData: async () => {
    try {
      set({ loading: true, error: null });
      const response = await homeService.getHomeData();
      set({
        endingSoon: response.data.endingSoon,
        mostBids: response.data.mostBids,
        highestPrice: response.data.highestPrice,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch home data",
        loading: false,
      });
    }
  },
}));

export default useHomeStore;
