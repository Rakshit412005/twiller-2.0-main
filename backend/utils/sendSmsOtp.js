import twilio from "twilio";

export const sendSmsOtp = async (phone, otp) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
    process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio environment variables missing");
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your language change OTP is ${otp}`,
    from: TWILIO_PHONE_NUMBER,
    to: phone,
  });
};
