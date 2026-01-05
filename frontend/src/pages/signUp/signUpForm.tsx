import { useState, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

import useAuthStore from '@/stores/authStore';

const signUpSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    username: z.string().min(3, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    birthdate: z.string().min(1, 'Birthdate is required'),
    address: z.string().min(3, 'Address is required'),
    terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
}).refine((data) => {
    const birthDate = new Date(data.birthdate);
    if (isNaN(birthDate.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age >= 18 && age <= 150;
}, {
    message: "You must be at least 18 years old",
    path: ["birthdate"],
}).refine((data) =>
    data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignUpType = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
    onSwitchToSignIn?: () => void;
}

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<SignUpType>({
        resolver: zodResolver(signUpSchema),
    });

    const signUpSubmit = async (data: SignUpType) => {
        try {
            const captchaToken = recaptchaRef.current?.getValue();
            if (!captchaToken) {
                toast.error('Please complete the reCAPTCHA');
                return;
            }
            const { username, email, password, birthdate, address } = data;
            const { register: registerAccount } = useAuthStore.getState();
            await registerAccount(email, username, password, birthdate, address, captchaToken);
            navigate('/verify-otp', {
                state: { email }
            });
        } catch (error) {
            console.error(error);
            recaptchaRef.current?.reset();
        }
    };

    return (
        <div className='w-full max-w-xl bg-(--third) rounded-xl p-6 shadow-2xl border border-white/10'>
            {/* Header */}
            <h1 className='text-(--primary) text-center text-3xl font-bold font-inter'>Sign Up</h1>
            <p className='text-white/60 text-center mt-1 text-sm'>Create your Online Auction account!</p>

            {/* Divider */}
            <div className='h-px bg-white/10 my-4'></div>

            <form onSubmit={handleSubmit(signUpSubmit)} className='flex flex-col gap-4'>
                {/* Email - Full width */}
                <div className='flex flex-col'>
                    <label htmlFor='email' className='text-white text-sm mb-1'>Email</label>
                    <input type="email" placeholder="Enter your email"
                        className='text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 rounded-lg focus:border-(--primary) focus:outline-none transition-colors'
                        {...register('email')} />
                    {errors.email && <p className='text-red-400 text-xs mt-1'>{errors.email.message}</p>}
                </div>

                {/* Username and Birthdate - Two columns */}
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col'>
                        <label htmlFor='username' className='text-white text-sm mb-1'>Username</label>
                        <input type="text" placeholder="Username"
                            className='text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 rounded-lg focus:border-(--primary) focus:outline-none transition-colors'
                            {...register('username')} />
                        {errors.username && <p className='text-red-400 text-xs mt-1'>{errors.username.message}</p>}
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='birthdate' className='text-white text-sm mb-1'>Birthdate</label>
                        <input type="date"
                            className='text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 rounded-lg focus:border-(--primary) focus:outline-none transition-colors'
                            {...register('birthdate')} />
                        {errors.birthdate && <p className='text-red-400 text-xs mt-1'>{errors.birthdate.message}</p>}
                    </div>
                </div>

                {/* Password and Confirm Password - Two columns */}
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col relative'>
                        <label htmlFor='password' className='text-white text-sm mb-1'>Password</label>
                        <input type={showPassword ? "text" : "password"} placeholder="Password"
                            className='text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 pr-10 rounded-lg focus:border-(--primary) focus:outline-none transition-colors'
                            {...register('password')} />
                        <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-9'>
                            {showPassword ? <EyeIcon className='w-5 h-5 text-white/60 cursor-pointer hover:text-white' /> : <EyeSlashIcon className='w-5 h-5 text-white/60 cursor-pointer hover:text-white' />}
                        </button>
                        {errors.password && <p className='text-red-400 text-xs mt-1'>{errors.password.message}</p>}
                    </div>
                    <div className='flex flex-col relative'>
                        <label htmlFor='confirm-password' className='text-white text-sm mb-1'>Confirm</label>
                        <input type={showPassword ? "text" : "password"} placeholder="Confirm password"
                            className='text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 pr-10 rounded-lg focus:border-(--primary) focus:outline-none transition-colors'
                            {...register('confirmPassword')} />
                        <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-9'>
                            {showPassword ? <EyeIcon className='w-5 h-5 text-white/60 cursor-pointer hover:text-white' /> : <EyeSlashIcon className='w-5 h-5 text-white/60 cursor-pointer hover:text-white' />}
                        </button>
                        {errors.confirmPassword && <p className='text-red-400 text-xs mt-1'>{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                {/* Address - Full width */}
                <div className='flex flex-col'>
                    <label htmlFor='address' className='text-white text-sm mb-1'>Address</label>
                    <input type="text" placeholder="Enter your address"
                        className='text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 rounded-lg focus:border-(--primary) focus:outline-none transition-colors'
                        {...register('address')} />
                    {errors.address && <p className='text-red-400 text-xs mt-1'>{errors.address.message}</p>}
                </div>

                {/* Terms and ReCAPTCHA */}
                <div className='flex items-center gap-2'>
                    <input type="checkbox" {...register('terms')} className='w-4 h-4 accent-(--primary)' />
                    <label className='text-white/60 text-sm'>I agree to the terms and conditions</label>
                </div>
                {errors.terms && <p className='text-red-400 text-xs -mt-2'>{errors.terms.message}</p>}

                <div className='flex justify-center'>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        theme="dark"
                    />
                </div>

                {/* Divider */}
                <div className='h-px bg-white/10 my-2'></div>

                <button type='submit' className='w-full h-11 bg-(--primary) text-black rounded-lg font-bold text-base hover:bg-(--primary)/90 transition-colors'>
                    Register
                </button>

                <p className='text-white/60 text-center text-sm'>Already have an account? {onSwitchToSignIn ? (
                    <button type="button" onClick={onSwitchToSignIn} className='text-(--primary) hover:underline font-medium'>Sign In</button>
                ) : (
                    <Link to='/signIn' className='text-(--primary) hover:underline font-medium'>Sign In</Link>
                )}</p>
            </form>
        </div>
    );
}
