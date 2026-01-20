"use client";

import { useState } from "react";
import { confirmPasswordReset, getAuth } from "firebase/auth";
import { generatePassword } from "@/utils/passwordGenerator";
import { toast } from "react-toastify";

export default function ResetPassword({ searchParams }: any) {
  const oobCode = searchParams.oobCode;
  const auth = getAuth();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    const pwd = generatePassword(10);
    setPassword(pwd);
  };

  const handleReset = async () => {
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated successfully");
    } catch {
      toast.error("Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>

      <input
        className="w-full p-2 border mb-2"
        value={password}
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="mb-2 text-blue-500 underline"
      >
        Generate Password
      </button>

      <button
        onClick={handleReset}
        disabled={loading}
        className="w-full bg-green-500 text-white p-2 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Create New Password"}
      </button>
    </div>
  );
}
