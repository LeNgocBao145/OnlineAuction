import { FaUser } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import useAuthStore from "@/stores/authStore";
import useUserStore from "@/stores/userStore";
import userService from "@/services/userService";
import { useState, useEffect } from "react";
import OTPModal from "@/components/modals/OTPModal";

export default function ChangeBasicInfo() {
  const { user, fetchMe } = useAuthStore();
  const {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    changePassword,
    sendOTP,
    verifyOTP,
  } = useUserStore();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [OTPModalOpen, setOTPModalOpen] = useState(false);
  const [OTPVerified, setOTPVerified] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<any>(null);
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  const profileFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    birthdate: z
      .string()
      .transform((str) => new Date(str))
      .refine(
        (data) => {
          const birthDate = data;
          if (isNaN(birthDate.getTime())) return false;

          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
          }

          return age >= 18 && age <= 150;
        },
        {
          message: "You must be at least 18 years old",
        }
      ),
    address: z.string().min(10, "Address must be at least 10 characters long"),
  });

  const passwordFormSchema = z
    .object({
      oldPassword: z
        .string()
        .min(6, "Old password must be at least 6 characters long"),
      newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters long"),
      confirmPassword: z
        .string()
        .min(6, "Confirm password must be at least 6 characters long"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      birthdate: "",
      address: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordFormSchema),
  });

  useEffect(() => {
    if (profile) {
      resetProfile({
        username: profile.name || "",
        email: profile.email || "",
        birthdate: profile.birthdate ? profile.birthdate.split("T")[0] : "",
        address: profile.address || "",
      });
    }
  }, [profile, resetProfile]);  

  const onSubmitProfile = async (data: any) => {
    const emailChanged = profile?.email !== data.email;

    if (emailChanged) {
      try {
        setPendingProfileData({
          name: data.username,
          email: data.email,
          birthdate: new Date(data.birthdate).toISOString(),
          address: data.address,
        });
        setNewEmail(data.email);
        await sendOTP(user?.id!, data.email);
        toast.success("OTP sent to your new email address!");
        setOTPModalOpen(true);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to send OTP");
        console.error(error);
      }
    } else {
      try {
        await updateProfile(user?.id!, {
          name: data.username,
          email: data.email,
          birthdate: new Date(data.birthdate).toISOString(),
          address: data.address,
        });
        toast.success("Profile updated successfully!");
        await fetchProfile(user?.id!);
        await fetchMe();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to update profile"
        );
        console.error(error);
      }
    }
  };
  const onSubmitPassword = async (data: any) => {
    try {
      await changePassword(
        user?.id!,
        data.oldPassword,
        data.newPassword,
        data.confirmPassword
      );
      toast.success("Password changed successfully!");
      resetPassword();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to change password"
      );
      console.error(error);
    }
  };

  const handleUpgradeRequest = async () => {
    if (!user?.id) return;
    try {
      setUpgradeLoading(true);
      await userService.requestToBeSeller(user.id);
      toast.success("Upgrade request sent! Please wait for admin approval.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to send upgrade request"
      );
    } finally {
      setUpgradeLoading(false);
    }
  };  

  const handleVerifyOTP = async (otp: string) => {
    try {
      await verifyOTP(user?.id!, newEmail, otp);
      toast.success("Email verified and profile updated successfully!");
      await fetchProfile(user?.id!);
      await fetchMe();
      setPendingProfileData(null);
      setNewEmail("");
    } catch (error: any) {
      throw error;
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP(user?.id!, newEmail);
      toast.success("OTP resent! Please check your email.");
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <>
      {OTPModalOpen && (
        <OTPModal
          setModalOpen={setOTPModalOpen}
          setSuccess={setOTPVerified}
          email={newEmail}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
        />
      )}
      <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-(--primary) text-2xl">
            Change Account Information
          </h1>
          {user?.role === "bidder" && (
            <button
              onClick={handleUpgradeRequest}
              disabled={upgradeLoading}
              className="p-4 bg-(--primary) text-black font-bold rounded-md disabled:opacity-50"
            >
              <FaUser className="inline mr-2" />
              {upgradeLoading ? "Sending..." : "Request Account Upgrade"}
            </button>
          )}
        </div>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={handleSubmitProfile(onSubmitProfile)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Enter username"
                {...registerProfile("username")}
              />
              {profileErrors.username && (
                <p className="text-red-500">{profileErrors.username.message}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Enter email"
                {...registerProfile("email")}
              />
              {profileErrors.email && (
                <p className="text-red-500">{profileErrors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="birthdate">
                Birthdate
              </label>
              <input
                type="date"
                id="birthdate"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Enter birthdate"
                {...registerProfile("birthdate")}
              />
              {profileErrors.birthdate && (
                <p className="text-red-500">
                  {profileErrors.birthdate.message}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Enter address"
                {...registerProfile("address")}
              />
              {profileErrors.address && (
                <p className="text-red-500">{profileErrors.address.message}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 p-3 bg-(--primary) text-black font-bold rounded-md w-32 self-end disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <div className="w-full h-1 bg-white/10 rouned-lg my-8"></div>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmitPassword(onSubmitPassword)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="old-password">
                Old password
              </label>
              <input
                type="password"
                id="old-password"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Enter your old password"
                {...registerPassword("oldPassword")}
              />
              {passwordErrors.oldPassword && (
                <p className="text-red-500">
                  {passwordErrors.oldPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="new-password">
                New password
              </label>
              <input
                type="password"
                id="new-password"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Enter your new password"
                {...registerPassword("newPassword")}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-2" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
                placeholder="Confirm your new password"
                {...registerPassword("confirmPassword")}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 p-3 bg-(--primary) text-black font-bold rounded-md w-32 self-end disabled:opacity-50"
          >
            {loading ? "Changing..." : "Save Changes"}
          </button>
        </form>
      </div>
      <div className="flex flex-col">
        <label className="text-white mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
          placeholder="Enter email"
          {...registerProfile("email")}
        />
        {profileErrors.email && (
          <p className="text-red-500">{profileErrors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col">
        <label className="text-white mb-2" htmlFor="birthdate">
          Birthdate
        </label>
        <input
          type="date"
          id="birthdate"
          className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
          placeholder="Enter birthdate"
          {...registerProfile("birthdate")}
        />
        {profileErrors.birthdate && (
          <p className="text-red-500">{profileErrors.birthdate.message}</p>
        )}
      </div>
      <div className="flex flex-col">
        <label className="text-white mb-2" htmlFor="address">
          Address
        </label>
        <input
          type="text"
          id="address"
          className="p-2 rounded-md bg-(--bgc) border border-white/10 text-white"
          placeholder="Enter address"
          {...registerProfile("address")}
        />
        {profileErrors.address && (
          <p className="text-red-500">{profileErrors.address.message}</p>
        )}
      </div>
    </>
  );
}
