import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

const SignInForm = () => {  
    return (
        <form className="text-white flex flex-col w-[50%] h-[200px]">
            <label htmlFor="email" className="">Email</label>
            <input name = "email" className="rounded-lg border-4 border-(--primary) h-[30%] bg-white pl-4 text-black"/>
            <div className="w-full mt-6 flex justify-between">
                <label htmlFor="password">Password</label>
                <a href="#" className="text-right underline">Forgot Password?</a>
            </div>
            <input name="password" className="rounded-lg border-4 border-(--primary) h-[30%] bg-white pl-4 text-black"/>
        </form>
    );
}

export default SignInForm;