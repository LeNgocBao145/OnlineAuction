import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import useAuthStore from '@/stores/authStore';

export default function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [otpRemainTime, setOtpRemainTime] = useState(60);
    const [pressedResend, setPressedResend] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOTP: verifyOTPAccount, sendOTP } = useAuthStore();
    
    const { email } = location.state || {};

    useEffect(() => {
    if (!email) {
      navigate('/signUp');
    }
  }, [email, navigate]);

    useEffect(() => {
        if (otpRemainTime > 0) {
            const interval = setInterval(() => {
                setOtpRemainTime((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpRemainTime]);

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await verifyOTPAccount(email, otp);
            navigate('/signIn');
        } catch (error: any) {
            toast.error(error.message || 'OTP verification failed');
        }
    };

    const handleResendOTP = async () => {
        if (otpRemainTime > 0) return;
        try {
            await sendOTP(email);
            setOtpRemainTime(import.meta.env.VITE_OTP_EXPIRE_TIME || 60);
            setPressedResend(true);
            setTimeout(() => setPressedResend(false), 500);
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className='w-1/2 h-[600px] bg-(--third) rounded-lg m-auto mt-[100px] p-8'>
            <h1 className='text-(--primary) text-center text-5xl font-bold font-inter'>Verify OTP</h1>
            <p className='text-white/60 text-center mt-4'>
                We've sent a verification code to <span className='text-white'>{email}</span>
            </p>

            <form onSubmit={handleVerifyOTP} className='flex flex-col items-center gap-6 mt-12'>
                <div className='flex flex-col w-7/10 relative'>
                    <div className='flex justify-between mb-2'>
                        <label className='text-white'>Enter OTP Code</label>
                        <p className='text-white/60'>
                            {otpRemainTime > 0 ? `Expires in ${otpRemainTime}s` : 'Expired'}
                        </p>
                    </div>
                    <input
                        type='text'
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder='Enter 6-digit code'
                        maxLength={6}
                        className='text-white border-2 border-white/10 bg-(--secondary) w-full h-[60px] text-[20px] pl-4 pr-12 rounded-lg'
                        required
                    />
                    <PaperAirplaneIcon
                        className={`w-6 h-6 absolute right-4 top-[52px] rotate-330 cursor-pointer ${
                            pressedResend || otpRemainTime > 0
                                ? 'text-white/30'
                                : 'text-white/60 hover:text-(--primary)'
                        }`}
                        onClick={handleResendOTP}
                    />
                </div>

                <button
                    type='submit'
                    className='w-7/10 h-[60px] bg-(--primary) text-white rounded-lg font-bold text-xl hover:bg-(--primary)/80'
                >
                    Verify & Create Account
                </button>

                <button
                    type='button'
                    onClick={() => navigate('/signUp')}
                    className='text-white/60 hover:text-white'
                >
                    Back to Sign Up
                </button>
            </form>
        </div>
    );
}
