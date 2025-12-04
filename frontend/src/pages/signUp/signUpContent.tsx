import SignUpForm from './signUpForm'
import ExternalSignUp from './externalSignUp';

const SignUpContent = () => {
    return (
        <div className="px-[10%] mt-[100px] w-screen h-[600px] flex items-center bg-[url(./assets/background.jpg)] bg-cover bg-center text-white">
            <div className="h-full w-[50%] flex flex-col justify-around items-center">
                <h1 className="text-4xl mb-4">Sign up to [name]</h1>
                <SignUpForm/>
            </div>
            <div className='h-[80%] w-1 rounded-full bg-(--primary)'></div>
            <div className="h-full w-[50%] flex flex-col justify-center items-center">
                <h1 className="text-4xl mb-4">Or sign up using...</h1>
                <ExternalSignUp/>
            </div>
        </div>
    );
}

export default SignUpContent;