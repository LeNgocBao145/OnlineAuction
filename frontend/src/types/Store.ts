import type { Product, ProductDetail, FilterParams, FilteredProductsResponse } from "./Product";
import type { User, UserProfile, UserRating, UserBidding, UserSelling } from "./User";

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
  placeBid: (productId: string | number, bidAmount: number) => Promise<void>;
  askQuestion: (productId: string | number, question: string) => Promise<void>;
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

export interface UserProfileState {
  profile: UserProfile | null;
  ratings: UserRating[];
  biddings: UserBidding[];
  sellings: UserSelling[];
  wons: UserBidding[];
  favorites: FilteredProductsResponse | null;
  
  loading: boolean;
  error: string | null;

  fetchProfile: (userId: string | number) => Promise<void>;
  updateProfile: (userId: string | number, data: {
    name: string;
    email: string;
    birthdate: string;
    address: string;
  }) => Promise<void>;
  changePassword: (userId: string | number, oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  verifyOTP: (userId: string | number, email: string, otp: string) => Promise<void>;

  fetchRatings: (userId: string | number, page?: number, limit?: number) => Promise<void>;
  fetchBiddings: (userId: string | number, page?: number, limit?: number) => Promise<void>;
  fetchSellings: (userId: string | number, page?: number, limit?: number) => Promise<void>;
  fetchWons: (userId: string | number, page?: number, limit?: number) => Promise<void>;

  fetchFavorites: (userId: string | number, params?: any) => Promise<void>;
  markFavorite: (userId: string | number, productId: string | number) => Promise<void>;
  unmarkFavorite: (userId: string | number, productId: string | number) => Promise<void>;

  requestToBeSeller: (userId: string | number) => Promise<void>;
  rateSeller: (userId: string | number, productId: string | number, rating: number, content: string) => Promise<void>;

  clearUserData: () => void;
}