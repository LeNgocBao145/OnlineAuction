import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import useAuthStore from "@/stores/authStore";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  rememberMe: z.boolean().optional(),
});

type SignInType = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSwitchToSignUp?: () => void;
}

export default function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
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
    <div className="w-full max-w-xl bg-(--third) rounded-xl p-6 shadow-2xl border border-white/10">
      {/* Header */}
      <h1 className="text-(--primary) text-center text-3xl font-bold font-inter">
        Sign In
      </h1>
      <p className="text-white/60 text-center mt-1 text-sm">
        Welcome back to Online Auction!
      </p>

      {/* Divider */}
      <div className="h-px bg-white/10 my-4"></div>

      <form
        onSubmit={handleSubmit(signInSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col">
          <label htmlFor="email" className="text-white text-sm mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 rounded-lg focus:border-(--primary) focus:outline-none transition-colors"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col relative">
          <label htmlFor="password" className="text-white text-sm mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="text-white border border-white/10 bg-(--secondary) w-full h-11 text-base pl-3 pr-10 rounded-lg focus:border-(--primary) focus:outline-none transition-colors"
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9">
            {showPassword ? (
              <EyeIcon className="w-5 h-5 text-white/60 cursor-pointer hover:text-white" />
            ) : (
              <EyeSlashIcon className="w-5 h-5 text-white/60 cursor-pointer hover:text-white" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1">
            <input type="checkbox" {...register("rememberMe")} className="w-4 h-4 accent-(--primary)" />
            <label htmlFor="rememberMe" className="text-white/60 text-sm">
              Remember Me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-(--primary) hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-2"></div>

        <button
          type="submit"
          className="w-full h-11 bg-(--primary) text-black rounded-lg font-bold text-base hover:bg-(--primary)/90 transition-colors"
        >
          Sign In
        </button>

        <p className="text-white/60 text-center text-sm">
          Don't have an account?{" "}
          {onSwitchToSignUp ? (
            <button type="button" onClick={onSwitchToSignUp} className="text-(--primary) hover:underline font-medium">
              Sign Up
            </button>
          ) : (
            <Link to="/signUp" className="text-(--primary) hover:underline font-medium">
              Sign Up
            </Link>
          )}
        </p>
      </form>
    </div>
  );
}
