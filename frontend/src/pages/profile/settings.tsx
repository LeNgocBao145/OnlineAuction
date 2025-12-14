import Nav from "../../components/ui/nav";
import ProfileHeader from "./profileHeader";
import ChangeBasicInfo from "./settings/changeBasic";

export default function ProfileSettingsBasicInfo() {


    return (
        <>
            <Nav />
            <ProfileHeader profilePicture="path/to/picture.jpg" profileName="John Doe" profileEmail="john.doe@example.com" activePage="settings" />
            <ChangeBasicInfo />
        </>
    );
}