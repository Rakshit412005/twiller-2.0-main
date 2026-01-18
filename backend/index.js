import dotenv from "dotenv";
dotenv.config();
const PLAN_LIMITS = {
  free: 1,
  bronze: 3,
  silver: 5,
  gold: Infinity,
};

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import languageOtpRoutes from "./routes/languageOtp.js";
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import User from "./models/user.js";
import Tweet from "./models/tweet.js";
import audioOtpRoutes from "./routes/audioOtp.js";
import audioUploadRoutes from "./routes/audioUpload.js";
import paymentRoutes from "./routes/payment.js";
import loginTrackRoutes from "./routes/loginTrack.js";
import loginOtpRoutes from "./routes/loginOtp.js";
import logoutRoutes from "./routes/logout.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/audio", audioOtpRoutes);
app.use("/api/audio", audioUploadRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/language-otp", languageOtpRoutes);
app.use("/api", loginTrackRoutes);
app.use("/api/login-otp", loginOtpRoutes);
app.use("/api", logoutRoutes);
app.get("/", (req, res) => {
  res.send("Twiller backend is running successfully");
});
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});



const port = process.env.PORT || 5000;
const url = process.env.MONGO_URI;


mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

app.post("/register", async (req, res) => {
  try {
    const existinguser = await User.findOne({ email: req.body.email });
    if (existinguser) {
      return res.status(200).send(existinguser);
    }
    const newUser = new User(req.body);
    await newUser.save();
    return res.status(201).send(newUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

app.get("/loggedinuser", async (req, res) => {
  try {
    const { email } = req.query;
    const browser = req.headers["x-browser"]; 

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

  
  

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.patch("/userupdate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true, upsert: false }
    );
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

app.post("/post", async (req, res) => {
  try {
    const { author } = req.body;

    if (!author) {
      return res.status(400).json({ error: "Author missing" });
    }

    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    if (
      user.plan !== "free" &&
      user.planExpiresAt &&
      new Date() > user.planExpiresAt
    ) {
      await User.updateOne(
        { _id: user._id },
        {
          plan: "free",
          tweetsUsed: 0,
          planExpiresAt: null,
        }
      );
    }

    
    let allowedTweets = 1;
    if (user.plan === "bronze") allowedTweets = 3;
    if (user.plan === "silver") allowedTweets = 5;
    if (user.plan === "gold") allowedTweets = Infinity;

    if (user.tweetsUsed >= allowedTweets) {
      return res.status(403).json({
        error: `Tweet limit reached for ${user.plan} plan`,
      });
    }

    
    const tweet = new Tweet(req.body);
    await tweet.save();

  
    await User.updateOne(
      { _id: user._id },
      { $inc: { tweetsUsed: 1 } }
    );

    return res.status(201).json(tweet);
  } catch (error) {
    console.error("POST TWEET ERROR:", error);
    return res.status(400).json({ error: error.message });
  }
});




app.get("/post", async (req, res) => {
  try {
    const tweet = await Tweet.find().sort({ timestamp: -1 }).populate("author");
    return res.status(200).send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});


app.post("/like/:tweetid", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId missing" });
    }

    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const alreadyLiked = tweet.likedBy.some(
      (id) => id.equals(userObjectId)
    );

    if (!alreadyLiked) {
      tweet.likes += 1;
      tweet.likedBy.push(userObjectId);
      await tweet.save();
    }

    res.status(200).json(tweet);
  } catch (error) {
    console.error("LIKE ERROR:", error);
    res.status(400).json({ error: error.message });
  }
});








app.post("/retweet/:tweetid", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId missing" });
    }

    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const alreadyRetweeted = tweet.retweetedBy.some(
      (id) => id.equals(userObjectId)
    );

    if (!alreadyRetweeted) {
      tweet.retweets += 1;
      tweet.retweetedBy.push(userObjectId);
      await tweet.save();
    }

    res.status(200).json(tweet);
  } catch (error) {
    console.error("RETWEET ERROR:", error);
    res.status(400).json({ error: error.message });
  }
});



