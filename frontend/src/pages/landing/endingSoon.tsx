import { useNavigate } from "react-router";
import useHomeStore from "@/stores/homeStore";
import { formatTimeLeft } from "@/utils/timeUtils";

export default function EndingSoon() {
    const navigate = useNavigate();
    const {endingSoon} = useHomeStore();

    console.log('endingSoon data:', endingSoon);

    return (
        <div className="border border-white/10 rounded-lg w-full bg-(--third) p-4">
            <h1 className="text-(--primary) font-sans font-bold text-2xl text-center">Top 5 Auction Ending Soon</h1>
            <ul className="flex flex-col items-center gap-4 mt-4">
                {endingSoon.map((item) => (
                    <li key={item.id} className="bg-(--secondary) w-9/10 h-[100px] rounded-lg \
                                         border border-white/5 grid grid-cols-[1fr_3fr_1fr] items-center \
                                         transform hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}
                    >
                    <div className="border border-(--primary) rounded-md aspect-square h-8/10 ml-2 overflow-hidden bg-black/30">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                                No image
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-center ml-4">
                        <h2 className="text-white font-sans font-bold text-lg">{item.name}</h2>
                        <p className="text-white/60">Current Price: ${item.current_price}</p>
                    </div>
                    <div>
                        <p className="text-(--primary)">{formatTimeLeft(item.time_left || 0)}</p>
                        <p className="text-white/60 mr-2">remaining</p>
                    </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}