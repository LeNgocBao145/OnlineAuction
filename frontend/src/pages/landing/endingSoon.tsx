import { useNavigate } from "react-router";
import useHomeStore from "@/stores/homeStore";
import { formatTimeLeft } from "@/utils/timeUtils";
import { formatCurrency } from "@/utils/numberUtils";
import { getImageUrl } from "@/utils/productUtils";

export default function EndingSoon() {
    const navigate = useNavigate();
    const { endingSoon } = useHomeStore();

    return (
        <div className="border border-white/10 rounded-lg w-full bg-(--third) p-4">
            <h1 className="text-(--primary) font-sans font-bold text-2xl text-center">Top 5 Auction Ending Soon</h1>
            <ul className="flex flex-col items-center gap-4 mt-4">
                {endingSoon.map((item) => {
                    // Client-side detection for New and Ending Soon
                    const parseSecureDate = (v: string) => {
                        if (!v.includes('Z') && !v.includes('+') && !v.match(/-\d{2}:?\d{2}$/)) {
                            return v.replace(' ', 'T') + 'Z';
                        }
                        return v;
                    };
                    const now = new Date().getTime();
                    const expiry = item.expired_at ? new Date(parseSecureDate(item.expired_at)).getTime() : 0;
                    const created = item.created_at ? new Date(parseSecureDate(item.created_at)).getTime() : 0;

                    const secondsLeft = Math.floor((expiry - now) / 1000);
                    const secondsSinceCreated = Math.floor((now - created) / 1000);

                    const isEndingSoonClient = secondsLeft > 0 && secondsLeft <= 300;
                    const isNewClient = secondsSinceCreated >= 0 && secondsSinceCreated <= 300;

                    return (
                        <li key={item.id} className={`relative bg-(--secondary) w-full rounded-xl p-3 \
                                             border-2 grid grid-cols-[1fr_3fr_1fr] items-center \
                                             transform hover:scale-102 transition-all cursor-pointer \
                                             ${isEndingSoonClient ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)] bg-red-500/5" :
                                isNewClient ? "border-(--primary) shadow-[0_0_15px_rgba(255,215,0,0.15)]" :
                                    "border-white/10 hover:border-white/20"}`}
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            {isEndingSoonClient ? (
                                <div className="absolute -top-2.5 -left-2.5 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 animate-pulse uppercase flex items-center gap-1 border border-red-400">
                                    <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                                    Urgent
                                </div>
                            ) : isNewClient ? (
                                <div className="absolute -top-2.5 -left-2.5 bg-(--primary) text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 animate-pulse uppercase border border-yellow-400">
                                    New
                                </div>
                            ) : null}
                            <div className="aspect-square h-16 rounded-lg overflow-hidden bg-black/30 border border-white/10 ml-1">
                                {item.image_url ? (
                                    <img
                                        src={getImageUrl(item.image_url)}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] font-bold uppercase text-center p-1">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center ml-4 truncate">
                                <h2 className="text-white font-sans font-bold lg:text-lg text-base truncate mb-1 group-hover:text-(--primary) transition-colors">{item.name}</h2>
                                <p className="text-white/60 text-xs font-medium tracking-wide truncate">Current Bid: <span className="text-white font-semibold">{formatCurrency(Number(item.current_price))}</span></p>
                            </div>
                            <div className="text-right flex flex-col items-end justify-center pr-2">
                                <p className={`${isEndingSoonClient ? "text-red-400 animate-pulse font-bold" : "text-(--primary) font-bold"} text-base lg:text-xl leading-none mb-1 whitespace-nowrap`}>
                                    {formatTimeLeft(item.expired_at)}
                                </p>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Time Left</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}