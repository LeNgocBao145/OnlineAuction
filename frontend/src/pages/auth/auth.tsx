import { useState } from "react";
import SignInForm from "../signIn/signInForm";
import SignUpForm from "../signUp/signUpForm";

export default function Auth() {
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

    return (
        <div className="flex-grow flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-xl">
                {/* Tab Navigation */}
                <div className="flex mb-6 bg-(--third) rounded-xl p-1 border border-white/10">
                    <button
                        onClick={() => setActiveTab("signin")}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-base transition-all duration-300 ${activeTab === "signin"
                                ? "bg-(--primary) text-black shadow-lg"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-base transition-all duration-300 ${activeTab === "signup"
                                ? "bg-(--primary) text-black shadow-lg"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form Container with Animation */}
                <div className="relative overflow-hidden">
                    {/* SignIn Form */}
                    <div
                        className={`transition-all duration-500 ease-in-out ${activeTab === "signin"
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-full absolute inset-0"
                            }`}
                    >
                        {activeTab === "signin" && <SignInForm onSwitchToSignUp={() => setActiveTab("signup")} />}
                    </div>

                    {/* SignUp Form */}
                    <div
                        className={`transition-all duration-500 ease-in-out ${activeTab === "signup"
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 translate-x-full absolute inset-0"
                            }`}
                    >
                        {activeTab === "signup" && <SignUpForm onSwitchToSignIn={() => setActiveTab("signin")} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
