import type { Product, ProductDetail, FilterParams, FilteredProductsResponse } from "./Product";
import type { User, UserProfile, UserRating, UserBidding, UserSelling } from "./User";
import type { Message, MessageThread } from "./Chat";
import type { Socket } from "socket.io-client";

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
  placeBid: (productId: string | number, data: { bidAmount?: number; maxPrice?: number }) => Promise<{ message: string; currentPrice?: number; isWinning?: boolean } | void>;
  askQuestion: (productId: string | number, question: string) => Promise<void>;
  askToBid: (productId: string | number) => Promise<void>;
  fetchBidRequests: (productId: string | number, params?: any) => Promise<any>;
  acceptBidRequest: (productId: string | number, requestId: number) => Promise<void>;
  rejectBidRequest: (productId: string | number, requestId: number) => Promise<void>;
  fetchBidders: (productId: string | number, params?: { page?: number; limit?: number }) => Promise<any>;
  refuseBidder: (productId: string | number, bidderId: number) => Promise<any>;
  unrefuseBidder: (productId: string | number, bidderId: number) => Promise<any>;
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
    email?: string;
    birthdate: string;
    address: string;
  }) => Promise<void>;
  changePassword: (userId: string | number, oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  sendOTP: (userId: string | number, email: string) => Promise<void>;
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

export interface ChatState {
  messages: Record<string, MessageThread>;
  activeProductId: number | string | null;
  messageLoading: boolean;

  setActiveProductId: (id: number | string | null) => void;
  fetchMessages: (productId: string | number) => Promise<void>;
  sendMessage: (recipientId: string, content: string, image?: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  reset: () => void;
}

export interface SocketState {
  onlineUsers: number[];
  socket: Socket | null;

  connectSocket: () => void;
  disconnectSocket: () => void;
}