import BidsBody from "./bidsBody";
import ProfileHeader from "./profileHeader";

export default function ProfileMyBids() {
    return (
        <>
            <ProfileHeader activePage="bids" />
            <BidsBody />
        </>
    );
}
