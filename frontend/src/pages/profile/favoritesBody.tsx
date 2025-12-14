import { useState } from "react";

import { FaStar } from "react-icons/fa";

export default function FavoritesBody() {
    const [statusFilter, setStatusFilter] = useState<number>(4); 
    const [visibleAuctionsCount, setVisibleAuctionsCount] = useState<number>(5);
    const [auctionData, setAuctionData] = useState([
        {imagePath: "path/to/image1.jpg", title: "Vintage Clock Really long name to test", currentBid: 180, yourLastBid: 150, status: "bidding"},
        {imagePath: "path/to/image2.jpg", title: "Antique Vase", currentBid: null, yourLastBid: null, status: "incoming"},
        {imagePath: "path/to/image3.jpg", title: "Rare Book", currentBid: 75, yourLastBid: 60, status: "sold"},
        {imagePath: "path/to/image4.jpg", title: "Collectible Toy", currentBid: 45, yourLastBid: 40, status: "bidding"},
        {imagePath: "path/to/image5.jpg", title: "Artisan Jewelry", currentBid: null, yourLastBid: null, status: "incoming"},
    ]);

    const handleRemoveFavorite = (index: number) => {
        const updatedAuctions = [...auctionData];
        updatedAuctions.splice(index, 1);
        setAuctionData(updatedAuctions);
    }

    const filteredAuctions = statusFilter === 4 ? auctionData : auctionData.filter(auction => {
        if (statusFilter === 1) return auction.status === "incoming";
        if (statusFilter === 2) return auction.status === "bidding";
        if (statusFilter === 3) return auction.status === "sold";
        return true; 
    });

    const visibleAuctions = filteredAuctions.slice(0, visibleAuctionsCount);

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-6 flex flex-col justify-center">
            <h1 className="font-bold text-2xl text-(--primary)">Favorited Auctions</h1>
            <ul className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4 w-full">
                {visibleAuctions.length > 0 ? visibleAuctions.map((auction, index) => (
                    <li key={index} className="border border-white/10 rounded-lg bg-(--secondary) p-4">
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                            <div>
                                <img src={auction.imagePath} alt={auction.title} className="rounded-md border border-white/10 aspect-square h-full"/>
                            </div>
                            <div className="flex flex-col">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-white font-bold text-xl">{auction.title.length > 20 ? auction.title.substring(0, 20) + "..." : auction.title}</h2>
                                        <button onClick={() => handleRemoveFavorite(index)}>
                                            <FaStar className="inline w-4 h-4 text-yellow-400 mr-2"/>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-4">
                                    <div className="flex justify-between mb-4">
                                        <div className="flex flex-col">
                                            <p className="text-2xl text-(--primary)">{auction.currentBid !== null ? `$${auction.currentBid}` : "N/A"}</p>
                                            <p className="text-white/60">Current Bid</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className={`text-2xl ${auction.yourLastBid === auction.currentBid ? "text-green-400" : "text-red-400"}`}>
                                                {auction.yourLastBid !== null ? `$${auction.yourLastBid}` : "N/A"}</p>
                                            <p className="text-white/60">Your Last Bid</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${
                                                auction.status === "incoming"
                                                    ? "bg-yellow-400"
                                                    : auction.status === "bidding"
                                                    ? "bg-green-400"
                                                    : "bg-red-500"
                                                }`}
                                            ></span>
                                            <p className="text-white/60">
                                                {auction.status === "incoming"
                                                ? "Incoming"
                                                : auction.status === "bidding"
                                                ? "Bidding"
                                                : "Sold"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                )) : <p className="text-white/60">You don't have any favorites.</p>}
            </ul>
            <button className="bg-(--primary) text-black p-2 rounded-md mt-4 w-3/10 m-auto"
            onClick={() => setVisibleAuctionsCount(visibleAuctionsCount + 5)}>
            Load More</button>
        </div>
    );
}