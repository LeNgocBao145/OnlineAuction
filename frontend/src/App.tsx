import './App.css'
import {useState} from "react"

import logo from "./assets/logo.png"
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const NavBar = () => {
  const [activeLinks, setActiveLinks] = useState(["Contacts"]);

  return (
    <nav className = 'w-screen h-[100px] flex justify-around items-center bg-white px-[10%] text-black fixed top-0 z-9999'>
      <a href="#" className='h-full flex items-center'>
        <img src={logo} alt="Logo" className='max-w-[90%] max-h-[90%] rounded-full'/>
      </a>

      <a className='underline'>
        {"Home"}
      </a>

      <div className = "w-[50%]">
      </div>

      {activeLinks.map((text, i) => (
        <a key={i} href="#" className='underline'>
          {text}
        </a>
      ))}

      <a href = "#" className='bg-(--primary) w-[10%] h-[60%] flex items-center justify-center rounded-md'>
        {"SIGN UP"}
      </a>
      <a href = "#" className='bg-(--primary) w-[10%] h-[60%] flex items-center justify-center rounded-md'>
        {"SIGN IN"}
      </a>
    </nav>
  );
}

const SearchBar = () => {
  return (
    <div className='w-screen px-[10%] bg-(--primary) h-20 mt-[100px] flex justify-around items-center'>
      <div className='h-[80%] w-[20%] relative'>
        <div className='bg-white h-full w-full rounded-md flex items-center justify-center'>{"Product Categories"}</div>
        <ChevronDownIcon className='w-6 h-6 absolute top-[22px] right-2'/>
      </div>
      <div className='h-[80%] w-[60%] relative'>
        <input type='text' name='search-bar' className='bg-white h-full w-full rounded-md pl-12' placeholder='Find a product...'></input>
        <MagnifyingGlassIcon className='w-8 h-8 absolute top-[18px] left-2'/>
      </div>
    </div>
  );
}

const HeroBanner = () => {
  return (
    <div className='h-[300px] w-screen border-b-4 border-(--primary) relative overflow-hidden'>
      <div></div>
    </div>
  );
}

const MainContent = () => {
  return (
    <div className='flex justify-around items-center w-full h-[500px] flex-1 bg-[url(./assets/background.jpg)] bg-cover bg-center'>
      <div className='h-[90%] w-[20%] mt-[50px] text-center'>
        <h1 className='text-white '>! Top Bids !</h1>
        <ul className='h-[85%] border-(--secondary) border-4 bg-white rounded-lg mt-4'>

        </ul>
      </div>
      <div className='h-[90%] w-[20%] text-center'>
        <h1 className='text-white'>! Ending Soon !</h1>
        <ul className='h-[85%] border-(--secondary) border-4 bg-white rounded-lg mt-4'>

        </ul>
      </div>
      <div className='h-[90%] w-[20%] mt-[50px] text-center'>
        <h1 className='text-white'>! Highest Bids !</h1>
        <ul className='h-[85%] border-(--secondary) border-4 bg-white rounded-lg mt-4'>

        </ul>
      </div>
    </div>
  );
}

const Footer = () => {
  return (
    <div className='h-[300px] w-screen flex justify-around border-(--primary) border-t-4 pt-8'>
      <a href="#" className='h-full flex items-center'>
        <img src={logo} alt="Logo" className='max-w-[90%] max-h-[90%] rounded-full'/>
      </a>
      <div className='flex flex-col text-left'>
        <p className='text-(--primary) text-2xl'>{"Pages"}</p>
        <a href = "#">{"Home"}</a>
        <a href = "#">{"Search"}</a>
        <a href = "#">{"Profile"}</a>
      </div>
      <div className='flex flex-col text-left'>
        <p className='text-(--primary) text-2xl'>{"Information"}</p>
        <a href = "#">{"Policies"}</a>
        <a href = "#">{"Terms of Service"}</a>
        <a href = "#">{"Contacts"}</a>
      </div>
      <div className='flex flex-col text-left'>
        <p className='text-(--primary) text-2xl'>{"FAQs"}</p>
        <a href = "#">{"Question #1"}</a>
        <a href = "#">{"Question #2"}</a>
        <a href = "#">{"Question #3"}</a>
      </div>
      <div className='w-[20%] flex flex-col justify-around items-center'>
        <a href = "#" className='bg-(--primary) w-[80%] h-[40%] flex items-center justify-center rounded-md'>
          {"SIGN UP"}
        </a>
        <a href = "#" className='bg-(--primary) w-[80%] h-[40%] flex items-center justify-center rounded-md'>
          {"SIGN IN"}
        </a>
      </div>
    </div>
  );
}

function App() {
  // return (
  //   <>
  //     <div>
  //       <a href="https://vite.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )

  return (
    <>
      <NavBar/>
      <SearchBar/>
      <HeroBanner/>
      <MainContent/>
      <Footer/>
    </>
  )
}

export default App
