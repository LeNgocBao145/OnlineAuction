import { CogIcon } from '@heroicons/react/24/outline';

const ProfileCard = () => {
    return (
        <div className='flex justify-center items-center flex-col'>
            <div className='w-3/4 aspect-square border-8 border-(--primary) bg-white rounded-full'>
                <img/>
            </div>
            <p className='text-white mt-4'>[account name]</p>
            <p className='text-white mt-4'>[account email]</p>
            <button className='relative mt-4 text-[1.25rem] text-center h-[50px] w-1/3 text-black bg-(--primary) rounded-md'>
                <CogIcon className='absolute h-6 w-6 top-3.5 left-1'></CogIcon>
                Settings
            </button>
        </div>
    );
}

export default ProfileCard;