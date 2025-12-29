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

  placeBid: async (productId: string | number, userId: string | number, bidAmount: number) => {
    try {
      set({ loading: true, error: null });
      await productService.placeBid(productId, userId, bidAmount);
      // Refresh product data to get updated bid information
      const product = await productService.getProductById(productId);
      set({ product });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to place bid!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  askQuestion: async (productId: string | number, userId: string | number, question: string) => {
    try {
      set({ loading: true, error: null });
      await productService.askQuestion(productId, userId, question);
      // Refresh product data to get updated Q&A
      const product = await productService.getProductById(productId);
      set({ product });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to ask question!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useProductStore;