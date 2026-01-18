import express from "express";
import User from "../models/user.js";

const router = express.Router();

/**
 * POST /api/auth/forgot-password
 * Checks if user can request reset today
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const last = user.forgotPassword?.lastRequestedAt;
    const now = new Date();

    if (last) {
      const diff = now - new Date(last);
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (diff < ONE_DAY) {
        return res.status(429).json({
          error: "You can request password reset only once per day",
        });
      }
    }

   
    await User.updateOne(
      { email },
      { $set: { "forgotPassword.lastRequestedAt": now } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
