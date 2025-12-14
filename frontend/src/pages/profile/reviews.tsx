import Nav from "../../components/ui/nav";
import ProfileHeader from "./profileHeader";
import ReviewsBody from "./reviewsBody";

export default function ProfileMyReviews() {


    return (
        <>
            <Nav />
            <ProfileHeader profilePicture="path/to/picture.jpg" profileName="John Doe" profileEmail="john.doe@example.com" activePage="reviews" />
            <ReviewsBody />
        </>
    );
}