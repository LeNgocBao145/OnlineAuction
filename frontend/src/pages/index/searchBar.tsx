import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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

export default SearchBar;