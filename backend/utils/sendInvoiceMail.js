import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvoiceMail = async ({
  email,
  name,
  plan,
  amount,
  paymentId,
  expiryDate,
}) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Twiller Subscription Invoice",
    html: `
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
    `,
  });
};
