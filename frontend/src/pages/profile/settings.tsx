import ProfileHeader from "./profileHeader";
import ChangeBasicInfo from "./settings/changeBasic";

export default function ProfileSettingsBasicInfo() {
    return (
        <>
            <ProfileHeader activePage="settings" />
            <ChangeBasicInfo />
        </>
    );
}