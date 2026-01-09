"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/context/firebase";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return toast.error("Enter email");

    try {
      setLoading(true);

      // ✅ Check daily limit (MongoDB)
      await axiosInstance.post("/api/auth/forgot-password", { email });

      // ✅ Firebase sends reset link (OTP-style)
      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset email sent");
      alert("If you don’t see the email, please check Spam and mark it as “Not Spam")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-black text-white rounded">
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
        className="w-full bg-blue-500 py-2 rounded"
      >
        Send Reset Email
      </button>
    </div>
  );
}
