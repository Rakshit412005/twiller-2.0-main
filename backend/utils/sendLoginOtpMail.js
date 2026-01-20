import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendLoginOtpMail = async (email, otp) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Login Verification OTP",
    html: `
      <h2>Login Verification</h2>
      <p>We detected a login from a new browser.</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  });
};
