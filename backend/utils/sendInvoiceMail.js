import nodemailer from "nodemailer";

export const sendInvoiceMail = async ({
  email,
  name,
  plan,
  amount,
  paymentId,
  expiryDate,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <h2>🧾 Payment Invoice - Twiller</h2>
    <p>Hello <b>${name}</b>,</p>

    <p>Your subscription payment was successful 🎉</p>

    <table border="1" cellpadding="10" cellspacing="0">
      <tr><td><b>Plan</b></td><td>${plan.toUpperCase()}</td></tr>
      <tr><td><b>Amount Paid</b></td><td>₹${amount}</td></tr>
      <tr><td><b>Payment ID</b></td><td>${paymentId}</td></tr>
      <tr><td><b>Valid Till</b></td><td>${expiryDate.toDateString()}</td></tr>
    </table>

    <p>Thank you for subscribing to <b>Twiller Premium</b> 🚀</p>
    <p>— Team Twiller</p>
  `;

  await transporter.sendMail({
    from: `"Twiller Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Twiller Subscription Invoice",
    html,
  });
};
