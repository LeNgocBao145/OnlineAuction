import SignInForm from "./signInForm";
import ExternalSignIn from "./externalSignIn";

const SignInContent = () => {
    return (
        <div className="px-[10%] mt-[100px] w-screen h-[600px] flex bg-[url(./assets/background.jpg)] bg-cover bg-center text-white">
            <div className="h-full w-[70%] flex flex-col justify-around items-center">
                <h1 className="text-4xl">Login to [name]</h1>
                <SignInForm/>
                <div className="bg-(--primary) rounded-full w-[90%] h-1"></div>
                <h1 className="text-3xl">{"Or login with..."}</h1>
                <ExternalSignIn/>
            </div>
            <div className="h-full w-[30%] flex flex-col justify-center items-center">
                <div className="border-(--primary) border-4 w-[80%] aspect-square"></div>
                <h1 className="text-[1.25rem] mt-4">{"Advertisement"}</h1>
            </div>
        </div>
    );
}

export default SignInContent;