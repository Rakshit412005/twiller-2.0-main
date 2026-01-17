import nodemailer from "nodemailer";
export const sendLoginOtpMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Twiller Security" <${process.env.EMAIL_USER}>`,
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
