import { useState } from "react";

import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

export default function ReviewsBody() {
    const [reviewMaxRating, setReviewMaxRating] = useState<number>(5);
    const [visibleReviewsCount, setVisibleReviewsCount] = useState<number>(5);

    const [reviewsData, setReviewsData] = useState([
        {madeBy: "User123", rating: 5, comment: "Great seller!", madeOn: "2024-05-20"},
        {madeBy: "Buyer456", rating: 4.5, comment: "Item as described.", madeOn: "2024-05-18"},
        {madeBy: "User789", rating: 3.8, comment: "Average experience.", madeOn: "2024-05-15"},
    ]);

    const filteredReviews = reviewMaxRating === 6 ? reviewsData : reviewsData.filter(review => review.rating <= reviewMaxRating && review.rating > reviewMaxRating - 1);
    const reviewsToShow = filteredReviews.slice(0, visibleReviewsCount);

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-6">
            <h1 className="font-bold text-2xl text-(--primary)">My Reviews</h1>
            <div className="flex mt-4 gap-4 items-end border border-white/10 p-4 rounded-md bg-white/2">
                <div>
                    <p className="text-3xl text-(--primary) font-bold">{(reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length).toFixed(1)}</p>
                    <p className="text-white/60">Overall Rating</p>
                </div>
                <div>
                    <p className="text-2xl text-white font-bold">{reviewsData.length}</p>
                    <p className="text-white/60">Total Reviews</p>
                </div>
            </div>
            <div className="flex flex-col mt-4 gap-4 border border-white/10 p-4 rounded-md bg-white/2">
                <div className="flex items-center gap-4">
                    <p className="text-white/60">Sort by</p>
                    <div className="grid lg:grid-cols-6 grid-cols-3 gap-2">
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${reviewMaxRating === 1 ? "bg-(--primary) text-black" : "text-white"}`}
                            onClick={() => setReviewMaxRating(1)}>
                        0 - 1 Star</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${reviewMaxRating === 2 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setReviewMaxRating(2)}>
                        1 - 2 Stars</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${reviewMaxRating === 3 ? "bg-(--primary) text-black" : "text-white"}`}
                            onClick={() => setReviewMaxRating(3)}>
                        2 - 3 Stars</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${reviewMaxRating === 4 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setReviewMaxRating(4)}>
                        3 - 4 Stars</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${reviewMaxRating === 5 ? "bg-(--primary) text-black" : "text-white"}`}
                            onClick={() => setReviewMaxRating(5)}>
                        4 - 5 Stars</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${reviewMaxRating === 6 ? "bg-(--primary) text-black" : "text-white"}`}
                            onClick={() => setReviewMaxRating(6)}>
                        View All</button>
                    </div>
                </div>
                <ul>
                    {reviewsToShow.length > 0 ? reviewsToShow.map((review, index) => (
                        <li key={index} className="border-b border-white/10 py-4">
                            <div className="flex justify-between items-center">
                                <p className="text-white font-bold text-2xl">{review.madeBy}</p>
                                <p className="text-white/60 text-sm">On {review.madeOn}</p>
                            </div>
                            <p className="text-yellow-400 flex justify-start items-center gap-1"><span className="text-white/60">Gave you a </span>{review.rating} 
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    if (review.rating >= ratingValue) {
                                        return <FaStar key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    } else if (review.rating >= ratingValue - 0.5) {
                                        return <FaStarHalfAlt key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    } else {
                                        return <FaRegStar key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    }
                                })}
                            </p>
                            <p className="text-white mt-2">{review.comment}</p>
                        </li>
                    )) : <p className="text-white/60">No reviews found for the selected rating range.</p>}
                </ul>
                <button className="bg-(--primary) text-black p-2 rounded-md mt-4 w-3/10 m-auto"
                onClick={() => setVisibleReviewsCount(visibleReviewsCount + 5)}>
                Load More</button>
            </div>
        </div>
    );
}