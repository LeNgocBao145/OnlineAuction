import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

export default function HighestPrice() {
    const navigate = useNavigate();

    const [top5, setTop5] = useState([
        // Example data structure
        { id: 1, title: "Auction 1", currentPrice: 1000, bidsCount: "500", timeRemaining: "2h" },
        { id: 2, title: "Auction 2", currentPrice: 950, bidsCount: "450", timeRemaining: "1h" },
        { id: 3, title: "Auction 3", currentPrice: 900, bidsCount: "400", timeRemaining: "3h" },
        { id: 4, title: "Auction 4", currentPrice: 850, bidsCount: "350", timeRemaining: "4h" },
        { id: 5, title: "Auction 5", currentPrice: 800, bidsCount: "300", timeRemaining: "5h" }
    ]);

    useEffect(() => {
        // Fetch top 5 highest-priced auctions from API or data source
        // Example:
        // fetch('/api/top5highest')
        //     .then(response => response.json())
        //     .then(data => setTop5(data));
    }, []);

    return (
        <div className="border border-white/10 rounded-lg w-full bg-(--third) p-4">
            <h1 className="text-(--primary) font-sans font-bold text-2xl text-center">Top 5 Highest-Priced Auctions</h1>
            <ul className="flex flex-col items-center gap-4 mt-4">
                {top5.map((item) => (
                    <li key={item.id} className="bg-(--secondary) w-9/10 h-[100px] rounded-lg \
                                         border border-white/5 grid grid-cols-[1fr_3fr_1fr] items-center \
                                         transform hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}
                    >
                    <div className="border border-(--primary) rounded-md aspect-square h-8/10 ml-2"></div>
                    <div className="flex flex-col justify-center ml-4">
                        <h2 className="text-white font-sans font-bold text-lg">{item.title}</h2>
                        <p className="text-white/60">{item.bidsCount} • {item.timeRemaining}</p>
                    </div>
                    <div>
                        <p className="text-(--primary)">${item.currentPrice}</p>
                        <p className="text-white/60">current bid</p>
                    </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}