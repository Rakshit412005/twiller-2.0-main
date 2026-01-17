import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    await User.updateOne(
      { _id: userId },
      { $set: { loginOtpVerified: false } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
