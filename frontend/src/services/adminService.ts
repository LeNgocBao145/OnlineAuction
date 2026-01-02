import api from "@/lib/axios";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  birthdate: string;
  address: string;
  role: string;
  rating: number;
  created_at: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  product_count?: number;
  created_at?: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  category_name: string;
  current_price: number;
  instant_price: number;
  seller_name: string;
  winner_name: string | null;
}

export interface UpgradeRequest {
  id: number;
  user_id: number;
  name: string;
  email: string;
  rating: number;
  created_at: string;
  state: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const adminService = {
  // User Management
  async getUsers(sort?: string, page?: number, limit?: number): Promise<{ users: AdminUser[]; pagination: PaginationInfo }> {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const res = await api.get(`/admins/accounts?${params.toString()}`, { withCredentials: true });
    return { users: res.data?.users as AdminUser[], pagination: res.data?.pagination };
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    birthdate: string;
    address: string;
    role?: string;
    rating?: number;
  }): Promise<void> {
    await api.post('/admins/accounts', data, { withCredentials: true });
  },

  async updateUser(userId: number, data: {
    name: string;
    email: string;
    birthdate: string;
    address: string;
    role: string;
    rating: number;
  }): Promise<void> {
    await api.put(`/admins/accounts/${userId}`, data, { withCredentials: true });
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admins/accounts/${userId}`, { withCredentials: true });
  },

  // Product Management
  async getProducts(sort?: string, page?: number, limit?: number): Promise<{ products: AdminProduct[]; pagination: PaginationInfo }> {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const res = await api.get(`/admins/products?${params.toString()}`, { withCredentials: true });
    return { products: res.data?.products as AdminProduct[], pagination: res.data?.pagination };
  },

  async deleteProduct(productId: number): Promise<void> {
    await api.delete(`/admins/products/${productId}`, { withCredentials: true });
  },

  // Category Management
  async getCategories(sort?: string, page?: number, limit?: number): Promise<{ categories: AdminCategory[]; pagination: PaginationInfo }> {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const res = await api.get(`/admins/categories?${params.toString()}`, { withCredentials: true });
    return { categories: res.data?.categories as AdminCategory[], pagination: res.data?.pagination };
  },

  async createCategory(name: string): Promise<AdminCategory> {
    const res = await api.post('/admins/categories', { name }, { withCredentials: true });
    return res.data?.category as AdminCategory;
  },

  async updateCategory(categoryId: number, name: string): Promise<AdminCategory> {
    const res = await api.put(`/admins/categories/${categoryId}`, { name }, { withCredentials: true });
    return res.data?.category as AdminCategory;
  },

  async deleteCategory(categoryId: number): Promise<void> {
    await api.delete(`/admins/categories/${categoryId}`, { withCredentials: true });
  },


  // Upgrade Requests Management
  async getUpgradeRequests(params?: {
    keyword?: string;
    states?: string[];
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ requests: UpgradeRequest[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.states && params.states.length > 0) {
      queryParams.append('states', params.states.join(','));
    }
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const res = await api.get(`/admins/requests?${queryParams.toString()}`, { withCredentials: true });
    return res.data?.data;
  },

  async approveRequest(requestId: number): Promise<void> {
    await api.post(`/admins/requests/${requestId}/approve`, {}, { withCredentials: true });
  },

  async rejectRequest(requestId: number): Promise<void> {
    await api.post(`/admins/requests/${requestId}/reject`, {}, { withCredentials: true });
  },
};

export default adminService;
