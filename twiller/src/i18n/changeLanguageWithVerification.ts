import i18n from "i18next";

/**
 * DO NOT change language directly anywhere else
 * Always use this function
 */
export const changeLanguageSafely = async (
  lang: string,
  verifyFn: () => Promise<boolean>
) => {
  const verified = await verifyFn();

  if (!verified) {
    throw new Error("Verification failed");
  }

  await i18n.changeLanguage(lang);
  localStorage.setItem("lang", lang);
};
