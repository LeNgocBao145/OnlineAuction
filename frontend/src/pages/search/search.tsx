import SearchFilter from "./filter";
import SearchBody from "./searchBody";

export default function SearchPage() {
    return (
        <div className="w-10/12 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 m-auto items-start py-10">
            <SearchFilter />
            <SearchBody />
        </div>
    );
}
