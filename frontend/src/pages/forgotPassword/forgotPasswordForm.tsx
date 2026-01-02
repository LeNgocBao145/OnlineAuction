import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import api from "@/lib/axios";

export default function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const emailSchema = z.object({
        email: z.string().email("Invalid email address"),
    });

    const resetSchema = z.object({
        otp: z.string().min(6, "OTP must be 6 characters"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

    const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm({
        resolver: zodResolver(emailSchema),
    });

    const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } = useForm({
        resolver: zodResolver(resetSchema),
    });

    const onSubmitEmail = async (data: any) => {
        try {
            setLoading(true);
            await api.post("/auth/forgot-password", { email: data.email });
            setEmail(data.email);
            setStep(2);
            toast.success("OTP sent to your email!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitReset = async (data: any) => {
        try {
            setLoading(true);
            await api.post("/auth/reset-password", {
                email,
                otp: data.otp,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });
            toast.success("Password reset successful! Please sign in.");
            navigate("/signIn");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setLoading(true);
            await api.post("/auth/forgot-password", { email });
            toast.success("OTP resent to your email!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
            <div className="w-full max-w-md p-8 bg-(--secondary) border border-white/10 rounded-lg">
                <h1 className="text-2xl font-bold text-(--primary) mb-6 text-center">
                    {step === 1 ? "Forgot Password" : "Reset Password"}
                </h1>

                {step === 1 ? (
                    <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="flex flex-col gap-4">
                        <p className="text-white/60 text-sm mb-2">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </p>
                        <div className="flex flex-col">
                            <label className="text-white mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="p-3 rounded-md bg-(--bgc) border border-white/10 text-white"
                                placeholder="Enter your email"
                                {...registerEmail("email")}
                            />
                            {emailErrors.email && <p className="text-red-500 text-sm mt-1">{emailErrors.email.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 p-3 bg-(--primary) text-black font-bold rounded-md disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                        <Link to="/signIn" className="text-center text-(--primary) hover:underline mt-2">
                            Back to Sign In
                        </Link>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitReset(onSubmitReset)} className="flex flex-col gap-4">
                        <p className="text-white/60 text-sm mb-2">
                            Enter the OTP sent to <span className="text-(--primary)">{email}</span> and your new password.
                        </p>
                        <div className="flex flex-col">
                            <label className="text-white mb-2" htmlFor="otp">OTP Code</label>
                            <input
                                type="text"
                                id="otp"
                                maxLength={6}
                                className="p-3 rounded-md bg-(--bgc) border border-white/10 text-white text-center tracking-widest text-xl"
                                placeholder="000000"
                                {...registerReset("otp")}
                            />
                            {resetErrors.otp && <p className="text-red-500 text-sm mt-1">{resetErrors.otp.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-white mb-2" htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="p-3 rounded-md bg-(--bgc) border border-white/10 text-white"
                                placeholder="Enter new password"
                                {...registerReset("newPassword")}
                            />
                            {resetErrors.newPassword && <p className="text-red-500 text-sm mt-1">{resetErrors.newPassword.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-white mb-2" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="p-3 rounded-md bg-(--bgc) border border-white/10 text-white"
                                placeholder="Confirm new password"
                                {...registerReset("confirmPassword")}
                            />
                            {resetErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{resetErrors.confirmPassword.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 p-3 bg-(--primary) text-black font-bold rounded-md disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                        <div className="flex justify-between mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-white/60 hover:text-white"
                            >
                                ← Change Email
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="text-(--primary) hover:underline disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
