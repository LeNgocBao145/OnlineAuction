export type User = {
    id: number;
    name: string;
    address: string,
    email: string;
    birthdate: string;
    role: string;
    rating: number;
    rating_count: number;
    relation?: "seller" | "winner" | "bidder" | "other";
    avatar?: string;
}

export interface UserProfile extends User {
    created_at?: string;
    updated_at?: string;
}

export interface UserRating {
    rater_name: string;
    liked: number; // 1 for liked, -1 for disliked
    content: string;
    created_at: string;
    rating: number;
    buyer_name: string;
    comment: string;
}

export interface UserBidding {
    id: number;
    name: string;
    current_price: number;
    image: string;
    state: string;
    bid_date: string;
    bid_price: string;
    instant_price: string | null;
    highest_bidder: string;
    highest_bidder_id: string | number;
    created_at: string;
    time_left: string;
    starting_at?: string;
    expired_at?: string;
    categories: string[];
    bid_count: string;
    rank: number;
}

export interface UserSelling {
    id: number;
    name: string;
    current_price: number;
    image: string;
    state: string;
    created_at: string;
    expired_at: string;
    starting_at?: string;
    time_left: string;
    categories: string[];
    bid_count: string;
    instant_price: string | null;
    seller_name: string;
    bid_price: string;
    rank: number;
    highest_bidder: string | null;
    highest_bidder_id: string | number | null;
}