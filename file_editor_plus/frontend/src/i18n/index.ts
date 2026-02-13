export type SupportedLocaleCode = "it" | "en" | "de" | "fr" | "es";

export type SupportedLocale = {
  code: SupportedLocaleCode;
  label: string;
  badge: string;
};

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: "it", label: "Italiano", badge: "IT" },
  { code: "en", label: "English", badge: "EN" },
  { code: "de", label: "Deutsch", badge: "DE" },
  { code: "fr", label: "Français", badge: "FR" },
  { code: "es", label: "Español", badge: "ES" },
];
