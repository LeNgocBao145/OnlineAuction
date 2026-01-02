import Nav from "../../components/ui/nav";
import BidsBody from "./bidsBody";
import ProfileHeader from "./profileHeader";

export default function ProfileMyBids() {
    return (
        <>
            <Nav />
            <ProfileHeader activePage="bids" />
            <BidsBody />
        </>
    );
}