import { useState } from "react";
import { useNavigate } from "react-router";

export default function SearchBody() {
    const [itemsData, setItemsData] = useState(
        [
            {id: 1, name: "Item 1", buyPrice: 100, currentBid: 80, bidCount: 5, status:"bidding", timeLeft: "2h 30m", imageUrl: "/path/to/image1.jpg", highestBidder: "UserA", createdDate: "2024-01-01"},
            {id: 2, name: "Item 2", buyPrice: 200, currentBid: 150, bidCount: 10, status:"incoming", timeLeft: "5h 15m", imageUrl: "/path/to/image2.jpg", highestBidder: "UserB", createdDate: "2024-02-01"},
            {id: 3, name: "Item 3", buyPrice: 300, currentBid: 250, bidCount: 8, status:"sold", timeLeft: "0h 0m", imageUrl: "/path/to/image3.jpg", highestBidder: "UserC", createdDate: "2024-03-01"},
            {id: 4, name: "Item 4", buyPrice: 400, currentBid: 350, bidCount: 12, status:"bidding", timeLeft: "1h 45m", imageUrl: "/path/to/image4.jpg", highestBidder: "UserD", createdDate: "2024-04-01"},
            {id: 5, name: "Item 5", buyPrice: 500, currentBid: 450, bidCount: 20, status:"incoming", timeLeft: "3h 0m", imageUrl: "/path/to/image5.jpg", highestBidder: "UserE", createdDate: "2024-05-01"},
            {id: 6, name: "Item 6", buyPrice: 600, currentBid: 550, bidCount: 15, status:"sold", timeLeft: "0h 0m", imageUrl: "/path/to/image6.jpg", highestBidder: "UserF", createdDate: "2024-06-01"},
        ]
    );

    const navigate = useNavigate();

    return (
        <div className="w-full p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold font-inter text-(--primary)">[category]</h1>
                <div>
                    <label htmlFor="sortBy" className="text-white">Sort By:</label>
                    <select id="sortBy" className="text-white border border-white/10 bg-(--secondary) rounded-lg ml-2 p-2">
                        <option>Relevance</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Recently Added</option>
                        <option>Ending Soon</option>
                    </select>
                </div>
            </div>
            <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(clamp(15rem,30dvw,20rem),1fr))] m-auto gap-4">
                {itemsData.map((item) => (
                    <div key={item.id} className="border border-white/10 rounded-xl bg-(--third) p-4 flex flex-col hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}
                    >
                        <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4 bg-(--secondary) flex items-center justify-center text-white"/>
                        <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
                        <div className="flex justify-between mb-4">
                            <div className="flex flex-col">
                                <p className="text-2xl text-(--primary)">${item.currentBid}</p>
                                <p className="text-white/60">Current Bid</p>
                            </div>
                            <div className="flex flex-col text-right">
                                <p className="text-[20px] text-white">${item.buyPrice}</p>
                                <p className="text-white/60">Instant-buy Price</p>
                            </div>
                        </div>
                        <div className="flex justify-between mb-4">
                            <div className="flex flex-col">
                                <p className="text-[20px] text-white">{item.highestBidder}</p>
                                <p className="text-white/60">Highest Bidder</p>
                            </div>
                            <div className="flex flex-col text-right">
                                <p className="text-[20px] text-white">{item.createdDate}</p>
                                <p className="text-white/60">Created</p>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex flex-col">
                                <p className="text-[20px] text-white">{item.bidCount}</p>
                                <p className="text-white/60">Bids</p>
                            </div>
                            <div className="flex flex-col text-right">
                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${
                                        item.status === "incoming"
                                            ? "bg-yellow-400"
                                            : item.status === "bidding"
                                            ? "bg-green-400"
                                            : "bg-red-500"
                                        }`}
                                    ></span>
                                    <p className="text-white/60">
                                        {item.status === "incoming"
                                        ? "Incoming"
                                        : item.status === "bidding"
                                        ? "Bidding"
                                        : "Sold"}
                                    </p>
                                </div>
                                <p className="text-white/60">Status</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md">First</button>
                <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md">Previous</button>
                <span className="text-white">
                    Page <span className="text-(--primary) font-bold">1</span> of <span className="text-(--primary) font-bold">N</span>
                    </span>
                <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md">Next</button>
                <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md">Last</button>
            </div>
        </div>
    );
}