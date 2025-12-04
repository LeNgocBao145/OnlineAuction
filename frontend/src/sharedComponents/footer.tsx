import logo from "../assets/logo.png"

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

export default Footer;