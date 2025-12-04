import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import googleIcon from "../../assets/Google_Favicon_2025.svg"
import facebookIcon from "../../assets/2021_Facebook_icon.svg"

const ExternalSignIn = () => {
    return (
        <div className="grid grid-cols-2 gap-8 h-[200px] w-full place-items-center">
            <div className="rounded-lg border-4 border-(--primary) h-[80%] w-[80%] bg-white text-black flex justify-center items-center">
                <img src={googleIcon} className="w-8 h-8 mr-4"></img>
                <p className="text-2xl">Gmail</p>
            </div>
            <div className="rounded-lg border-4 border-(--primary) h-[80%] w-[80%] bg-white text-black flex justify-center items-center">
                <img src={facebookIcon} className="h-8 w-8 mr-4"></img>
                <p className="text-2xl">Facebook</p>
            </div>
            <div className="rounded-lg border-4 border-(--primary) h-[80%] w-[80%] bg-white text-black flex justify-center items-center">
                <p>[something].</p>
            </div>
        </div>
    );
}

export default ExternalSignIn;