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
          "--accent-color": "#14b8a6",
          "--accent-hover": "#0d9488",
          "--accent-active": "#0f766e",
          "--accent-light": "#5eead4",
          "--accent-subtle": "rgba(20, 184, 166, 0.1)",
          "--dark-bg-primary": "#0a0a0a",
          "--dark-bg-secondary": "#141414",
          "--dark-bg-tertiary": "#1a1a1a",
          "--dark-border": "rgba(255, 255, 255, 0.08)",
          "--dark-text-primary": "#e5e7eb",
          "--dark-text-secondary": "#9ca3af",
          "--dark-text-tertiary": "#6b7280",
          "--light-bg-primary": "#f8f9fa",
          "--light-bg-secondary": "#f3f4f6",
          "--light-bg-tertiary": "#fafafa",
          "--light-border": "rgba(0, 0, 0, 0.08)",
          "--light-border-strong": "rgba(0, 0, 0, 0.18)",
          "--light-text-primary": "#1f2937",
          "--light-text-secondary": "#4b5563",
          "--light-text-tertiary": "#9ca3af",
          "--glass-blur": "24px",
          "--bg-color": "#0a0a0a",
          "--panel-color": "#141414",
          "--panel-strong": "#1a1a1a",
          "--border-color": "rgba(255, 255, 255, 0.08)",
          "--hover-color": "rgba(255, 255, 255, 0.06)",
          "--text-color": "#e5e7eb",
          "--muted-color": "#9ca3af",
          "--overlay-surface": "#141414",
          "--overlay-surface-strong": "#1a1a1a",
          "--overlay-border": "rgba(255, 255, 255, 0.08)",
          "--overlay-muted": "#9ca3af",
          "--activity-color": "#141414",
          "--card-color": "#1a1a1a",
          "--input-bg": "#0a0a0a",
          "--toast-bg": "#1a1a1a",
          "--toast-border": "rgba(255, 255, 255, 0.08)",
          "--error-bg": "#3a1f1f",
          "--error-border": "#c74c4c",
          "--status-bg": "#0f766e",
          "--gutter-bg": "#141414",
          "--code-bg": "#0a0a0a",
          "--tree-hover": "rgba(255, 255, 255, 0.05)",
          "--tree-active": "rgba(20, 184, 166, 0.15)",
          "--entity-error-text": "#f6dada",
          "--editor-caret": "#14b8a6",
          "--editor-selection-bg": "rgba(20, 184, 166, 0.28)",
          "--token-key-color": "#5eead4",
          "--indent-guide": "rgba(255, 255, 255, 0.2)",
          "--indent-guide-active": "rgba(255, 255, 255, 0.4)",
          "--tab-bg": "#0f0f0f",
          "--tab-active-bg": "#1a1a1a",
          "--tab-active-border": "rgba(255, 255, 255, 0.08)",
        }
      : {
          "--accent-color": "#14b8a6",
          "--accent-hover": "#0d9488",
          "--accent-active": "#0f766e",
          "--accent-light": "#5eead4",
          "--accent-subtle": "rgba(20, 184, 166, 0.1)",
          "--dark-bg-primary": "#0a0a0a",
          "--dark-bg-secondary": "#141414",
          "--dark-bg-tertiary": "#1a1a1a",
          "--dark-border": "rgba(255, 255, 255, 0.08)",
          "--dark-text-primary": "#e5e7eb",
          "--dark-text-secondary": "#9ca3af",
          "--dark-text-tertiary": "#6b7280",
          "--light-bg-primary": "#f8f9fa",
          "--light-bg-secondary": "#f3f4f6",
          "--light-bg-tertiary": "#fafafa",
          "--light-border": "rgba(0, 0, 0, 0.08)",
          "--light-border-strong": "rgba(0, 0, 0, 0.18)",
          "--light-text-primary": "#1f2937",
          "--light-text-secondary": "#4b5563",
          "--light-text-tertiary": "#9ca3af",
          "--glass-blur": "24px",
          "--bg-color": "#f8f9fa",
          "--panel-color": "#f3f4f6",
          "--panel-strong": "#fafafa",
          "--border-color": "rgba(0, 0, 0, 0.18)",
          "--hover-color": "rgba(0, 0, 0, 0.04)",
          "--text-color": "#1f2937",
          "--muted-color": "#4b5563",
          "--overlay-surface": "#f3f4f6",
          "--overlay-surface-strong": "#fafafa",
          "--overlay-border": "rgba(0, 0, 0, 0.18)",
          "--overlay-muted": "#4b5563",
          "--activity-color": "#f3f4f6",
          "--card-color": "#fafafa",
          "--input-bg": "#f8f9fa",
          "--toast-bg": "#fafafa",
          "--toast-border": "rgba(0, 0, 0, 0.08)",
          "--error-bg": "#ffecec",
          "--error-border": "#d9534f",
          "--status-bg": "#0d9488",
          "--gutter-bg": "#f3f4f6",
          "--code-bg": "#fafafa",
          "--tree-hover": "rgba(0, 0, 0, 0.03)",
          "--tree-active": "rgba(20, 184, 166, 0.1)",
          "--entity-error-text": "#8b1f1f",
          "--editor-caret": "#0d9488",
          "--editor-selection-bg": "rgba(20, 184, 166, 0.18)",
          "--token-key-color": "#0f766e",
          "--indent-guide": "rgba(0, 0, 0, 0.06)",
          "--indent-guide-active": "rgba(0, 0, 0, 0.16)",
          "--tab-bg": "#f3f4f6",
          "--tab-active-bg": "#fafafa",
          "--tab-active-border": "rgba(0, 0, 0, 0.08)",
        };
  Object.entries(palette).forEach(([key, value]) => {
    this.style.setProperty(key, value);
  });
}

export async function persistUserConfig(this: any, config: UserConfig) {
  const payload = {
    font_base_rem: config.font_base_rem ?? this.fontBaseRem,
    theme_mode: config.theme_mode ?? this.themeMode,
    toolbar_visible: config.toolbar_visible ?? this.toolbarVisible,
    show_indent_guides: config.show_indent_guides ?? this.showIndentGuides,
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
      if (typeof cfg.toolbar_visible === "boolean") {
        this.toolbarVisible = cfg.toolbar_visible;
      }
      if (typeof cfg.show_indent_guides === "boolean") {
        this.showIndentGuides = cfg.show_indent_guides;
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
