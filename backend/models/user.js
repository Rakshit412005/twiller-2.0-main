import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // Password only for email users
  password: {
    type: String,
    required: function () {
      return this.authProvider === "email";
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

  // Forgot password control
  forgotPassword: {
    lastRequestedAt: { type: Date },
  },

  // 🔥 Subscription fields
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

  joinedDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema);
