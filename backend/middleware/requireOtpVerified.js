import User from "../models/user.js";

export const requireOtpVerified = async (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (!user.loginOtpVerified && req.headers["x-browser"] === "Chrome") {
    return res.status(401).json({ error: "OTP_REQUIRED" });
  }

  next();
};