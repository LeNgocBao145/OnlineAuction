import NavBar from "../../sharedComponents/navBar";
import SearchBar from "./searchBar"
import HeroBanner from "./hero"
import MainContent from "./mainContent"
import Footer from "../../sharedComponents/footer";

const LandingPage = () => {
    return (
        <>
            <NavBar/>
            <SearchBar/>
            <HeroBanner/>
            <MainContent/>
            <Footer/>
        </>
    );
}

export default LandingPage;