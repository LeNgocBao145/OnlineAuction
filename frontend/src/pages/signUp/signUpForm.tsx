import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import GoogleIcon from '../../assets/Google_Favicon_2025.svg';

export default function SignUpForm() {
    const [showPassword, setShowPassword] =  useState(false);
    const [pressedGetOTP, setPressedGetOTP] = useState(false);
    const [OTPcode, setOTPcode] = useState('');
    const [OTPRemainTime, setOTPRemainTime] = useState(-1);

    const signInSchema = z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        username: z.string().min(3, 'Username is required'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
        emailOTP: z.string().min(1, 'Email OTP is required'),
        terms: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms and conditions",
        }),
    }).refine((data) => 
        data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], 
    });

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
        resolver: zodResolver(signInSchema),
    });

    const signInSubmit = (data: any) => {
        console.log('Form Data:', data);
        reset();
    };

    const recieveEmailOTP = () => {
        if(OTPcode) {
            console.log('OTP already sent, please wait');
            return;
        }
        console.log('Recieve Email OTP clicked');

        // Simulate receiving OTP, replace with yo api call
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setOTPcode(generatedOTP);
        setOTPRemainTime(60);
        console.log('Generated OTP:', generatedOTP);
    }

    useEffect(() => {
        if (OTPcode) {
            setTimeout(() => {
                setOTPcode('');
                console.log('OTP expired');
            }, 60000); // OTP valid for 1 minutes

            setInterval(() => {
                setOTPRemainTime((prev) => (prev > 0 ? prev - 1 : 60));
            }, 1000);
        }
    }, [OTPcode]);

    return (
        <div className='w-1/2 h-[1200px] bg-(--third) rounded-lg m-auto mt-[50px] p-4'>
            <h1 className='text-(--primary) text-center text-5xl font-bold font-inter mt-8'>Sign Up</h1>
            <p className='text-white/60 text-center mt-4'>Create your Online Auction account!</p>

            <form onSubmit={handleSubmit(signInSubmit)} className='flex flex-col items-center justify-center gap-4 mt-8'>
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
                <div className='flex flex-col w-7/10 h-[120px] relative'>
                    <div className='flex w-full justify-between'>
                        <label htmlFor='emailOTP' className='text-white mb-2'>Email code</label>
                        <p className='text-white/60 mb-2'>{OTPRemainTime > 0 ? `Expires in ${OTPRemainTime}s` : 'N/A'}</p>
                    </div>
                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password" 
                    className='text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg' 
                    {...register('emailOTP')} />

                    <PaperAirplaneIcon className={`w-6 h-6 absolute right-4 top-12 rotate-330 ${pressedGetOTP ? 'w-4 h-4' : 'text-white/60 hover:text-(--primary)'}`}
                        onClick={() => {
                            recieveEmailOTP();
                            setPressedGetOTP(true);
                            setTimeout(() => setPressedGetOTP(false), 500);
                        }}
                    />

                    {errors.emailOTP && <p className='text-red-400'>{errors.emailOTP.message}</p>}
                </div>
                <div className='w-7/10 h-[50px] flex justify-between items-center'>
                    <div>
                        <input type='checkbox' {...register('terms')} />
                        <label htmlFor='terms' className='text-white/60 ml-1'>I agree with the Terms and Conditions</label>

                        {errors.terms && <p className='text-red-400'>{errors.terms.message}</p>}
                    </div>
                </div>
                <div className='w-7/10 flex justify-between items-center'>
                    <button type="submit" className='w-full h-[50px] bg-(--primary) rounded-lg'>Sign Up</button>
                </div>
            </form>

            <p className='text-white/60 text-center mt-8'>Or continue with</p>
            <div className='w-7/10 flex justify-center items-center gap-4 mx-auto'>
                <button className='w-5/10 h-[50px] bg-white rounded-lg my-8'>
                    <img src={GoogleIcon} className='w-6 h-6 inline-block mr-2 align-middle' />
                    Continue with Google
                </button>
            </div>
            <p className='text-white/60 text-center'>Already have an account? <Link to="/signIn" className='text-(--primary) hover:underline'>Sign In</Link></p>
        </div>
    );
}