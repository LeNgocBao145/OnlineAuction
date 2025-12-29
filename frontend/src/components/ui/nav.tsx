import Icon from "../../assets/icon.png";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import HeaderCategory from "../modals/headerCatergory";

export default function Nav() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(false);

  return (
    <nav className="relative lg:h-[100px] h-[150px] w-full grid lg:grid-cols-[1fr_1fr_1fr_3fr] grid-cols-3 bg-(--bgc) border-b border-white/10 shadow-lg">
      <div className="w-full flex justify-center items-center gap-2">
        <img src={Icon} className="flex-none aspect-auto h-6" />
        <p className="font-sans font-bold text-(--primary)">AUCTIONIFY</p>
      </div>
      <div className="w-full flex justify-center items-center">
        <Link to="/" className="text-white/60">
          Home
        </Link>
      </div>
      <div
        className="w-full flex justify-center items-center"
        onClick={() => {
          setOpenCategory(!openCategory);
        }}
      >
        <p className="text-white/60">Category</p>
        <ChevronDownIcon className="w-4 h-4 text-white/60 ml-1 mt-1" />
      </div>
      <div className="w-full lg:col-span-1 col-span-full flex justify-center items-center gap-2 lg:px-0 px-4">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search for items..."
            className="w-full h-[50px] rounded-lg px-16px bg-(--secondary) text-white/60 pl-2"
          />
          <MagnifyingGlassIcon className="absolute w-5 h-5 text-white/60 right-2" />
        </div>
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
      </div>

      {openCategory && <HeaderCategory />}
    </nav>
  );
}
