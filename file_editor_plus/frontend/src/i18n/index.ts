export type Locale = "it" | "en" | "de" | "fr" | "es";
export type SupportedLocaleCode = Locale;

let currentLocale: Locale = "it";
let dict: any = {};
const STORAGE_KEY = "locale";

const LOCALE_LOADERS: Record<Locale, () => Promise<any>> = {
  it: () => import("./it.json"),
  en: () => import("./en.json"),
  de: () => import("./de.json"),
  fr: () => import("./fr.json"),
  es: () => import("./es.json"),
};

const isLocale = (value: string | null): value is Locale =>
  value === "it" || value === "en" || value === "de" || value === "fr" || value === "es";

const isLocaleCode = (value: unknown): value is Locale =>
  value === "it" || value === "en" || value === "de" || value === "fr" || value === "es";

export function validateLocale(d: any) {
  const lang = d?.meta?.language;
  const version = d?.meta?.version;
  const ok = isLocaleCode(lang) && Number.isFinite(version);
  if (!ok) {
    if (import.meta.env.DEV) {
      console.warn("Invalid locale dictionary meta", { language: lang, version });
    }
    return {};
  }
  return d;
}

const deepMerge = (base: any, override: any): any => {
  if (!base || typeof base !== "object" || Array.isArray(base)) return override;
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const out: Record<string, any> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const prev = out[key];
    out[key] = deepMerge(prev, value);
  }
  return out;
};

export function getPersistedLocale(): Locale {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(raw) ? raw : "it";
  } catch {
    return "it";
  }
};

export function setLocale(l: Locale) {
  currentLocale = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent("i18n-changed", { detail: { locale: l } }));
}

export function getLocale(): Locale {
  return currentLocale;
}

export async function loadLocale(l: Locale) {
  const baseMod = await LOCALE_LOADERS.it();
  const baseDict = validateLocale(baseMod.default ?? {});
  if (l === "it") {
    dict = baseDict;
    currentLocale = l;
    return;
  }
  try {
    const mod = await LOCALE_LOADERS[l]();
    dict = deepMerge(baseDict, validateLocale(mod.default ?? {}));
  } catch {
    dict = baseDict;
  }
  currentLocale = l;
}

export function t(key: string, params?: Record<string, string | number>) {
  const value = key.split(".").reduce<any>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return acc[part];
    }
    return undefined;
  }, dict);

  if (typeof value !== "string") {
    if (import.meta.env.DEV) {
      console.warn("Missing i18n key", key);
    }
    return key;
  }

  if (!params) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_match, token: string) => {
    const replacement = params[token];
    return replacement === undefined ? `{${token}}` : String(replacement);
  });
}

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
