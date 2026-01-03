import { useState, useEffect } from "react";

import useUserStore from "../../stores/userStore";
import useAuthStore from "../../stores/authStore";
import { formatDate } from "@/utils/dateUtils";

export default function ReviewsBody() {
    const { user } = useAuthStore();
    const { ratings, loading, error, fetchRatings, profile, fetchProfile } = useUserStore();
    const [reviewMaxRating] = useState<number>(6);
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        if (user?.id) {
            fetchRatings(user.id);
            fetchProfile(user.id);
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
            <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-(--primary)"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10 text-red-400">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10">
            <h1 className="font-bold text-2xl text-(--primary)">My Reviews</h1>
            
            {/* Rating Display Section */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-white/60 text-sm">Your Rating Progress</span>
                            <span className="text-white/40 text-sm">•</span>
                            <span className="text-white font-semibold text-lg">
                                {profile?.rating?.toFixed(2) || '0.00'}
                            </span>
                            <span className="text-white/60 text-sm">
                                ({profile?.rating_count || 0} reviews)
                            </span>
                        </div>
                        <div className="relative">
                            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                                        (profile?.rating || 0) >= 0.8 
                                            ? 'bg-gradient-to-r from-green-600 to-green-400' 
                                            : 'bg-gradient-to-r from-yellow-600 to-orange-400'
                                    }`}
                                    style={{ width: `${(profile?.rating || 0) * 100}%` }}
                                />
                            </div>
                            <div className="absolute -top-1 right-0">
                                <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/20">
                                    {((profile?.rating || 0) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {(profile?.rating_count || 0) === 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                        <p className="text-yellow-400 text-sm">
                            <strong>Note:</strong> As a new user, you'll need to get approval from sellers before bidding on products.
                        </p>
                    </div>
                )}
                {(profile?.rating || 0) < 0.8 && (profile?.rating_count || 0) > 0 && (
                    <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-md">
                        <p className="text-orange-400 text-sm">
                            <strong>Note:</strong> Users with rating below 0.8 may need approval from sellers before bidding on some products.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col mt-4 gap-4 border border-white/10 p-4 rounded-md bg-white/2">
                <ul>
                    {reviewsToShow.length > 0 ? reviewsToShow.map((review, index) => (
                        <li key={index} className="border-b border-white/10 py-4">
                            <div className="flex justify-between items-center">
                                <p className="text-white font-bold text-2xl">{review.rater_name}</p>
                                <p className="text-white/60 text-sm">On {formatDate(review.created_at)}</p>
                            </div>
                            <p className="text-white/60 flex justify-start items-center gap-1">Gave you a <span className="text-yellow-400">
                                {review.liked === 1 ? "Like" : "Dislike"} </span>
                            </p>
                            <p className="text-white mt-2">{review.content}</p>
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