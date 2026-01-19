import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.post("/track-login", async (req, res) => {
  try {
    const { userId, browser, os, deviceType } = req.body;
    console.log("LOGIN TRACK:", {
      browser,
      os,
      deviceType,
      hour: new Date().getHours(),
    });


    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "Unknown";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

   
    if (deviceType === "mobile") {
      const hour = new Date().getHours();
      if (hour < 10 || hour >= 13) {
        return res.status(403).json({
          error: "Mobile access allowed only between 10 AM and 1 PM",
        });
      }
    }
console.log("OTP VERIFIED FLAG:", user.loginOtpVerified);


if (browser === "Chrome") {
  if (!user.loginOtpVerified) {
    return res.status(401).json({ error: "OTP_REQUIRED" });
  }
  
}



await User.updateOne(
  { _id: userId },
  {
    $set: { loginOtpVerified: false }, // ✅ ADD THIS
    $push: {
      loginHistory: {
        $each: [{
          browser,
          os,
          deviceType,
          ipAddress,
          loginAt: new Date(),
        }],
        $position: 0,
        $slice: 20,
      },
    },
  }
);





    res.json({ success: true });
  } catch (err) {
    console.error("LOGIN TRACK ERROR:", err);
    res.status(500).json({ error: "Login tracking failed" });
  }
});

export default router;


