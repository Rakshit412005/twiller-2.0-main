// import dotenv from "dotenv";
// dotenv.config();


// import twilio from "twilio";

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const sendTestSms = async () => {
//   try {
//     const msg = await client.messages.create({
//       body: "✅ Twilio SMS test successful. OTP system ready.",
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: "+918535071013", // 🔴 PUT YOUR REAL MOBILE NUMBER WITH COUNTRY CODE
//     });

//     console.log("SMS sent:", msg.sid);
//   } catch (err) {
//     console.error("SMS failed:", err.message);
//   }
//   console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
//   console.log("FROM:", process.env.TWILIO_PHONE_NUMBER);

// };

// sendTestSms();
