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

  placeBid: async (productId: string | number, data: { bidAmount?: number; maxPrice?: number }) => {
    try {
      set({ loading: true, error: null });
      const result = await productService.placeBid(productId, data);
      // Refresh product data to get updated bid information
      const product = await productService.getProductById(productId);
      set({ product });
      return result;
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

  askQuestion: async (productId: string | number, question: string) => {
    try {
      set({ loading: true, error: null });
      await productService.askQuestion(productId, question);
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

  askToBid: async (productId: string | number) => {
    try {
      set({ loading: true, error: null });
      await productService.askToBid(productId);
      // Refresh product data to updated user_bid_request_state
      const product = await productService.getProductById(productId);
      set({ product });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to request permission!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchBidRequests: async (productId: string | number, params?: any) => {
    try {
      set({ loading: true, error: null });
      return await productService.getBidRequests(productId, params);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to fetch bid requests!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  acceptBidRequest: async (productId: string | number, requestId: number) => {
    try {
      set({ loading: true, error: null });
      await productService.acceptBidRequest(productId, requestId);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to accept bid request!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  rejectBidRequest: async (productId: string | number, requestId: number) => {
    try {
      set({ loading: true, error: null });
      await productService.rejectBidRequest(productId, requestId);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to reject bid request!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Seller bidder management
  fetchBidders: async (productId: string | number, params?: { page?: number; limit?: number }) => {
    try {
      set({ loading: true, error: null });
      return await productService.getBidders(productId, params);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to fetch bidders!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  refuseBidder: async (productId: string | number, bidderId: number) => {
    try {
      set({ loading: true, error: null });
      const result = await productService.refuseBidder(productId, bidderId);
      // Refresh product data to get updated bid information
      const product = await productService.getProductById(productId);
      set({ product });
      return result;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to refuse bidder!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  unrefuseBidder: async (productId: string | number, bidderId: number) => {
    try {
      set({ loading: true, error: null });
      const result = await productService.unrefuseBidder(productId, bidderId);
      // Refresh product data
      const product = await productService.getProductById(productId);
      set({ product });
      return result;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to unrefuse bidder!";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useProductStore;