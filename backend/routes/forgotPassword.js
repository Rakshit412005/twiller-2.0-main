import express from "express";
import User from "../models/user.js";

const router = express.Router();

const ONE_DAY = 24 * 60 * 60 * 1000;

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const lastRequested = user.forgotPassword?.lastRequestedAt;

    if (lastRequested) {
      const diff = Date.now() - new Date(lastRequested).getTime();

      if (diff < ONE_DAY) {
        return res.status(429).json({
          error: "You can request password reset only once per day",
        });
      }
    }

    user.forgotPassword = {
      lastRequestedAt: new Date(),
    };

    await user.save({ validateBeforeSave: false });

    res.json({ success: true });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
