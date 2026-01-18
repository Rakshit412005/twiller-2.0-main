import mongoose from "mongoose";

const TweetSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  image: { type: String, default: null },
  audio: { type: String, default: null }, 
  likes: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  retweetedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [], 
  },
});


export default mongoose.model("Tweet", TweetSchema);
