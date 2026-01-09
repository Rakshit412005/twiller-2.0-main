import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,     // MUST BE STRING
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
