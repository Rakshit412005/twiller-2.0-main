"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const handleChange = async (lang: string) => {
    // OTP logic will go here later
    await i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-gray-900 rounded-full text-xl"
        >
          <Globe className="mr-2 h-4 w-4 " />
          {t("language")}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        className="bg-black border border-gray-800"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className="text-white hover:bg-gray-900"
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
