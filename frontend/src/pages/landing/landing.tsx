import { useEffect } from "react";
import Nav from "../../components/ui/nav";
import EndingSoon from "./endingSoon";
import Hero from "./hero";
import HighestPrice from "./highestPrice";
import MostBids from "./mostBids";
import useHomeStore from "@/stores/homeStore";
import useAuthStore from "@/stores/authStore";

export default function Landing() {
    const {user} = useAuthStore();
    const { fetchHomeData, loading } = useHomeStore();

    useEffect(() => {
        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <>
                <Nav />
                <div className="flex h-screen items-center justify-center">
                    <p className="text-white text-xl">Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Nav />
            <Hero username={user?.name || "Guest"} />
            <div className="w-95/100 grid lg:grid-cols-3 grid-cols-1 m-auto gap-4">
                <EndingSoon />
                <MostBids />
                <HighestPrice />
            </div>
        </>
    );
}