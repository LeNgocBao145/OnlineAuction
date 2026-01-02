import Icon from "../../assets/icon.png";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import HeaderCategory from "../modals/headerCatergory";
import useSearchStore from "@/stores/searchStore";
import useAuthStore from "@/stores/authStore";
import userService from "@/services/userService";

export default function Nav() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { filterProducts } = useSearchStore();
  const { user, logout } = useAuthStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      await filterProducts({ keyword: searchKeyword.trim(), page: 1, limit: 9 });
      navigate("/search");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    setOpenUserMenu(false);
    navigate("/");
  };

  const handleUpgradeToSeller = async () => {
    if (!user) return;
    try {
      await userService.requestToBeSeller(user.id);
      toast.success("Request sent! Please wait for admin approval.");
      setOpenUserMenu(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <nav className="relative lg:h-[100px] h-[150px] w-full grid lg:grid-cols-[1fr_1fr_1fr_3fr] grid-cols-3 bg-(--bgc) border-b border-white/10 shadow-lg">
      <Link to="/" className="w-full flex justify-center items-center gap-2 group">
        <img src={Icon} className="flex-none aspect-auto h-10 transition-transform group-hover:scale-110" alt="Logo" />
        <p className="font-sans font-bold text-(--primary) text-lg">AUCTIONIFY</p>
      </Link>
      <div className="w-full flex justify-center items-center">
        <Link to="/" className="text-white/60 hover:text-(--primary)">
          Home
        </Link>
      </div>
      <div
        className="w-full flex justify-center items-center cursor-pointer"
        onClick={() => {
          setOpenCategory(!openCategory);
        }}
      >
        <p className="text-white/60 hover:text-(--primary)">Category</p>
        <ChevronDownIcon className="w-4 h-4 text-white/60 ml-1 mt-1" />
      </div>
      <div className="w-full lg:col-span-1 col-span-full flex justify-center items-center gap-2 lg:px-0 px-4">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search for items..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-[50px] rounded-lg px-16px bg-(--secondary) text-white/60 pl-2 pr-10"
          />
          <MagnifyingGlassIcon
            className="absolute w-5 h-5 text-white/60 right-2 cursor-pointer hover:text-(--primary)"
            onClick={handleSearch}
          />
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center gap-2 text-white/80 hover:text-(--primary) px-3 h-[50px]"
            >
              <span className="hidden lg:inline max-w-[100px] truncate">{user.name}</span>
              <UserCircleIcon className="w-8 h-8" />
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 top-[55px] bg-(--secondary) border border-white/10 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <p className="text-white/60 text-sm truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-(--primary) text-black font-medium">
                    {user.role}
                  </span>
                </div>

                <Link
                  to="/profile/settings"
                  className="block px-4 py-2 text-white/80 hover:bg-white/10"
                  onClick={() => setOpenUserMenu(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/profile/favorites"
                  className="block px-4 py-2 text-white/80 hover:bg-white/10"
                  onClick={() => setOpenUserMenu(false)}
                >
                  Watchlist
                </Link>
                <Link
                  to="/profile/bids"
                  className="block px-4 py-2 text-white/80 hover:bg-white/10"
                  onClick={() => setOpenUserMenu(false)}
                >
                  My Bids
                </Link>

                {(user.role === "seller" || user.role === "admin") && (
                  <>
                    <div className="border-t border-white/10 my-1"></div>
                    <Link
                      to="/profile/sellings"
                      className="block px-4 py-2 text-white/80 hover:bg-white/10"
                      onClick={() => setOpenUserMenu(false)}
                    >
                      My Sellings
                    </Link>
                  </>
                )}

                {user.role === "admin" && (
                  <>
                    <div className="border-t border-white/10 my-1"></div>
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-(--primary) hover:bg-white/10 font-medium"
                      onClick={() => setOpenUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {user.role === "bidder" && (
                  <>
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={handleUpgradeToSeller}
                      className="w-full text-left px-4 py-2 text-(--primary) hover:bg-white/10"
                    >
                      Upgrade to Seller
                    </button>
                  </>
                )}

                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/signIn")}
              className="text-black font-bold px-6 h-[50px] rounded-8px whitespace-nowrap cursor-pointer border border-(--primary) rounded-md bg-(--primary)"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signUp")}
              className="text-black font-bold px-6 h-[50px] rounded-8px whitespace-nowrap cursor-pointer border border-(--primary) rounded-md bg-(--primary) lg:mr-2"
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {openCategory && <HeaderCategory />}
    </nav>
  );
}
