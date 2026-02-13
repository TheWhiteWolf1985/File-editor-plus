import { apiGetBackup, apiPostHaAction } from "../../services/api";
import { t } from "../../i18n";

const getBackupFilenameFromHeader = (res: Response) => {
  const header = res.headers.get("content-disposition") || "";
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const match = header.match(/filename=\"?([^\";]+)\"?/i);
  return match?.[1] || null;
};

const defaultBackupFilename = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `config-backup-${stamp}.zip`;
};

const triggerBackupDownload = (apiBase: string) => {
  const url = `${apiBase}api/backup?ts=${Date.now()}`;
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.rel = "noopener";
  document.documentElement.appendChild(link);
  link.click();
  link.remove();
};

export async function runSystemAction(this: any, action: string, label: string, confirm: boolean) {
  if (this.systemActionLoading) return;
  if (confirm) {
    const ok = window.confirm(t("system.confirm.action", { label }));
    if (!ok) return;
  }
  this.systemActionLoading = true;
  this.systemActionPending = action;
  try {
    const res = await apiPostHaAction(this.apiBase, action);
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    if (!res.ok || payload?.ok !== true) {
      const msg = payload?.error?.message || payload?.detail || `Errore azione (HTTP ${res.status})`;
      this.showToast(msg, "error");
      return;
    }
    this.showToast(t("system.toast.action_started", { label }));
  } catch {
    this.showToast(t("system.toast.call_error"), "error");
  } finally {
    this.systemActionLoading = false;
    this.systemActionPending = null;
  }
}

export async function runBackup(this: any, mode: "download" | "saveas" | "cloud") {
  if (this.backupLoading) return;
  if (mode === "cloud") {
    this.showToast(t("system.toast.cloud_coming_soon"), "info");
    return;
  }
  this.backupLoading = true;
  this.backupMode = mode;
  try {
    if (mode === "download") {
      triggerBackupDownload(this.apiBase);
      this.showToast(t("system.toast.download_started"));
      return;
    }
    const picker = (window as unknown as { showSaveFilePicker?: Function }).showSaveFilePicker;
    if (!picker) {
      this.showToast(t("system.toast.save_not_supported"), "info");
      triggerBackupDownload(this.apiBase);
      return;
    }
    const res = await apiGetBackup(this.apiBase);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg = text || `Errore backup (HTTP ${res.status})`;
      this.showToast(msg, "error");
      return;
    }
    const blob = await res.blob();
    const filename = getBackupFilenameFromHeader(res) || defaultBackupFilename();
    const handle = await picker({
      suggestedName: filename,
      types: [{ description: t("labels.zip"), accept: { "application/zip": [".zip"] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    this.showToast(t("system.toast.saved"));
  } catch (e: any) {
    if (e?.name === "AbortError") {
      this.showToast(t("system.toast.save_cancelled"), "info");
    } else {
      this.showToast(t("system.toast.backup_error"), "error");
    }
  } finally {
    this.backupLoading = false;
    this.backupMode = null;
  }
}
