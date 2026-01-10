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

  // ✅ Prevent double render in dev
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleReset = async () => {
    if (!email) return toast.error("Enter email");

    try {
      setLoading(true);

      await axiosInstance.post("/api/auth/forgot-password", { email });
      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset email sent");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
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
          className="w-full bg-blue-500 py-2 rounded"
        >
          Send Reset Email
        </button>
      </div>
    </div>
  );
}
