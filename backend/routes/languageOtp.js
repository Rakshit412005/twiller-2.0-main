import express from "express";
import User from "../models/user.js";
import { sendEmailOtp } from "../utils/sendOtpMail.js";
import { sendSmsOtp } from "../utils/sendSmsOtp.js";

const router = express.Router();

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * SEND OTP
 */
router.post("/send", async (req, res) => {
  try {
    const { userId, language, target } = req.body;

    if (!userId || !language) {
      return res.status(400).json({ error: "Missing data" });
    }

    const cleanTarget =
      typeof target === "string" ? target.trim() : "";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🚫 Block resend if OTP already valid
    if (
      user.languageVerification &&
      new Date() < user.languageVerification.expiresAt &&
      user.languageVerification.pendingLanguage === language
    ) {
      return res.status(429).json({
        error: "OTP already sent. Please verify it.",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.languageVerification = {
      otp,
      expiresAt,
      pendingLanguage: language,
      target: cleanTarget,
    };

    await user.save({ validateBeforeSave: false });

    console.log("OTP STORED:", {
      otp,
      expiresAt,
      language,
      target: cleanTarget,
    });

    // 🇫🇷 EMAIL
    if (language === "fr") {
      await sendEmailOtp(user.email, otp);
    } else {
      if (!cleanTarget || !cleanTarget.startsWith("+")) {
        return res.status(400).json({
          error: "Valid phone number with country code required",
        });
      }
      await sendSmsOtp(cleanTarget, otp);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("LANG OTP SEND ERROR:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});


/**
 * VERIFY OTP
 */
router.post("/verify", async (req, res) => {
  try {
    const { userId, otp, language } = req.body;

    if (!userId || !otp || !language) {
      return res.status(400).json({ error: "Missing data" });
    }

    const user = await User.findById(userId);
    console.log("VERIFY BODY:", req.body);
    console.log("VERIFY STORED:", user.languageVerification);

    if (!user || !user.languageVerification) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const record = user.languageVerification;

    if (record.pendingLanguage !== language) {
      return res.status(400).json({ error: "Language mismatch" });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.language = language;
    user.languageVerification = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({ success: true, language });
  } catch (err) {
    console.error("LANG OTP VERIFY ERROR:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
