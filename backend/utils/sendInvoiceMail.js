import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

export const sendInvoiceMail = async ({
  email,
  name,
  plan,
  amount,
  paymentId,
  expiryDate,
}) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  await apiInstance.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: "Twiller Billing",
    },
    to: [{ email }],
    subject: "Twiller Subscription Invoice",
    htmlContent: `
      <h2>🧾 Payment Invoice - Twiller</h2>
      <p>Hello <b>${name}</b>,</p>

      <table border="1" cellpadding="10">
        <tr><td>Plan</td><td>${plan}</td></tr>
        <tr><td>Amount</td><td>₹${amount}</td></tr>
        <tr><td>Payment ID</td><td>${paymentId}</td></tr>
        <tr><td>Valid Till</td><td>${expiryDate.toDateString()}</td></tr>
      </table>

      <p>Thank you for subscribing 🚀</p>
    `,
  });
};
