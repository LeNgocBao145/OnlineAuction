import Nav from "../../components/ui/nav";
import BidsBody from "./bidsBody";
import ProfileHeader from "./profileHeader";

export default function ProfileMyBids() {
    return (
        <>
            <Nav />
            <ProfileHeader profilePicture="path/to/picture.jpg" profileName="John Doe" profileEmail="john.doe@example.com" activePage="bids" />
            <BidsBody />
        </>
    );
}