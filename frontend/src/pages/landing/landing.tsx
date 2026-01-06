import { useEffect } from "react";
import EndingSoon from "./endingSoon";
import Hero from "./hero";
import HighestPrice from "./highestPrice";
import MostBids from "./mostBids";
import useHomeStore from "@/stores/homeStore";
import useAuthStore from "@/stores/authStore";

export default function Landing() {
    const { user } = useAuthStore();
    const { fetchHomeData, loading } = useHomeStore();

    useEffect(() => {
        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-grow items-center justify-center">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col">
            <Hero username={user?.name || "Guest"} />
            <div className="lg:w-9/10 md:w-95/100 grid lg:grid-cols-3 grid-cols-1 mx-auto gap-4 mb-20">
                <EndingSoon />
                <MostBids />
                <HighestPrice />
            </div>
        </div>
    );
}