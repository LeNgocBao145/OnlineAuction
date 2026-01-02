import Nav from "../../components/ui/nav";
import ProfileHeader from "./profileHeader";
import ReviewsBody from "./reviewsBody";

export default function ProfileMyReviews() {


    return (
        <>
            <Nav />
            <ProfileHeader activePage="reviews" />
            <ReviewsBody />
        </>
    );
}