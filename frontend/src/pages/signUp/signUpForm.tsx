import { useState, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import GoogleIcon from '../../assets/Google_Favicon_2025.svg';
import useAuthStore from '@/stores/authStore';

const signUpSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    username: z.string().min(3, 'Username is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    birthdate: z.string().min(1, 'Birthdate is required'),
    address: z.string().min(3, 'Address is required'),
    terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
}).refine((data) => 
    data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], 
});

type SignUpType = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
    const [showPassword, setShowPassword] =  useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const navigate = useNavigate();

    const {register, handleSubmit, formState: {errors}} = useForm<SignUpType>({
        resolver: zodResolver(signUpSchema),
    });

    const signUpSubmit = async (data: SignUpType) => {
        try {
            const captchaToken = recaptchaRef.current?.getValue();
            if (!captchaToken) {
                toast.error('Please complete the reCAPTCHA');
                return;
            }
            const {username, email, password, birthdate, address} = data;
            const { register: registerAccount } = useAuthStore.getState();
            await registerAccount(email, username, password, birthdate, address, captchaToken);
            navigate('/verify-otp', { 
                state: { username, email, password, birthdate, address } 
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='w-1/2 h-[1500px] bg-(--third) rounded-lg m-auto mt-[50px] p-4'>
            <h1 className='text-(--primary) text-center text-5xl font-bold font-inter mt-8'>Sign Up</h1>
            <p className='text-white/60 text-center mt-4'>Create your Online Auction account!</p>

            <form onSubmit={handleSubmit(signUpSubmit)} className='flex flex-col items-center justify-center gap-4 mt-8'>
                <div className='flex flex-col w-7/10 h-[120px]'>
                    <label htmlFor='email' className='text-white mb-2'>Email</label>
                    <input type="email" placeholder="Enter your email" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg'  
                    {...register('email')} />
                    {errors.email && <p className='text-red-400'>{errors.email.message}</p>}
                </div>

                <div className='flex flex-col w-7/10 h-[120px] relative'>
                    <label htmlFor='username' className='text-white mb-2'>Username</label>
                    <input type="text" placeholder="Enter your username" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg' 
                    {...register('username')} />
                    {errors.username && <p className='text-red-400'>{errors.username.message}</p>}
                </div>

                <div className='flex flex-col w-7/10 h-[120px] relative'>
                    <label htmlFor='password' className='text-white mb-2'>Password</label>
                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg' 
                    {...register('password')} />
                    <button type='button' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeIcon className='w-6 h-6 text-white/60 absolute right-4 top-13 cursor-pointer' /> : <EyeSlashIcon className='w-6 h-6 text-white/60 absolute right-4 top-13 cursor-pointer' />}
                    </button>
                    {errors.password && <p className='text-red-400'>{errors.password.message}</p>}
                </div>

                <div className='flex flex-col w-7/10 h-[120px] relative'>
                    <label htmlFor='confirm-password' className='text-white mb-2'>Confirm Password</label>
                    <input type={showPassword ? "text" : "password"} placeholder="Confirm your password" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg' 
                    {...register('confirmPassword')} />
                    <button type='button' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeIcon className='w-6 h-6 text-white/60 absolute right-4 top-13 cursor-pointer' /> : <EyeSlashIcon className='w-6 h-6 text-white/60 absolute right-4 top-13 cursor-pointer' />}
                    </button>
                    {errors.confirmPassword && <p className='text-red-400'>{errors.confirmPassword.message}</p>}
                </div>

                <div className='flex flex-col w-7/10 h-[120px]'>
                    <label htmlFor='birthdate' className='text-white mb-2'>Birthdate</label>
                    <input type="date" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg' 
                    {...register('birthdate')} />
                    {errors.birthdate && <p className='text-red-400'>{errors.birthdate.message}</p>}
                </div>

                <div className='flex flex-col w-7/10 h-[120px]'>
                    <label htmlFor='address' className='text-white mb-2'>Address</label>
                    <input type="text" placeholder="Enter your address" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg' 
                    {...register('address')} />
                    {errors.address && <p className='text-red-400'>{errors.address.message}</p>}
                </div>

                <div className='flex items-center gap-2 w-7/10'>
                    <input type="checkbox" {...register('terms')} className='w-5 h-5' />
                    <label className='text-white/60'>I agree to the terms and conditions</label>
                </div>
                {errors.terms && <p className='text-red-400 w-7/10'>{errors.terms.message}</p>}

                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Leuei0sAAAAADL_eRglWEyzSL4JxrfJUxpMyhSk"}
                />

                <button type='submit' className='w-7/10 h-[60px] bg-(--primary) text-white rounded-lg font-bold text-xl hover:bg-(--primary)/80'>
                    Register
                </button>

                <p className='text-white/60 text-center mt-4'>Or continue with</p>
                <div className='w-7/10 flex justify-center items-center gap-4'>
                    <button type='button' className='w-5/10 h-[50px] bg-white rounded-lg'>
                        <img src={GoogleIcon} className='w-6 h-6 inline-block mr-2 align-middle' />
                        Continue with Google
                    </button>
                </div>

                <p className='text-white/60'>Already have an account? <Link to='/signIn' className='text-(--primary) hover:underline'>Sign In</Link></p>
            </form>
        </div>
    );
}
