import ProfileHeader from "./profileHeader";
import ReviewsBody from "./reviewsBody";

export default function ProfileMyReviews() {
    return (
        <>
            <ProfileHeader activePage="reviews" />
            <ReviewsBody />
        </>
    );
}