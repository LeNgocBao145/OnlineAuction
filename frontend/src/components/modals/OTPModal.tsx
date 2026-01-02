import React, { useState, useEffect } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function OTPModal({
    setModalOpen,
    setSuccess,
    email,
    onVerify,
    onResend
} : {
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    email: string;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
}) {
    const [otp, setOtp] = useState('');
    const [otpRemainTime, setOtpRemainTime] = useState(60);
    const [pressedResend, setPressedResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (otpRemainTime > 0) {
            const interval = setInterval(() => {
                setOtpRemainTime((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpRemainTime]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP code");
            return;
        }

        try {
            setIsVerifying(true);
            await onVerify(otp);
            setSuccess(true);
            setModalOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "OTP verification failed!");
            setSuccess(false);
        } finally {
            setIsVerifying(false);
        }
    }

    const handleResendOTP = async () => {
        if (otpRemainTime > 0) return;
        try {
            await onResend();
            setOtpRemainTime(60);
            setPressedResend(true);
            setTimeout(() => setPressedResend(false), 500);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--secondary) border border-white/10 rounded-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-(--primary) text-2xl font-bold mb-4">Verify OTP</h2>
                <p className="text-white/70 mb-6">
                    We've sent a verification code to <span className='text-white'>{email}</span>
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <div className='flex justify-between mb-2'>
                            <label className='text-white'>Enter OTP Code</label>
                            <p className='text-white/60 text-sm'>
                                {otpRemainTime > 0 ? `Expires in ${otpRemainTime}s` : 'Expired'}
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className="w-full p-3 pr-12 rounded-md bg-(--third) border border-white/10 text-white text-lg tracking-wider"
                                placeholder="Enter 6-digit code"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={otpRemainTime > 0 || pressedResend}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                title={otpRemainTime > 0 ? `Wait ${otpRemainTime}s to resend` : 'Resend OTP'}
                            >
                                <PaperAirplaneIcon
                                    className={`w-5 h-5 -rotate-45 transition-colors ${
                                        pressedResend || otpRemainTime > 0
                                            ? 'text-white/30 cursor-not-allowed'
                                            : 'text-white/60 hover:text-(--primary) cursor-pointer'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="bg-white/10 text-white px-4 py-2 rounded-md hover:bg-white/20"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="bg-(--primary) text-black px-4 py-2 rounded-md hover:bg-(--primary)/80 disabled:opacity-50"
                        >
                            {isVerifying ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}