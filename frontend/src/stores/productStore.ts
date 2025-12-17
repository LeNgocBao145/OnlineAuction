import { create } from "zustand";
import productService from "@/services/productService";
import type { ProductState } from "@/types/Store";

const useProductStore = create<ProductState>((set) => ({
  product: null,
  loading: false,
  error: null,

  fetchProduct: async (id: string | number) => {
    try {
      set({ loading: true, error: null });
      const product = await productService.getProductById(id);
      set({ product });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Can not load product data!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useProductStore;