import ProfileCard from "./profileCard";
import FavoriteCard from "./favoriteCard";
import BiddingCard from "./biddingCard";
import SellingCard from "./sellingCard";

const ProfileBody = () => {
    return (
        <div className='grid grid-cols-4 px-[10%] mt-[100px] w-full h-[800px] flex-1 bg-[url(./assets/background.jpg)] bg-cover bg-center'>
            <ProfileCard/>
            <FavoriteCard/>
            <BiddingCard/>
            <SellingCard/>
        </div>
    );
}

export default ProfileBody;