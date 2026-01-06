import api from "@/lib/axios";
import type { Product, ProductDetail, FilterParams, FilteredProductsResponse } from "@/types/Product";

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
    data: { bidAmount?: number; maxPrice?: number }
  ): Promise<{ message: string; currentPrice?: number; isWinning?: boolean }> {
    const res = await api.post(
      `/products/${productId}/bid`,
      data,
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

  async answerQuestion(
    productId: string | number,
    questionId: string | number,
    answer: string
  ): Promise<void> {
    const res = await api.post(
      `/products/${productId}/${questionId}/answer`,
      { answer },
      { withCredentials: true }
    );
    return res.data;
  },

  async askToBid(productId: string | number): Promise<void> {
    const res = await api.post(`/products/${productId}/ask-to-bid`, {}, { withCredentials: true });
    return res.data;
  },

  async getBidRequests(productId: string | number, params?: { page?: number; limit?: number; states?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.states) queryParams.append("states", params.states);

    const res = await api.get(`/products/${productId}/bid-requests?${queryParams.toString()}`, { withCredentials: true });
    return res.data;
  },

  async acceptBidRequest(productId: string | number, requestId: number): Promise<void> {
    const res = await api.post(`/products/${productId}/bid-requests/${requestId}/accept`, {}, { withCredentials: true });
    return res.data;
  },

  async rejectBidRequest(productId: string | number, requestId: number): Promise<void> {
    const res = await api.post(`/products/${productId}/bid-requests/${requestId}/reject`, {}, { withCredentials: true });
    return res.data;
  },

  async addProduct(data: any): Promise<any> {
    const res = await api.post('/products/add', data, { withCredentials: true });
    return res.data;
  },

  async updateProduct(productId: string | number, data: any): Promise<any> {
    const res = await api.put(`/products/${productId}`, data, { withCredentials: true });
    return res.data;
  },

  async addDescription(productId: string | number, des: string): Promise<any> {
    const res = await api.post(`/products/${productId}/add/description`, { des }, { withCredentials: true });
    return res.data;
  },

  async getCategories(): Promise<any[]> {

    const res = await api.get('/categories');
    return res.data?.data || [];
  },

  async closeProduct(productId: string | number): Promise<any> {
    const res = await api.post(`/products/${productId}/close`, {}, { withCredentials: true });
    return res.data;
  },

  async deleteProduct(productId: string | number): Promise<any> {
    const res = await api.delete(`/products/${productId}`, { withCredentials: true });
    return res.data;
  },

  // Seller bidder management
  async getBidders(
    productId: string | number,
    params?: { page?: number; limit?: number }
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const res = await api.get(
      `/products/${productId}/bidders?${queryParams.toString()}`,
      { withCredentials: true }
    );
    return res.data;
  },

  async refuseBidder(
    productId: string | number,
    bidderId: number
  ): Promise<any> {
    const res = await api.post(
      `/products/${productId}/bidders/${bidderId}/refuse`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  async unrefuseBidder(
    productId: string | number,
    bidderId: number
  ): Promise<any> {
    const res = await api.post(
      `/products/${productId}/bidders/${bidderId}/unrefuse`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  async getRelatedProducts(
    productId: string | number,
    categoryIds: number | number[],
    limit: number = 5,
    excludeId?: string | number
  ): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    const categories = Array.isArray(categoryIds) ? categoryIds.join(",") : categoryIds.toString();
    queryParams.append("category", categories);
    if (excludeId) queryParams.append("excludeId", excludeId.toString());
    queryParams.append("limit", limit.toString());
    queryParams.append("states", "incoming,bidding");

    const res = await api.get(`/products?${queryParams.toString()}`, {
      withCredentials: true
    });

    const products = res.data?.data?.products || [];
    // Filter out the current product
    return products.filter((p: Product) => p.id !== productId && p.id !== Number(productId));
  }
};



export default productService;