import React, { useState } from "react";
import { set } from "zod";
  
export default function OTPModal({
    setModalOpen,
    setSuccess
} : {
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Handle OTP verification logic here
        if (true) {
            alert("OTP Verified Successfully!");
            setSuccess(true);
        } else {
            alert("OTP Verification Failed. Please try again.");
            setSuccess(false);
        }

        setModalOpen(false);
    }

  return (
    <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
        <div className="bg-(--secondary) border border-white/10 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-(--primary) text-2xl font-bold mb-4">Verify OTP</h2>
            <p className="text-white/70 mb-6">
                Verify the OTP code sent to your email address.
            </p>
            <form>
                <div className="mb-4">
                    <input
                        type="text"
                        id="otp"
                        className="w-full p-2 rounded-md bg-(--third) border border-white/10 text-white"
                        placeholder="Enter OTP code"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="bg-(--primary) text-black px-4 py-2 rounded-md hover:bg-(--primary)/30"
                    >
                        Verify
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}