import express from "express";
import crypto from "crypto";
import User from "../models/user.js";
import { sendInvoiceMail } from "../utils/sendInvoiceMail.js"; // reuse email infra

const router = express.Router();

// Generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * REQUEST OTP
 */
router.post("/request", async (req, res) => {
  const { email, language } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  user.languageVerification = {
    otp,
    expiresAt,
    pendingLanguage: language,
  };

  await user.save();

  // 🇫🇷 EMAIL OTP
  if (language === "fr") {
    await sendInvoiceMail({
      email: user.email,
      username: user.username,
      plan: "Language Verification",
      amount: "OTP",
      paymentId: otp,
      orderId: "LANG",
      expiryDate: expiresAt,
    });
  }

  // 📱 SMS OTP (placeholder — Twilio next step)
  else {
    console.log("📱 SMS OTP:", otp);
  }

  res.json({ success: true });
});

/**
 * VERIFY OTP
 */
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.languageVerification)
    return res.status(400).json({ error: "Invalid request" });

  const record = user.languageVerification;

  if (new Date() > record.expiresAt)
    return res.status(400).json({ error: "OTP expired" });

  if (record.otp !== otp)
    return res.status(400).json({ error: "Invalid OTP" });

  const language = record.pendingLanguage;

  user.languageVerification = undefined;
  await user.save();

  res.json({ success: true, language });
});

export default router;
