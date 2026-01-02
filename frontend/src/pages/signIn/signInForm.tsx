import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import GoogleIcon from "../../assets/Google_Favicon_2025.svg";
import useAuthStore from "@/stores/authStore";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean().optional(),
});

type SignInType = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const signInSubmit = async (data: SignInType) => {
    try {
      const { email, password } = data;
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-1/2 h-[800px] bg-(--third) rounded-lg p-4">
      <h1 className="text-(--primary) text-center text-5xl font-bold font-inter mt-8">
        Sign In
      </h1>
      <p className="text-white/60 text-center mt-4">
        Welcome back to Online Auction!
      </p>

      <form
        onSubmit={handleSubmit(signInSubmit)}
        className="flex flex-col items-center justify-center gap-4 mt-8"
      >
        <div className="flex flex-col w-7/10 h-[120px]">
          <label htmlFor="email" className="text-white mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col w-7/10 h-[120px] relative">
          <label htmlFor="password" className="text-white mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="text-white border-2 border-white/10 bg-(--secondary) w-full h-5/10 text-[20px] pl-4 rounded-lg"
            {...register("password")}
          />

          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeIcon className="w-6 h-6 text-white/60 absolute right-4 top-13 cursor-pointer" />
            ) : (
              <EyeSlashIcon className="w-6 h-6 text-white/60 absolute right-4 top-13 cursor-pointer" />
            )}
          </button>

          {errors.password && (
            <p className="text-red-400">{errors.password.message}</p>
          )}
        </div>
        <div className="w-7/10 flex justify-between items-center">
          <div>
            <input type="checkbox" {...register("rememberMe")} />
            <label htmlFor="rememberMe" className="text-white/60 ml-1">
              Remember Me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-(--primary) hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="w-7/10 flex justify-between items-center">
          <button
            type="submit"
            className="w-full h-[50px] bg-(--primary) rounded-lg"
          >
            Sign In
          </button>
        </div>
      </form>

      <p className="text-white/60 text-center mt-8">Or continue with</p>
      <div className="w-7/10 flex justify-center items-center gap-4 mx-auto">
        <button className="w-5/10 h-[50px] bg-white rounded-lg my-8">
          <img
            src={GoogleIcon}
            className="w-6 h-6 inline-block mr-2 align-middle"
          />
          Continue with Google
        </button>
      </div>
      <p className="text-white/60 text-center">
        Don't have an account?{" "}
        <Link to="/signUp" className="text-(--primary) hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
