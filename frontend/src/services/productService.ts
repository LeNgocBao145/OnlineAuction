import api from "@/lib/axios";
import type { ProductDetail, FilterParams, FilteredProductsResponse } from "@/types/Product";

const productService = {
  async getProductById(id: string | number): Promise<ProductDetail> {
    const res = await api.get(`/products/${id}`, { withCredentials: true });
    return res.data?.data?.product as ProductDetail;
  },

  async filterProducts(params: FilterParams): Promise<FilteredProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.category) queryParams.append("category", params.category.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    
    const minPrice = params.minPrice ?? 0;
    const maxPrice = params.maxPrice ?? Number.MAX_SAFE_INTEGER;
    queryParams.append("minPrice", minPrice.toString());
    queryParams.append("maxPrice", maxPrice.toString());
    
    if (params.states && params.states.length > 0) {
      queryParams.append("states", params.states.join(","));
    }
    if (params.sort) queryParams.append("sort", params.sort);

    const res = await api.get(`/products?${queryParams.toString()}`, { 
      withCredentials: true 
    });

    return res.data?.data as FilteredProductsResponse;
  },

  async placeBid(
    productId: string | number,
    bidAmount: number
  ): Promise<void> {
    const res = await api.post(
      `/products/${productId}/bid`,
      { bidAmount },
      { withCredentials: true }
    );
    return res.data;
  },

  async askQuestion(
    productId: string | number,
    question: string
  ): Promise<void> {
    const res = await api.post(
      `/products/${productId}/ask`,
      { question },
      { withCredentials: true }
    );
    return res.data;
  },
};

export default productService;