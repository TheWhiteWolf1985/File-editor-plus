import { apiGetUserConfig, apiPutUserConfig } from "../../services/api";
import { THEME_MODES } from "../../constants";
import type { ThemeMode, UserConfig } from "../../types/api";

const getEffectiveTheme = (mode: ThemeMode, media: MediaQueryList | null): "dark" | "light" => {
  if (mode === "auto") {
    const prefersDark = media ? media.matches : true;
    return prefersDark ? "dark" : "light";
  }
  return mode;
};

const clampFontBase = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const applyFontScale = (host: any, baseRem: number) => {
  const scale = baseRem / host.fontDefaults.base;
  const toRem = (val: number) => `${(val * scale).toFixed(4)}rem`;
  host.style.setProperty("--font-size-xs", toRem(host.fontDefaults.xs));
  host.style.setProperty("--font-size-sm", toRem(host.fontDefaults.sm));
  host.style.setProperty("--font-size-md", toRem(host.fontDefaults.md));
  host.style.setProperty("--font-size-base", `${baseRem.toFixed(4)}rem`);
  host.style.setProperty("--font-size-lg", toRem(host.fontDefaults.lg));
};

export function handleThemeChange(this: any) {
  if (this.themeMode === "auto") {
    this.applyTheme();
  }
}

export async function cycleTheme(this: any) {
  const next = this.themeMode === "auto" ? "light" : this.themeMode === "light" ? "dark" : "auto";
  this.themeMode = next;
  this.applyTheme();
  const ok = await this.persistUserConfig({ theme_mode: this.themeMode });
  if (!ok) {
    this.showToast("Errore salvataggio tema", "error");
  }
}

export function applyTheme(this: any) {
  const theme = getEffectiveTheme(this.themeMode, this.themeMedia);
  const palette =
    theme === "dark"
      ? {
          "--bg-color": "#1e1e1e",
          "--panel-color": "#252526",
          "--panel-strong": "#2d2d2d",
          "--border-color": "#2a2a2a",
          "--hover-color": "#3a3a3a",
          "--text-color": "#d4d4d4",
          "--muted-color": "#c8c8c8",
          "--activity-color": "#333333",
          "--accent-color": "#0e639c",
          "--accent-hover": "#1177bb",
          "--card-color": "#1f1f1f",
          "--input-bg": "#1e1e1e",
          "--toast-bg": "#2d2d2d",
          "--toast-border": "#3a3a3a",
          "--error-bg": "#3a1f1f",
          "--error-border": "#c74c4c",
          "--status-bg": "#007acc",
          "--gutter-bg": "#1a1a1a",
          "--code-bg": "#1e1e1e",
          "--tree-hover": "#2a2d2e",
          "--tree-active": "#37373d",
          "--entity-error-text": "#f6dada",
        }
      : {
          "--bg-color": "#f5f6f8",
          "--panel-color": "#ffffff",
          "--panel-strong": "#f1f1f3",
          "--border-color": "#d1d5db",
          "--hover-color": "#e5e7eb",
          "--text-color": "#1f2937",
          "--muted-color": "#4b5563",
          "--activity-color": "#f3f4f6",
          "--accent-color": "#0d6efd",
          "--accent-hover": "#0b5ed7",
          "--card-color": "#ffffff",
          "--input-bg": "#ffffff",
          "--toast-bg": "#ffffff",
          "--toast-border": "#d1d5db",
          "--error-bg": "#ffecec",
          "--error-border": "#d9534f",
          "--status-bg": "#0d6efd",
          "--gutter-bg": "#f3f4f6",
          "--code-bg": "#ffffff",
          "--tree-hover": "#e8eef8",
          "--tree-active": "#d9e6fb",
          "--entity-error-text": "#8b1f1f",
        };
  Object.entries(palette).forEach(([key, value]) => {
    this.style.setProperty(key, value);
  });
}

export async function persistUserConfig(this: any, config: UserConfig) {
  const payload = {
    font_base_rem: config.font_base_rem ?? this.fontBaseRem,
    theme_mode: config.theme_mode ?? this.themeMode,
  };
  try {
    const res = await apiPutUserConfig(this.apiBase, payload);
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return res.ok && data?.ok === true;
  } catch {
    return false;
  }
}

export async function loadFontSettings(this: any) {
  try {
    const res = await apiGetUserConfig(this.apiBase);
    if (res.ok) {
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      const cfg = (payload?.config ?? payload ?? {}) as UserConfig;
      const raw = Number(cfg.font_base_rem);
      if (!Number.isNaN(raw)) {
        this.fontBaseRem = clampFontBase(raw, this.fontBaseMin, this.fontBaseMax);
      }
      const mode = cfg.theme_mode;
      if (THEME_MODES.includes(mode as ThemeMode)) {
        this.themeMode = mode as ThemeMode;
      }
    }
  } catch {
    /* ignore load errors */
  }
  this.settingsFontBaseRem = this.fontBaseRem;
  applyFontScale(this, this.fontBaseRem);
  this.applyTheme();
}

export function openSettingsModal(this: any) {
  this.settingsTab = "appearance";
  this.settingsFontBaseRem = this.fontBaseRem;
  this.showSettingsModal = true;
}

export function cancelSettingsModal(this: any) {
  applyFontScale(this, this.fontBaseRem);
  this.settingsFontBaseRem = this.fontBaseRem;
  this.showSettingsModal = false;
}

export async function applySettingsModal(this: any) {
  const next = this.settingsFontBaseRem;
  try {
    const ok = await this.persistUserConfig({ font_base_rem: next });
    if (!ok) {
      throw new Error("save-failed");
    }
  } catch {
    applyFontScale(this, this.fontBaseRem);
    this.settingsFontBaseRem = this.fontBaseRem;
    this.showToast("Errore salvataggio impostazioni", "error");
    return;
  }
  this.fontBaseRem = next;
  applyFontScale(this, this.fontBaseRem);
  this.showSettingsModal = false;
  this.showToast("Impostazioni applicate");
}

export function handleFontSizeInput(this: any, e: Event) {
  const raw = Number((e.target as HTMLInputElement).value);
  const next = clampFontBase(raw, this.fontBaseMin, this.fontBaseMax);
  this.settingsFontBaseRem = next;
  applyFontScale(this, next);
}
