const SignUpForm = () => {
    return (
        <form className="flex flex-col w-full h-[80%] px-4 items-center">
            <div className="w-[80%] h-[20%] flex flex-col">
                <label htmlFor="email" className="">Email</label>
                <input name="email" type = "text" className="border-4 border-(--primary) bg-white rounded-md h-1/2 text-black pl-4"/>
            </div>
            <div className="w-[80%] h-[20%] flex justify-between">
                <div className="flex flex-col w-[45%]">
                    <label htmlFor="password">Password</label> 
                    <input name="password" type = "text" className="border-4 border-(--primary) bg-white rounded-md h-1/2 text-black pl-4"/>
                </div>
                <div className="flex flex-col w-[45%]">
                    <label htmlFor="cfpassword">Confirm Password</label>
                    <input name="cfpassword" type = "text" className="border-4 border-(--primary) bg-white rounded-md h-1/2 text-black pl-4"/>
                </div>
            </div>
            <div className="w-[80%] h-[20%] flex justify-between">
                <div className="flex flex-col w-[45%]">
                    <label htmlFor="fname">First Name</label>
                    <input name="fname" type = "text" className="border-4 border-(--primary) bg-white rounded-md h-1/2 text-black pl-4"/>
                </div>
                <div className="flex flex-col w-[45%]">
                    <label htmlFor="lname">Last Name</label>
                    <input name="lname" type = "text" className="border-4 border-(--primary) bg-white rounded-md h-1/2 text-black pl-4"/>
                </div>
            </div>
            <div className="w-[80%] h-[20%] flex flex-col">
                <label htmlFor="address">Address</label>
                <input name="address" type = "text" className="border-4 border-(--primary) bg-white rounded-md h-1/2 text-black pl-4"/>
            </div>
            <div className="w-[80%] h-[20%] flex justify-between items-center px-[5%]">
                <div className="border-4 border-(--primary) w-[40%] h-1/2 rounded-md bg-white"></div>
                <button className="w-[40%] h-1/2 rounded-md bg-(--primary) text-white">Sign Up</button>
            </div>
        </form>
    );
}

export default SignUpForm;