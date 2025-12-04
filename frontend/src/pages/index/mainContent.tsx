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

export default MainContent;