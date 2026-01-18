import express from "express";
import { sendOtpEmail } from "../utils/sendOtp.js";

const router = express.Router();


const otpStore = new Map();

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, 
  });

  await sendOtpEmail(email, otp);
  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "OTP not found" });
  if (Date.now() > record.expiresAt)
    return res.status(400).json({ message: "OTP expired" });

  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(email);
  res.json({ success: true });
});

export default router;
