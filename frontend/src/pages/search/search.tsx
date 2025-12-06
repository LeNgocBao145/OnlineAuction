import Footer from "../../sharedComponents/footer";
import NavBar from "../../sharedComponents/navBar";
import SearchBar from "../index/searchBar";
import SearchBody from "./searchBody";


const SearchPage = () => {
    return (
        <>
            <NavBar/>
            <SearchBar/>
            <SearchBody/>
            <Footer/>
        </>
    );
}

export default SearchPage;