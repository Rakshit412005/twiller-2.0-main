import axiosInstance from "@/lib/axiosInstance";

export const requestLanguageOtp = async (
  email: string,
  language: string
) => {
  await axiosInstance.post("/api/language/request", {
    email,
    language,
  });
};

export const verifyLanguageOtp = async (
  email: string,
  otp: string
): Promise<string> => {
  const res = await axiosInstance.post("/api/language/verify", {
    email,
    otp,
  });

  return res.data.language;
};
