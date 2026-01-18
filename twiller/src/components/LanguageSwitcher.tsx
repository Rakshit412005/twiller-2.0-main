"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const LANGUAGES = [
  { code: "en", label: "English", type: "sms" },
  { code: "fr", label: "Français", type: "email" },
  { code: "hi", label: "हिंदी", type: "sms" },
  { code: "es", label: "Español", type: "sms" },
  { code: "pt", label: "Português", type: "sms" },
  { code: "zh", label: "中文", type: "sms" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const [selectedLang, setSelectedLang] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"idle" | "mobile" | "otp">("idle");

const sendOtp = async (lang: any, phoneOverride?: string) => {
  try {
    let target = "";

    if (lang.code === "fr") {
      target = user!.email;
    } else {
      const phone = phoneOverride || mobile;
      if (!phone) {
        toast.error("Enter mobile number");
        return;
      }
      target = phone.startsWith("+") ? phone : "+91" + phone;
    }

    console.log("SEND OTP PAYLOAD", {
      userId: user!._id,
      language: lang.code,
      target,
    });

    await axios.post("/api/language-otp/send", {
      userId: user!._id,
      language: lang.code,
      target,
    });

    toast.success("OTP sent");
    setStep("otp");
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Failed to send OTP");
  }
};






const verifyOtp = async () => {
  try {
    await axios.post("/api/language-otp/verify", {
      userId: user!._id,
      otp,
      language: selectedLang.code,
    });

    i18n.changeLanguage(selectedLang.code);
    localStorage.setItem("lang", selectedLang.code);

    toast.success("Language changed");
    setStep("idle");
    setOtp("");
    setMobile("");
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Invalid or expired OTP");
  }
};



const handleLanguageClick = async (lang: any) => {
  setSelectedLang(lang);
  setOtp("");
  setMobile("");

  if (lang.code === "fr") {
    await sendOtp(lang); 
  } else {
    setStep("mobile");
  }
};






  return (
    <div className="mt-4 space-y-2 text-sm text-gray-300">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageClick(lang)}
          className="block hover:text-white"
        >
          🌐 {lang.label}
        </button>
      ))}

      {/* 📱 MOBILE INPUT */}
      {step === "mobile" && (
        <div className="mt-2">
          <input
            type="tel"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          />
          <button
            onClick={() => sendOtp(selectedLang, mobile)}
            className="mt-2 w-full bg-blue-500 py-1 rounded"
          >
            Send OTP
          </button>
        </div>
      )}

      {/* 🔐 OTP INPUT */}
      {/* 🔐 OTP INPUT */}
      {step === "otp" && (
        <div className="mt-2 space-y-2">
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          />

          <button
            onClick={verifyOtp}
            className="w-full bg-green-500 py-1 rounded"
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
