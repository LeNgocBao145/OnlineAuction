import Nav from "../../components/ui/nav";
import FavoritesBody from "./favoritesBody";
import ProfileHeader from "./profileHeader";

export default function ProfileFavorites() {


    return (
        <>
            <Nav />
            <ProfileHeader activePage="favorites" />
            <FavoritesBody />
        </>
    );
}