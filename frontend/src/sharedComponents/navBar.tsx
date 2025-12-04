import { useState } from "react";
import { Link, useNavigate } from "react-router";

import logo from "../assets/logo.png"

interface allowedSite {
  allowedSiteName: string,
  allowedSiteLink: string
}

const NavBar = () => {
  const [allowedSite, setAllowedSite] = useState<allowedSite[]>([{allowedSiteName: "Contacts", allowedSiteLink: "/contacts"}]);

  const navigate = useNavigate();

  return (
    <nav className = 'w-screen h-[100px] flex justify-around items-center bg-white px-[10%] text-black fixed top-0 z-9999 border-b-4 border-(--primary)'>
      <Link to='/' className='h-full flex items-center'>
        <img src={logo} alt="Logo" className='max-w-[90%] max-h-[90%] rounded-full'/>
      </Link>

      <Link to="/" className='underline'>
        Home
      </Link>

      <div className = "w-[50%]">
      </div>

      {allowedSite.map((object, i) => (
        <Link key={i} to={object.allowedSiteLink} className='underline'>
          {object.allowedSiteName}
        </Link>
      ))}

      <button onClick = {() => {navigate('/signin')}} className='bg-(--primary) w-[10%] h-[60%] flex items-center justify-center rounded-md'>
        SIGN IN
      </button>
      <button onClick = {() => {navigate('/signup')}} className='bg-(--primary) w-[10%] h-[60%] flex items-center justify-center rounded-md'>
        SIGN UP
      </button>
    </nav>
  );
}

export default NavBar;