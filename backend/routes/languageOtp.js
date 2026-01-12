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
  console.log("LANG OTP SEND BODY:", req.body);

  try {
    const { userId, language, target } = req.body;

    if (!language) {
      return res.status(400).json({ error: "Language missing" });
    }

    // ✅ FETCH USER FIRST
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ PREVENT OTP OVERWRITE
    if (
      user.languageVerification &&
      user.languageVerification.expiresAt &&
      new Date() < user.languageVerification.expiresAt
    ) {
      return res.status(429).json({
        error: "OTP already sent. Please wait before requesting again.",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          languageVerification: {
            otp,
            expiresAt,
            pendingLanguage: language,
            target,
          },
        },
      }
    );

    // 🇫🇷 EMAIL
    if (language === "fr") {
      await sendEmailOtp(user.email, otp);
    } 
    // 📱 SMS
    else {
      if (!target) {
        return res.status(400).json({ error: "Phone required" });
      }
      await sendSmsOtp(target, otp);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("LANG OTP SEND ERROR:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});


/**
 * VERIFY OTP
 */
router.post("/verify", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.languageVerification)
      return res.status(400).json({ error: "Invalid request" });

    const record = user.languageVerification;

    if (new Date() > record.expiresAt)
      return res.status(400).json({ error: "OTP expired" });

    if (record.otp !== otp.trim())
      return res.status(400).json({ error: "Invalid OTP" });

    await User.updateOne(
      { _id: user._id },
      {
        $set: { language: record.pendingLanguage },
        $unset: { languageVerification: "" },
      }
    );

    return res.json({
      success: true,
      language: record.pendingLanguage,
    });
  } catch (err) {
    console.error("LANG OTP VERIFY ERROR:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
