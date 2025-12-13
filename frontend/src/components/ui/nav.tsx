import Icon from '../../assets/icon.png';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import HeaderCategory from '../modals/headerCatergory';

export default function Nav() {
    const navigate = useNavigate();
    const [openCategory, setOpenCategory] = useState(false);

    return (
        <nav className='relative h-[100px] w-full grid grid-cols-[1fr_1fr_1fr_2fr_1fr] bg-(--bgc) border-b border-white/10 shadow-lg'>
            <div className='w-full flex justify-center items-center gap-2'>
                <img src={Icon} className='flex-none aspect-auto h-6' />
                <p className='font-sans font-bold text-(--primary)'>AUCTIONIFY</p>
            </div>
            <div className='w-full flex justify-center items-center'>
                <Link to="/" className="text-white/60">Home</Link>
            </div>
            <div className='w-full flex justify-center items-center' onClick={() => {setOpenCategory(!openCategory)}}>
                <p className='text-white/60'>Category</p><ChevronDownIcon className='w-4 h-4 text-white/60 ml-1 mt-1' />
            </div>
            <div className='relative w-full flex justify-center items-center'>
                <input type="text" placeholder='Search for items...' className='w-full h-1/2 rounded-lg px-16px bg-(--secondary) text-white/60 pl-2' />
                <MagnifyingGlassIcon className='absolute w-5 h-5 text-white/60 -ml-12px right-2 top-4/10' />
            </div>
            <div className='w-full flex justify-center items-center'>
                <button onClick={() => navigate('/signIn')} className='text-(--primary) w-1/4 h-[50px] rounded-8px'>Sign In</button>
            </div>

            {openCategory && <HeaderCategory />}
        </nav>
    );
}