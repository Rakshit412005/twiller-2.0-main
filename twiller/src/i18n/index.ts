import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLang =
  typeof window !== "undefined"
    ? localStorage.getItem("lang") || "en"
    : "en";

import en from "./locales/en/common.json";
import fr from "./locales/fr/common.json";
import hi from "./locales/hi/common.json";
import es from "./locales/es/common.json";
import pt from "./locales/pt/common.json";
import zh from "./locales/zh/common.json";

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: "en",
  resources: {
    en: { common: en },
    fr: { common: fr },
    hi: { common: hi },
    es: { common: es },
    pt: { common: pt },
    zh: { common: zh },
  },
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});


export default i18n;
