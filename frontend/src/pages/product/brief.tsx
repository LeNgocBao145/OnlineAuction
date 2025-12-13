import { useState } from "react";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import PlaceBidModal from "./modal/placeBid";

export default function ProductBrief() {
    const [placingBid, setPlacingBid] = useState(false);
    const [favorited, setFavorited] = useState(false);
    const [productData, setProductData] = useState({
        title: "Sample Product",
        currentBid: 150,
        buyPrice: 300,
        seller: "seller456",
        sellerRating: 4.5,
        highestBidder: "user123",
        bidderRating: 3.8,
        createdDate: "2024-06-01",
        bidCount: 10,
        status: "bidding",
        remainingTime: "3h 20m",
        expectedEndDate: "2024-06-10",
        stepPrice: 10
    });

    return (
        <>
            {placingBid && <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-1000"/>}
            <div className="relative border border-white/10 bg-(--third) w-full h-[600px] rounded-xl p-6 z-1001">
                {placingBid && <PlaceBidModal setPlacingBid={setPlacingBid} currentBid={productData.currentBid} stepPrice={productData.stepPrice} />}

                <div className="flex justify-between mb-4">
                    <h1 className="text-white text-3xl font-bold">{productData.title}</h1>
                    <button onClick={() => setFavorited(!favorited)}>
                        {favorited ? <FaStar className="w-6 h-6 text-(--primary)"/> : <FaRegStar className="w-6 h-6 text-white"/>}
                    </button>
                </div>
                <div className="flex mb-4">
                    <div className="bg-black/70 rounded-md mr-4 h-full w-30 flex items-center justify-center p-4">
                        <p className="text-(--primary) font-bold">{productData.remainingTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                            productData.status === "incoming"
                                ? "bg-yellow-400"
                                : productData.status === "bidding"
                                ? "bg-green-400"
                                : "bg-red-500"
                            }`}
                        ></span>
                        <p className="text-white/60">
                            {productData.status === "incoming"
                            ? "Incoming"
                            : productData.status === "bidding"
                            ? "Bidding"
                            : "Sold"}
                        </p>
                    </div>
                </div>
                <div className="flex justify-between mb-4">
                        <div className="flex flex-col">
                            <p className="text-2xl text-(--primary)">${productData.currentBid}</p>
                            <p className="text-white/60">Current Bid</p>
                        </div>
                        <div className="flex flex-col text-right">
                            <p className="text-[20px] text-white">${productData.buyPrice}</p>
                            <p className="text-white/60">Instant-buy Price</p>
                        </div>
                    </div>
                    <div className="flex justify-between mb-4">
                        <div className="flex flex-col">
                            <p className="text-[20px] text-white">{productData.seller}</p>
                            <p className="text-white/60">Seller</p>
                            <div className="flex justify-between items-center">
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    if (productData.sellerRating >= ratingValue) {
                                        return <FaStar key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    } else if (productData.sellerRating >= ratingValue - 0.5) {
                                        return <FaStarHalfAlt key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    } else {
                                        return <FaRegStar key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    }
                                })}
                                <span className="text-white/60 ml-1">({productData.sellerRating})</span>
                            </div>
                        </div>
                        <div className="flex flex-col text-right">
                            <p className="text-[20px] text-white">{productData.highestBidder}</p>
                            <p className="text-white/60">Highest Bidder</p>
                            <div className="flex justify-between items-center">
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    if (productData.bidderRating >= ratingValue) {
                                        return <FaStar key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    } else if (productData.bidderRating >= ratingValue - 0.5) {
                                        return <FaStarHalfAlt key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    } else {
                                        return <FaRegStar key={index} className="inline w-4 h-4 text-yellow-400"/>;
                                    }
                                })}
                                <span className="text-white/60 ml-1">({productData.bidderRating})</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between mb-4">
                        <div className="flex flex-col">
                            <p className="text-[20px] text-white">{productData.bidCount}</p>
                            <p className="text-white/60">Bids</p>
                        </div>
                        <div className="flex flex-col text-right">
                            <p className="text-[20px] text-white">{productData.expectedEndDate}</p>
                            <p className="text-white/60">Expected End Date</p>
                        </div>
                    </div>
                <div>
                    <button className="w-full h-20 bg-(--primary) text-black rounded-lg mb-4 font-bold"
                        onClick={() => setPlacingBid(!placingBid)}>
                        Place Bid</button>
                    <button className="w-full h-20 bg-white/10 text-white rounded-lg">Buy Now</button>
                </div>
            </div>
        </>
    );
}