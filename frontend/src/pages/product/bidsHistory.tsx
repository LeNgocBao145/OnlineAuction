import { useState } from "react";

export default function BidHistory() {
    const [bidsHistory, setBidsHistory] = useState([
        { bidder: "User5", amount: 190, timeMade: "12:00 PM", timeAgo: "Just now" },
        { bidder: "User4", amount: 180, timeMade: "11:30 AM", timeAgo: "30m ago" },
        { bidder: "User3", amount: 170, timeMade: "11:00 AM", timeAgo: "1hr ago" },
        { bidder: "User2", amount: 160, timeMade: "10:30 AM", timeAgo: "1hr 30m ago" },
        { bidder: "User1", amount: 150, timeMade: "10:00 AM", timeAgo: "2hr ago" }
    ]);

    return (
        <div className="w-full p-4 bg-(--third) border border-white/10 rounded-xl">
            <h1 className="text-(--primary) text-2xl font-bold mb-4">Bids History</h1>
            {bidsHistory.length === 0 ? (
                <p className="text-white">No bids placed yet.</p>
            ) : (bidsHistory.map((bid, index) => (
                <div key={index} className="justify-between items-center bg-(--secondary) rounded-lg p-4 mb-2 grid grid-cols-[2fr_2fr_1fr]">
                    <div className="flex flex-col">
                        <p className="text-white">{bid.timeMade}</p>
                        <p className="text-white/60">{bid.timeAgo}</p>
                    </div>
                    <p className="text-white">{bid.bidder}</p>
                    <p className="text-(--primary) font-bold">${bid.amount}</p>
                </div>
            )))}
        </div>
    );
}