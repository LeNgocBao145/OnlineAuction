import type { Product, ProductDetail, FilterParams, FilteredProductsResponse } from "./Product";
import type { User } from "./User";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  clearState: () => void;

  setAccessToken: (newAccessToken: string) => void;

  // Step 1: register info & send OTP
  register: (
    email: string,
    name: string,
    password: string,
    birthdate: string,
    address: string,
    captchaToken: string
  ) => Promise<void>;

  // Step 1b: resend OTP (only need email)
  sendOTP: (email: string) => Promise<void>;

  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  fetchMe: () => Promise<void>;

  refresh: () => Promise<void>;

  // Step 2: verify OTP
  verifyOTP: (email: string, otp: string) => Promise<void>;
}

export interface HomeState {
  endingSoon: Product[];
  mostBids: Product[];
  highestPrice: Product[];
  loading: boolean;
  error: string | null;
  fetchHomeData: () => Promise<void>;
}

export interface ProductState {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
  fetchProduct: (id: string | number) => Promise<void>;
  placeBid: (productId: string | number, userId: string | number, bidAmount: number) => Promise<void>;
  askQuestion: (productId: string | number, userId: string | number, question: string) => Promise<void>;
}

export interface SearchState {
  data: FilteredProductsResponse | null;
  loading: boolean;
  error: string | null;
  filterParams: FilterParams;
  
  filterProducts: (params: FilterParams) => Promise<void>;
  setFilterParams: (params: FilterParams) => void;
  clearSearch: () => void;
}