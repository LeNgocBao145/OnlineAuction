import { FaStar } from "react-icons/fa";

import { useState } from "react";

export default function Step4Box() {
    const reviewTextCountLimit = 500;
    const [reviewText, setReviewText] = useState("");

    return (
        <div>
            <h2 className="text-(--primary) text-2xl font-bold">Final rating</h2>
            <p className="text-white/60">Evaluate how satisfied you are with the transaction and the product received.</p>
            <div className="mt-4 grid lg:grid-cols-[1fr_3fr_2fr_2fr] items-center grid-cols-2 gap-4 border border-white/10 p-4 rounded-lg bg-(--third)">
                <img src="" className="border-(--primary) border h-30 w-30 rounded-full flex justify-center items-center text-white" alt="buyer-pfp" />
                <div>
                    <p className="text-white text-2xl font-bold" >[name]</p>
                    <p className="text-white/60">Your buyer</p>
                </div>
                <div>
                    <p className="text-(--primary) text-2xl font-bold">[number]</p>
                    <p className="text-white/60">Winning bid</p>
                </div>
                <div>
                    <p className="text-white text-2xl font-bold">[time]</p>
                    <p className="text-white/60">Ended on</p>
                </div>
            </div>
            <div className="mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
                <h2 className="text-(--primary) text-xl font-bold mb-4">Your Rating</h2>
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                    <button className="border border-green-500 bg-green-500/30 hover:bg-green-500/50 text-green-500 font-bold h-20 py-2 px-4 rounded-md">
                        +1 Positive
                        <FaStar className="inline-block ml-2 text-green-500"/>
                    </button>
                    <button className="border border-red-500 bg-red-500/30 hover:bg-red-500/50 text-red-500 font-bold h-20 py-2 px-4 rounded-md">
                        -1 Negative
                        <FaStar className="inline-block ml-2 text-red-500"/>
                    </button>
                </div>
            </div>
            <div className="relative mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
                <h2 className="text-(--primary) text-xl font-bold mb-4">Your Review</h2>
                <textarea className="relative w-full p-2 border resize-none border-white/10 rounded-lg bg-(--secondary) text-white" rows={5} placeholder="Write your review here..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} maxLength={reviewTextCountLimit} />
                <p className="text-white/60 absolute right-6 bottom-6">{reviewText.length}/{reviewTextCountLimit}</p>
            </div>
            <div className="mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
                <h2 className="text-(--primary) text-xl font-bold">Cancel Transaction</h2>
                <p className="text-white/60">If you encounter any issues with the transaction, you can choose to cancel it. Confirm your reason with the seller.</p>
                <button className="bg-red-500 text-white font-bold py-2 px-4 rounded-md mt-2">
                    Cancel Transaction
                </button>
            </div>
            <div>
                <button className="bg-(--primary) w-full text-black font-bold py-2 px-4 rounded-md mt-4">
                    Submit Review
                </button>
            </div>
        </div>
    );
}