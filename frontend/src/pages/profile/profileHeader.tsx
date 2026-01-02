import { useEffect } from "react";
import { useNavigate } from "react-router";
import useUserStore from "../../stores/userStore";
import useAuthStore from "../../stores/authStore";
import { getAvatarUrl } from "@/utils/avatarUtils";

export default function ProfileHeader({activePage} : {activePage: string}) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { profile, fetchProfile } = useUserStore();

    useEffect(() => {
        if (user?.id) {
            fetchProfile(user.id);
        }
    }, [user?.id]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] py-10 px-15 border-b border-white/10 bg-(--secondary)">
            <div className="flex items-center gap-4">
                <img src={getAvatarUrl(profile?.avatar, profile?.name || "User") || "/default-avatar.png"} alt={`${profile?.name}'s profile`} className="h-24 w-24 border-2 border-(--primary) rounded-full" />
                <div className="flex flex-col">
                    <h1 className="text-white text-2xl font-bold">{profile?.name || "User"}</h1>
                    <p className="text-white/60">{profile?.email || "email@example.com"}</p>
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