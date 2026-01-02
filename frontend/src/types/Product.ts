// Sử dụng cho danh sách sản phẩm (simple card)
export interface Product {
  id: number;
  name: string;
  current_price: number;
  image_url?: string;
  time_left?: string;
  bid_count?: number;
  state?: string;
  image?: string;
  category_name?: string;
  instant_price?: number;
  seller_name?: string;
  winner_name?: string | null;
}

export interface ProductDescription {
  description: string;
  created_at: string;
}

export interface ProductBid {
  bidder_name: string;
  amount: number;
  bid_time: string;
}

export interface ProductQA {
  id: number;
  question: string;
  questioner_name: string;
  answer?: string | null;
  answerer_name?: string | null;
  asked_at: string;
  answered_at?: string | null;
}

// Chi tiết sản phẩm trả về từ API /product/:id
export interface ProductDetail {
  id: number;
  name: string;
  current_price: number;
  image: string;
  state: string;
  seller_id: number;
  init_price: number;
  step_price: number;
  instant_price: number | null;
  seller_name: string;
  created_at: string;
  expired_at: string;
  starting_at?: string;
  isExtent?: boolean;
  categories: any[];
  additional_images: string[];
  descriptions: ProductDescription[];

  bids: ProductBid[];
  qa: ProductQA[];
  user_bid_request_state?: "pending" | "success" | "failed" | null;
  user_relation?: "seller" | "winner" | "bidder" | "other";
}

// Filter products parameters
export interface FilterParams {
  keyword?: string;
  category?: number;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  states?: string[];
  sort?: string;
}

// Pagination info
export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Filtered products response from API
export interface FilteredProductsResponse {
  products: Product[];
  pagination: Pagination;
}