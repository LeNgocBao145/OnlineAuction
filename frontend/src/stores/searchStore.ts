import { create } from "zustand";
import productService from "@/services/productService";
import type { SearchState } from "@/types/Store";
import type { FilterParams, FilteredProductsResponse } from "@/types/Product";

const useSearchStore = create<SearchState>((set) => ({
  data: null,
  loading: false,
  error: null,
  filterParams: {
    keyword: "",
    page: 1,
    limit: 9,
  },

  filterProducts: async (params: FilterParams) => {
    try {
      set({ loading: true, error: null });
      const response = await productService.filterProducts(params);
      set({ 
        data: response,
        filterParams: params,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to filter products!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  setFilterParams: (params: FilterParams) => {
    set({ filterParams: params });
  },

  clearSearch: () => {
    set({
      data: null,
      filterParams: {
        keyword: "",
        page: 1,
        limit: 9,
      },
      error: null,
    });
  },
}));

export default useSearchStore;
