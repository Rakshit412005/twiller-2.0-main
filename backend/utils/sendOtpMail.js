import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

export const sendEmailOtp = async (email, otp) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  await apiInstance.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME,
    },
    to: [{ email }],
    subject: "Language Change OTP",
    htmlContent: `
      <h2>Language Verification</h2>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  });
};
