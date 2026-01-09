import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import User from "../models/user.js";
import { PLANS } from "../config/plans.js";
import { sendInvoiceMail } from "../utils/sendInvoiceMail.js";


const router = express.Router();


const isValidPaymentTime = () => {
  const now = new Date();

  const hour = new Date().getHours();

  // Allow payments from 10 AM (10) to 11 PM (23)
  return hour >= 10 && hour < 23;
};



router.post("/create-order", async (req, res) => {
  try {
    console.log("CREATE ORDER HIT");
    console.log("BODY:", req.body);

    if (!isValidPaymentTime()) {
      console.log(" BLOCKED BY TIME");
      return res.status(403).json({
        error: "Payments allowed only between 10 AM – 11 PM IST",
      });
    }

    const { plan, userId } = req.body;
    console.log("PLAN RECEIVED:", plan);
    console.log("USER ID:", userId);

    const planData = PLANS[plan];
    console.log("PLAN DATA:", planData);

    if (!planData || planData.price === 0) {
      console.log(" INVALID PLAN");
      return res.status(400).json({ error: "Invalid plan" });
    }

    const order = await razorpay.orders.create({
      amount: planData.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error(" CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});



router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      userId,
    } = req.body;

    // 1️⃣ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // 2️⃣ Get plan details
    const planData = PLANS[plan];
    if (!planData) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    // 3️⃣ Update user subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan,
        tweetsUsed: 0,
        planExpiresAt: expiryDate,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4️⃣ 📧 SEND INVOICE EMAIL
    await sendInvoiceMail({
      email: user.email,
      username: user.username,
      plan,
      amount: planData.price,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      expiryDate,
    });

    // 5️⃣ Success response
    res.json({
      success: true,
      message: "Payment successful & invoice sent",
      user,
    });

  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});


export default router;
