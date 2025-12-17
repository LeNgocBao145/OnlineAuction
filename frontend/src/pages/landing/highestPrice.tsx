import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import useHomeStore from "@/stores/homeStore";

export default function HighestPrice() {
    const navigate = useNavigate();
    const {highestPrice} = useHomeStore();
        
    return (
        <div className="border border-white/10 rounded-lg w-full bg-(--third) p-4">
            <h1 className="text-(--primary) font-sans font-bold text-2xl text-center">Top 5 Highest-Priced Auctions</h1>
            <ul className="flex flex-col items-center gap-4 mt-4">
                {highestPrice.map((item) => (
                    <li key={item.id} className="bg-(--secondary) w-9/10 h-[100px] rounded-lg \
                                         border border-white/5 grid grid-cols-[1fr_3fr_1fr] items-center \
                                         transform hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}
                    >
                    <div className="border border-(--primary) rounded-md aspect-square h-8/10 ml-2"></div>
                    <div className="flex flex-col justify-center ml-4">
                        <h2 className="text-white font-sans font-bold text-lg">{item.name}</h2>
                        <p className="text-white/60">{item.bid_count} • {item.end_time}</p>
                    </div>
                    <div>
                        <p className="text-(--primary)">${item.current_price}</p>
                        <p className="text-white/60">current bid</p>
                    </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}