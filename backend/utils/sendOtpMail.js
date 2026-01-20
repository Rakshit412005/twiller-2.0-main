import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailOtp = async (email, otp) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Language Change OTP",
    html: `
      <h2>Language Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  });
};
