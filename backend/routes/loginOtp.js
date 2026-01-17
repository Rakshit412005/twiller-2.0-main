import express from "express";
import User from "../models/user.js";
import { sendLoginOtpMail } from "../utils/sendLoginOtpMail.js";

const router = express.Router();

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * SEND LOGIN OTP (CHROME)
 */
router.post("/send", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.loginOtp = {
      otp,
      expiresAt,
    };

    await user.save({ validateBeforeSave: false });

    await sendLoginOtpMail(user.email, otp);

    res.json({ success: true });
  } catch (err) {
    console.error("LOGIN OTP SEND ERROR:", err);
    res.status(500).json({ error: "Failed to send login OTP" });
  }
});

/**
 * VERIFY LOGIN OTP
 */
router.post("/verify", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.loginOtp) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (new Date() > user.loginOtp.expiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (user.loginOtp.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.loginOtp = undefined;
    user.loginOtpVerified = true;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true });
  } catch (err) {
    console.error("LOGIN OTP VERIFY ERROR:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

export default router;
