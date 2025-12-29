import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import useUserStore from "../../stores/userStore";
import useAuthStore from "../../stores/authStore";
import { formatDate } from "@/utils/dateUtils";

export default function ReviewsBody() {
    const { user } = useAuthStore();
    const { ratings, loading, error, fetchRatings } = useUserStore();
    const navigate = useNavigate();
    const [reviewMaxRating, setReviewMaxRating] = useState<number>(6);
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        if (user?.id) {
            fetchRatings(user.id);
        }
    }, [user?.id]);

    const safeRatings = ratings && Array.isArray(ratings) ? ratings : [];
    const filteredReviews = reviewMaxRating === 6 ? safeRatings : safeRatings.filter(review => Math.floor(review.rating) === reviewMaxRating);
    const reviewsToShow = filteredReviews.slice(0, page * 5);
    const averageRating = safeRatings.length > 0 
        ? (safeRatings.reduce((acc, review) => acc + review.liked, 0) / safeRatings.length).toFixed(1) 
        : "0";

    if (loading) {
        return (
            <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-(--primary)"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-6 text-red-400">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-6">
            <h1 className="font-bold text-2xl text-(--primary)">My Reviews</h1>
            <div className="flex mt-4 gap-4 items-end border border-white/10 p-4 rounded-md bg-white/2">
                <div>
                    <p className="text-3xl text-(--primary) font-bold">{averageRating}</p>
                    <p className="text-white/60">Overall Rating</p>
                </div>
                <div>
                    <p className="text-2xl text-white font-bold">{ratings.length}</p>
                    <p className="text-white/60">Total Reviews</p>
                </div>
            </div>
            <div className="flex flex-col mt-4 gap-4 border border-white/10 p-4 rounded-md bg-white/2">
                <ul>
                    {reviewsToShow.length > 0 ? reviewsToShow.map((review, index) => (
                        <li key={index} className="border-b border-white/10 py-4">
                            <div className="flex justify-between items-center">
                                <p className="text-white font-bold text-2xl">{review.buyer_name}</p>
                                <p className="text-white/60 text-sm">On {formatDate(review.created_at)}</p>
                            </div>
                            <p className="text-white/60 flex justify-start items-center gap-1">Gave you a <span className="text-yellow-400">
                                {review.rating === 1 ? "Like" : review.rating === 0 ? "Dislike" : "Neutral"}</span>
                            </p>
                            <p className="text-white mt-2">{review.comment}</p>
                        </li>
                    )) : <p className="text-white/60">No reviews found for the selected rating range.</p>}
                </ul>
                {reviewsToShow.length < filteredReviews.length && (
                    <button className="bg-(--primary) text-black p-2 rounded-md mt-4 w-3/10 m-auto"
                        onClick={() => setPage(page + 1)}>
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
}