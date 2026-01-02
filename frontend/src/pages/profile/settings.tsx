import Nav from "../../components/ui/nav";
import ProfileHeader from "./profileHeader";
import ChangeBasicInfo from "./settings/changeBasic";

export default function ProfileSettingsBasicInfo() {


    return (
        <>
            <Nav />
            <ProfileHeader activePage="settings" />
            <ChangeBasicInfo />
        </>
    );
}