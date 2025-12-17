import api from "@/lib/axios";
import type { ProductDetail } from "@/types/Product";

const productService = {
  async getProductById(id: string | number): Promise<ProductDetail> {
    const res = await api.get(`/products/${id}`, { withCredentials: true });
    // API sample: { message, data: { product: {...} } }
    return res.data?.data?.product as ProductDetail;
  },
};

export default productService;