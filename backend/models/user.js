import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  notificationsEnabled: {
    type: Boolean,
    default: true,
  },

  phone: {
    type: String,
  },

  languageVerification: {
  otp: String,
  expiresAt: Date,
  pendingLanguage: String,
  target: String,
},


  language: {
    type: String,
    enum: ["en", "hi", "fr", "es", "pt", "zh"],
    default: "en",
  },

  password: {
    type: String,
    required: function () {
    return this.isNew && this.authProvider === "email";
    },
  },

  authProvider: {
    type: String,
    enum: ["email", "google"],
    default: "email",
  },

  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },

  forgotPassword: {
    lastRequestedAt: { type: Date },
  },

  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  tweetsUsed: {
    type: Number,
    default: 0,
  },

  planExpiresAt: {
    type: Date,
    default: null,
  },
loginHistory: [
  {
    browser: String,
    os: String,
    deviceType: String, // desktop | mobile
    ipAddress: String,
    loginAt: {
      type: Date,
      default: Date.now,
    },
  },
],

  joinedDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema);
