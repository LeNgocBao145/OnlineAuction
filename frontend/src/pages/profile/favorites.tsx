import FavoritesBody from "./favoritesBody";
import ProfileHeader from "./profileHeader";

export default function ProfileFavorites() {
    return (
        <>
            <ProfileHeader activePage="favorites" />
            <FavoritesBody />
        </>
    );
}