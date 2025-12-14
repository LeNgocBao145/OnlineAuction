import { FaUser } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ChangeBasicInfo() {
    const emailAndNameFormSchema = z.object({
        username: z.string().min(3, "Username must be at least 3 characters long"),
        email: z.string().email("Invalid email address"),
    });

    const passwordFormSchema = z.object({
        oldPassword: z.string().min(6, "Old password must be at least 6 characters long"),
        newPassword: z.string().min(6, "New password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
    });

    const { register: registerEmailAndName, handleSubmit: handleSubmitEmailAndName, formState: { errors: emailAndNameErrors } } = useForm({
        resolver: zodResolver(emailAndNameFormSchema)
    });

    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors } } = useForm({
        resolver: zodResolver(passwordFormSchema)
    });

    const onSubmitEmailAndName = (data: any) => {
        console.log(data);
    };

    const onSubmitPassword = (data: any) => {
        console.log(data);
    }

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-6">
            <div className="flex justify-between items-center">
                <h1 className="font-bold text-(--primary) text-2xl">Change Account Information</h1>
                <button className="p-4 bg-(--primary) text-black font-bold rounded-md">
                    <FaUser className="inline mr-2" />
                    Request Account Upgrade
                </button>
            </div>
            <form className="mt-6 flex flex-col gap-4"
                onSubmit={handleSubmitEmailAndName(onSubmitEmailAndName)}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    <div className="flex flex-col">
                        <label className="text-white mb-2" htmlFor="username">Username</label>
                        <input type="text" id="username" className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white" placeholder="" 
                        {...registerEmailAndName("username")}
                        />
                        {emailAndNameErrors.username && <p className="text-red-500">{emailAndNameErrors.username.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-white mb-2" htmlFor="email">Email</label>
                        <input type="email" id="email" className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white" placeholder="" 
                        {...registerEmailAndName("email")}
                        />
                        {emailAndNameErrors.email && <p className="text-red-500">{emailAndNameErrors.email.message}</p>}
                    </div>
                </div>
                <button type="submit" className="mt-4 p-3 bg-(--primary) text-black font-bold rounded-md w-32 self-end">
                    Save Changes
                </button>
            </form>
                <div className="w-full h-1 bg-white/10 rouned-lg my-8"></div>
            <form className="flex flex-col gap-4"
                onSubmit={handleSubmitPassword(onSubmitPassword)}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="text-white mb-2" htmlFor="old-password">Old password</label>
                        <input type="password" id="old-password" className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white" placeholder="Enter your old password" 
                        {...registerPassword("oldPassword")}
                        />
                        {passwordErrors.oldPassword && <p className="text-red-500">{passwordErrors.oldPassword.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-white mb-2" htmlFor="new-password">New password</label>
                        <input type="password" id="new-password" className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white" placeholder="Enter your new password" 
                        {...registerPassword("newPassword")}
                        />
                        {passwordErrors.newPassword && <p className="text-red-500">{passwordErrors.newPassword.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className="text-white mb-2" htmlFor="confirm-password">Confirm password</label>
                        <input type="password" id="confirm-password" className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white" placeholder="Confirm your new password" 
                        {...registerPassword("confirmPassword")}
                        />
                        {passwordErrors.confirmPassword && <p className="text-red-500">{passwordErrors.confirmPassword.message}</p>}
                    </div>
                </div>
                <button type="submit" className="mt-4 p-3 bg-(--primary) text-black font-bold rounded-md w-32 self-end">
                    Save Changes
                </button>
            </form>
        </div>
    );
}