import mongoose from "mongoose";

const LanguageOtpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["email", "sms"], required: true },
  target: { type: String, required: true }, 
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

export default mongoose.model("LanguageOtp", LanguageOtpSchema);
