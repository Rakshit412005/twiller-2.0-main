"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/context/firebase";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Backend rate-limit check
      await axiosInstance.post("/api/auth/forgot-password", {
        email: email.toLowerCase(),
      });

      // 2️⃣ Firebase reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      });

      alert("Reset password link will surely be present in your gmail's SPAM section, please mark it as NOT SPAM and continue, Thank You!")
      toast.success(
        "Reset link sent. Please check Inbox / Spam folder."
      );
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.warning(err.response.data.error);
      } else {
        toast.error(err.response?.data?.error || "Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-black text-white rounded">
        <h2 className="text-xl mb-4">Forgot Password</h2>

        <input
          className="w-full p-2 mb-4 bg-gray-900 border"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-500 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </div>
    </div>
  );
}
