import Nav from "../../components/ui/nav";
import FavoritesBody from "./favoritesBody";
import ProfileHeader from "./profileHeader";

export default function ProfileFavorites() {


    return (
        <>
            <Nav />
            <ProfileHeader profilePicture="path/to/picture.jpg" profileName="John Doe" profileEmail="john.doe@example.com" activePage="favorites" />
            <FavoritesBody />
        </>
    );
}