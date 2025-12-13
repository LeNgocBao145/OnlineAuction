import Nav from "../../components/ui/nav";
import EndingSoon from "./endingSoon";
import Hero from "./hero";
import HighestPrice from "./highestPrice";
import MostBids from "./mostBids";

export default function Landing() {
    return (
        <>
            <Nav />
            <Hero username="moron" />
            <div className="w-8/10 grid grid-cols-[repeat(auto-fill,minmax(clamp(20rem,30dvw,24rem),1fr))] m-auto gap-4">
                <EndingSoon />
                <MostBids />
                <HighestPrice />
            </div>
        </>
    );
}