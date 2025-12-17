import api from "@/lib/axios";
import type { ProductDetail } from "@/types/Product";

const productService = {
  async getProductById(id: string | number): Promise<ProductDetail> {
    const res = await api.get(`/products/${id}`, { withCredentials: true });
    // API sample: { message, data: { product: {...} } }
    return res.data?.data?.product as ProductDetail;
  },

  async placeBid(
    productId: string | number,
    userId: string | number,
    bidPrice: number
  ): Promise<void> {
    const res = await api.post(
      `/products/${productId}/bid/${userId}`,
      { bidPrice },
      { withCredentials: true }
    );
    return res.data;
  },

  async askQuestion(
    productId: string | number,
    userId: string | number,
    question: string
  ): Promise<void> {
    const res = await api.post(
      `/products/${productId}/ask/${userId}`,
      { question },
      { withCredentials: true }
    );
    return res.data;
  },
};

export default productService;