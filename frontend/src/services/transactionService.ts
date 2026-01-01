import api from "@/lib/axios";
import type { User } from '../types/User';

export enum TradeState {
    PendingPayment = 'pending_payment',
    PendingSellerConfirm = 'pending_seller_confirm',
    PendingBidderConfirm = 'pending_bidder_confirm',
    Completed = 'completed',
    Failed = 'failed',
}

export interface Transaction {
    product: number;
    bidder: number;
    seller: number;
    delivery_address: string | null;
    invoice_image: string | null;
    receipt_image: string | null;
    delivery_invoice_image: string | null;
    sell_accept: boolean;
    bidder_accept: boolean;
    state: TradeState;
    bidder_name: string;
    bidder_rating: number;
    seller_name: string;
    seller_rating: number;
    name: string;
    current_price: number;
    image: string;
    expired_at: string;
}

export type StepBoxProps = {
    productId: number;
    transaction?: Transaction | null;
    onSuccess: () => Promise<void> | void;
};

const transactionService = {
    async getTransaction(productId: number): Promise<Transaction> {
        const res = await api.get(`/users/trade-verifications/${productId}`, { withCredentials: true });
        return res.data[0] as Transaction;
    },

    async bidderSubmit(productId: number, data: {
        deliveryAddress: string,
        invoiceImage: string
    }): Promise<Transaction> {
        const res = await api.patch(`/users/trade-verifications/${productId}/bidder-submit`, data, { withCredentials: true });
        return res.data[0] as Transaction;
    },

    async sellerConfirm(productId: number): Promise<void> {
        await api.patch(`/users/trade-verifications/${productId}/seller-confirm`, { withCredentials: true });
    },

    async bidderConfirm(productId: number): Promise<void> {
        await api.patch(`/users/trade-verifications/${productId}/bidder-confirm`, { withCredentials: true });
    },

    async cancel(productId: number): Promise<void> {
        await api.patch(`/users/trade-verifications/${productId}/cancel`, { withCredentials: true });
    },

    async submitReview(productId: number, payload: {
        liked: boolean,
        comment: string,
    }): Promise<void> {
        await api.post(`/users/trade-verifications/${productId}/review`, payload, { withCredentials: true });
    }
}

export default transactionService;