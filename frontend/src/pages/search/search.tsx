import Nav from "../../components/ui/nav";
import SearchFilter from "./filter";
import SearchBody from "./searchBody";

export default function SearchPage() {
    return (
        <>
            <Nav/>
            <div className="w-10/12 grid grid-cols-1 md:grid-cols-[minmax(150px,25%)_1fr] gap-4 m-auto items-start">
                <SearchFilter/>
                <SearchBody/>
            </div>
        </>
    );
}
