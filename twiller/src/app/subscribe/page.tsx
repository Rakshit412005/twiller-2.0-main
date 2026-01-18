"use client";

import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { toast } from "react-toastify";

const plans = [
  { key: "bronze", name: "Bronze", price: 100, tweets: 3 },
  { key: "silver", name: "Silver", price: 300, tweets: 5 },
  { key: "gold", name: "Gold", price: 1000, tweets: "Unlimited" },
];

export default function SubscribePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: string) => {
    if (!user?._id) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);

      
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const orderRes = await axiosInstance.post("/api/payment/create-order", {
        plan,
        userId: user._id,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "X Clone Premium",
        description: `Subscription for ${plan}`,
        order_id: orderRes.data.id,

        handler: async function (response: any) {
          await axiosInstance.post("/api/payment/verify", {
            ...response,
            plan,
            userId: user._id,
          });

          toast.success("Subscription successful 🎉");
        },

        theme: { color: "#1D9BF0" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Choose a Plan</h1>

      {plans.map((plan) => (
        <div
          key={plan.key}
          className="border border-gray-700 rounded-xl p-6 w-80 text-center"
        >
          <h2 className="text-xl font-semibold">{plan.name}</h2>
          <p className="text-gray-400 mt-2">
            ₹{plan.price} / month — {plan.tweets} tweets
          </p>

          <Button
            className="mt-4 w-full"
            disabled={loading}
            onClick={() => handleSubscribe(plan.key)}
          >
            Subscribe
          </Button>
        </div>
      ))}
    </div>
  );
}
