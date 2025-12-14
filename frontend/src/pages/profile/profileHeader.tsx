import { useNavigate } from "react-router";

export default function ProfileHeader(
    {profilePicture, profileName, profileEmail, activePage} : {profilePicture: string, profileName: string, profileEmail: string, activePage: string}
) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] py-10 px-15 border-b border-white/10 bg-(--secondary)">
            <div className="flex items-center gap-4">
                <img src={profilePicture} alt={`${profileName}'s profile`} className="h-24 w-24 border-2 border-(--primary) rounded-full" />
                <div className="flex flex-col">
                    <h1 className="text-white text-2xl font-bold">{profileName}</h1>
                    <p className="text-white/60">{profileEmail}</p>
                </div>
            </div>
            <div className="relative grid grid-cols-2 lg:grid-cols-4 lg:mt-0 mt-4 gap-4 justify-center items-center h-full">
                <button className={`w-full h-full p-2 skew-x-30 flex justify-center items-center
                    ${activePage === 'settings' ? 'bg-(--primary) text-black' : 'bg-(--bgc) border border-white/10 text-white hover:cursor-pointer hover:scale-105 transition-all'}`}
                    onClick={() => navigate('/profile/settings')}>
                    <p className="-skew-x-30">Settings</p>
                </button>
                <button className={`w-full h-full p-2 skew-x-30 flex justify-center items-center 
                    ${activePage === 'reviews' ? 'bg-(--primary) text-black' : 'bg-(--bgc) border border-white/10 text-white hover:cursor-pointer hover:scale-105 transition-all'}`}
                    onClick={() => navigate('/profile/reviews')}>
                    <p className="-skew-x-30">My Reviews</p>
                </button>
                <button className={`w-full h-full p-2 skew-x-30 flex justify-center items-center 
                    ${activePage === 'favorites' ? 'bg-(--primary) text-black' : 'bg-(--bgc) border border-white/10 text-white hover:cursor-pointer hover:scale-105 transition-all'}`}
                    onClick={() => navigate('/profile/favorites')}>
                    <p className="-skew-x-30">Favorites</p>
                </button>
                <button className={`w-full h-full p-2 skew-x-30 flex justify-center items-center 
                    ${activePage === 'bids' ? 'bg-(--primary) text-black' : 'bg-(--bgc) border border-white/10 text-white hover:cursor-pointer hover:scale-105 transition-all'}`}
                    onClick={() => navigate('/profile/bids')}>
                    <p className="-skew-x-30">My Bids</p>
                </button>
            </div>
        </div>
    );
}