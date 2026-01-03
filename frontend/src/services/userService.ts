import api from "@/lib/axios";
import type { User, UserProfile, UserRating, UserBidding, UserSelling } from "@/types/User";
import type { FilteredProductsResponse } from "@/types/Product";

const userService = {
    // Get user profile
    async getUserProfile(userId: string | number): Promise<UserProfile> {
        const res = await api.get(`/users/${userId}`, { withCredentials: true });
        return res.data?.data?.user as UserProfile;
    },

    // Update user information
    async updateUser(userId: string | number, data: {
        name: string;
        email: string;
        birthdate: string;
        address: string;
    }): Promise<UserProfile> {
        const res = await api.patch(`/users/${userId}`, data, { withCredentials: true });
        return res.data?.updatedUser as UserProfile;
    },

    // Change password
    async changePassword(userId: string | number, oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
        await api.patch(`/users/${userId}/change-password`, {
            oldPassword,
            newPassword,
            confirmPassword
        }, { withCredentials: true });
    },

    // Send OTP for email change
    async sendOTP(userId: string | number, email: string): Promise<void> {
        await api.post(`/users/${userId}/send-otp`, {
            email
        }, { withCredentials: true });
    },

    // Verify OTP for email change
    async verifyOTP(userId: string | number, email: string, otp: string): Promise<UserProfile> {
        const res = await api.patch(`/users/${userId}/verify-otp`, {
            email,
            otp
        }, { withCredentials: true });
        return res.data?.updatedUser as UserProfile;
    },

    // Get user ratings/reviews
    async getRatings(userId: string | number, page: number = 1, limit: number = 10): Promise<{
        ratings: UserRating[];
        pagination: { page: number; limit: number; totalItems: number; totalPages: number };
    }> {
        const res = await api.get(`/users/${userId}/ratings?page=${page}&limit=${limit}`, { withCredentials: true });
        return res.data?.data;
    },

    // Get user biddings
    async getBiddings(userId: string | number, page: number = 1, limit: number = 10): Promise<{
        products: UserBidding[];
        pagination: { page: number; limit: number; totalItems: number; totalPages: number };
    }> {
        const res = await api.get(`/users/${userId}/biddings?page=${page}&limit=${limit}`, { withCredentials: true });
        return res.data?.data;
    },

    // Get user sellings
    async getSellings(userId: string | number, page: number = 1, limit: number = 10): Promise<{
        products: UserSelling[];
        pagination: { page: number; limit: number; totalItems: number; totalPages: number };
    }> {
        const res = await api.get(`/users/${userId}/sellings?page=${page}&limit=${limit}`, { withCredentials: true });
        return res.data?.data;
    },

    // Get won auctions
    async getWons(userId: string | number, page: number = 1, limit: number = 10): Promise<{
        products: UserBidding[];
        pagination: { page: number; limit: number; totalItems: number; totalPages: number };
    }> {
        const res = await api.get(`/users/${userId}/wons?page=${page}&limit=${limit}`, { withCredentials: true });
        return res.data?.data;
    },

    // Get user favorites
    async getFavorites(userId: string | number, params?: any): Promise<FilteredProductsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.keyword) queryParams.append("keyword", params.keyword);
        if (params?.category) queryParams.append("category", params.category.toString());
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.startDate) queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);
        if (params?.minPrice) queryParams.append("minPrice", params.minPrice.toString());
        if (params?.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString());
        if (params?.states && params.states.length > 0) {
            queryParams.append("states", params.states.join(","));
        }
        if (params?.sort) queryParams.append("sort", params.sort);

        const res = await api.get(`/users/${userId}/favorites?${queryParams.toString()}`, { withCredentials: true });
        return res.data?.data as FilteredProductsResponse;
    },

    // Mark product as favorite
    async markFavorite(userId: string | number, productId: string | number): Promise<void> {
        await api.post(`/users/${userId}/favorites/${productId}`, {}, { withCredentials: true });
    },

    // Unmark product from favorites
    async unmarkFavorite(userId: string | number, productId: string | number): Promise<void> {
        await api.delete(`/users/${userId}/favorites/${productId}`, { withCredentials: true });
    },

    // Request to be seller
    async requestToBeSeller(userId: string | number): Promise<void> {
        await api.post(`/users/${userId}/request-to-be-seller`, {}, { withCredentials: true });
    },

    // Rate seller
    async rateSeller(userId: string | number, productId: string | number, rating: number, content: string): Promise<void> {
        await api.post(`/users/${userId}/rate-seller/${productId}`, {
            rating,
            content
        }, { withCredentials: true });
    },
};

export default userService;