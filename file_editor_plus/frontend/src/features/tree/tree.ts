import { html, nothing } from "lit";
import type { TreeItem } from "../../types/editor";
import { apiCreateFile, apiCreateFolder, apiGetTree, apiTreeCopy, apiTreeDelete } from "../../services/api";

const getCopyName = (path: string, type: "file" | "dir") => {
  const name = path.split("/").pop() || path;
  if (type === "dir") {
    return `${name}_copy`;
  }
  const dot = name.lastIndexOf(".");
  if (dot > 0) {
    const base = name.slice(0, dot);
    const ext = name.slice(dot);
    return `${base}_copy${ext}`;
  }
  return `${name}_copy`;
};

const closeTabsForDeletedPath = (host: any, path: string, type: "file" | "dir") => {
  if (type === "file") {
    host.closeTab(path);
    return;
  }
  const prefix = path.endsWith("/") ? path : `${path}/`;
  const affected = host.tabs.filter((t: { path: string }) => t.path === path || t.path.startsWith(prefix));
  if (affected.length === 0) return;
  affected.forEach((t: { path: string }) => host.closeTab(t.path));
};

export async function loadTree(this: any, path: string, force = false) {
  if ((!force && this.loadedPaths.has(path)) || this.loadingPaths.has(path)) {
    return;
  }
  this.loadingPaths.add(path);

  try {
    this.status = "Loading tree...";
    const res = await apiGetTree(this.apiBase, path);
    if (!res.ok) {
      throw new Error(`tree ${res.status}`);
    }
    const data = await res.json();
    const key = (data && typeof data.path === "string" ? data.path : path) || "";
    const items = Array.isArray(data?.items) ? (data.items as TreeItem[]) : [];
    if (key === "") {
      this.rootItems = items;
    }
    this.treeData = { ...this.treeData, [key]: items };
    this.status = items.length === 0 ? "Nessun file" : "Ready";
  } catch (e) {
    this.status = "Errore caricamento tree";
  } finally {
    this.loadingPaths.delete(path);
    this.loadedPaths.add(path);
  }
}

export async function reloadTree(this: any, quiet = false) {
  const expandedPaths = Array.from(this.expanded).filter((p: string) => p !== "");
  this.loadedPaths.clear();
  this.loadingPaths.clear();
  this.treeData = {};
  this.rootItems = [];
  await this.loadTree("", true);
  for (const p of expandedPaths) {
    await this.loadTree(p, true);
  }
  if ("treeDirty" in this) {
    this.treeDirty = false;
  }
  if (!quiet) {
    this.showToast("Tree ricaricato");
  }
}

export async function toggleDir(this: any, path: string) {
  const s = new Set(this.expanded);
  const willExpand = !s.has(path);
  willExpand ? s.add(path) : s.delete(path);
  this.expanded = s;

  if (willExpand && !this.treeData[path]) {
    await this.loadTree(path);
  }
}

export function handleTreeContextMenu(this: any, e: MouseEvent, item: TreeItem) {
  e.preventDefault();
  e.stopPropagation();
  this.treeMenuOpen = true;
  this.treeMenuX = e.clientX;
  this.treeMenuY = e.clientY;
  this.treeMenuPath = item.path;
  this.treeMenuType = item.type;
  this.contextMenuOpen = false;
  this.openMenu = null;
  this.closeSuggestions();
}

export function closeTreeMenu(this: any) {
  if (this.treeMenuOpen) {
    this.treeMenuOpen = false;
  }
}

export function copyTreeItem(this: any) {
  if (!this.treeMenuPath || !this.treeMenuType) return;
  this.treeClipboard = { path: this.treeMenuPath, type: this.treeMenuType };
  this.showToast(`Copiato: ${this.treeMenuPath}`);
  this.closeTreeMenu();
}

export async function pasteTreeItem(this: any) {
  if (!this.treeClipboard || !this.treeMenuPath || !this.treeMenuType) return;
  const destDir =
    this.treeMenuType === "dir"
      ? this.treeMenuPath
      : this.treeMenuPath.includes("/")
        ? this.treeMenuPath.split("/").slice(0, -1).join("/")
        : "";
  const destName = getCopyName(this.treeClipboard.path, this.treeClipboard.type);
  try {
    const res = await apiTreeCopy(this.apiBase, {
      src: this.treeClipboard.path,
      dest_dir: destDir,
      dest_name: destName,
    });
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    if (!res.ok || payload?.ok !== true) {
      const msg = payload?.detail || payload?.error?.message || `Errore copia (HTTP ${res.status})`;
      this.showToast(msg, "error");
      return;
    }
    const destPath = payload?.dest ? String(payload.dest) : destName;
    this.showToast(`Incollato: ${destPath}`);
    if (typeof this.notifyFsChanged === "function") {
      await this.notifyFsChanged();
    } else {
      await this.reloadTreePath(destDir);
    }
  } catch {
    this.showToast("Errore copia", "error");
  } finally {
    this.closeTreeMenu();
  }
}

export function confirmTreeDelete(this: any) {
  if (!this.treeMenuPath || !this.treeMenuType) return;
  this.deleteTargetPath = this.treeMenuPath;
  this.deleteTargetType = this.treeMenuType;
  this.showTreeDeleteModal = true;
  this.closeTreeMenu();
}

export function cancelTreeDelete(this: any) {
  this.showTreeDeleteModal = false;
  this.deleteTargetPath = null;
  this.deleteTargetType = null;
}

export async function executeTreeDelete(this: any) {
  if (!this.deleteTargetPath || !this.deleteTargetType) return;
  const target = this.deleteTargetPath;
  const parent = target.includes("/") ? target.split("/").slice(0, -1).join("/") : "";
  try {
    const res = await apiTreeDelete(this.apiBase, { path: target });
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    if (!res.ok || payload?.ok !== true) {
      const msg = payload?.detail || payload?.error?.message || `Errore eliminazione (HTTP ${res.status})`;
      this.showToast(msg, "error");
      return;
    }
    closeTabsForDeletedPath(this, target, this.deleteTargetType);
    this.showToast("Elemento eliminato");
    if (typeof this.notifyFsChanged === "function") {
      await this.notifyFsChanged();
    } else {
      await this.reloadTreePath(parent);
    }
  } catch {
    this.showToast("Errore eliminazione", "error");
  } finally {
    this.cancelTreeDelete();
  }
}

export async function reloadTreePath(this: any, path: string) {
  this.loadedPaths.delete(path);
  await this.loadTree(path, true);
  this.expanded = new Set(this.expanded).add(path);
}

export async function createNewItem(this: any) {
  if (!this.newItemKind) return;
  const dir = this.activePath && this.activePath.includes("/") ? this.activePath.split("/").slice(0, -1).join("/") : "";
  if (this.newItemKind === "file") {
    const base = this.newItemName.trim();
    const ext = this.newItemExt.trim();
    if (!base) {
      this.status = "Nome file richiesto";
      this.showToast("Nome file richiesto", "error");
      return;
    }
    const filename = ext ? `${base}.${ext.replace(/^\\./, "")}` : base;
    const target = dir ? `${dir}/${filename}` : filename;
    try {
      const parentItems =
        dir && dir !== ""
          ? this.treeData[dir] ?? []
          : this.rootItems.length > 0
            ? this.rootItems
            : this.treeData[""] ?? [];
      if (parentItems.some((it: TreeItem) => it.name === filename && it.type === "file")) {
        this.showToast("File already exist", "error");
        this.status = "File already exist";
        return;
      }
      const res = await apiCreateFile(this.apiBase, target);
      if (!res.ok) {
        const detailJson = await res.json().catch(() => null);
        const detailText = !detailJson ? await res.text().catch(() => "") : "";
        const msg =
          (detailJson && (detailJson.detail || detailJson.message)) ||
          detailText ||
          (res.status === 400 ? "File already exist" : "Errore creazione file");
        this.showToast(msg, "error");
        this.status = msg;
        return;
      }
      const nextExpanded = new Set(this.expanded);
      if (dir !== null) {
        nextExpanded.add(dir);
        this.expanded = nextExpanded;
      }
      this.newItemKind = null;
      if (typeof this.notifyFsChanged === "function") {
        await this.notifyFsChanged();
      }
      this.openFile(target);
    } catch (e) {
      this.status = "Errore creazione file";
      this.showToast("Errore creazione file", "error");
    }
  } else if (this.newItemKind === "folder") {
    const base = this.newItemName.trim();
    if (!base) {
      this.status = "Nome cartella richiesto";
      this.showToast("Nome cartella richiesta", "error");
      return;
    }
    const parentItems =
      dir && dir !== ""
        ? this.treeData[dir] ?? []
        : this.rootItems.length > 0
          ? this.rootItems
          : this.treeData[""] ?? [];
    if (parentItems.some((it: TreeItem) => it.name === base && it.type === "dir")) {
      const msg = "Folder already exist";
      this.showToast(msg, "error");
      this.status = msg;
      return;
    }
    const target = dir ? `${dir}/${base}` : base;
    try {
      const res = await apiCreateFolder(this.apiBase, target);
      if (!res.ok) {
        const detailJson = await res.json().catch(() => null);
        const detailText = !detailJson ? await res.text().catch(() => "") : "";
        const msg =
          (detailJson && (detailJson.detail || detailJson.message)) ||
          detailText ||
          (res.status === 400 ? "Folder already exist" : "Cartella esiste già o errore");
        this.showToast(msg, "error");
        this.status = msg;
        return;
      }
      const nextExpanded = new Set(this.expanded);
      nextExpanded.add(target);
      this.expanded = nextExpanded;
      this.newItemKind = null;
      if (typeof this.notifyFsChanged === "function") {
        await this.notifyFsChanged();
      }
    } catch (e) {
      this.status = "Errore creazione cartella";
      this.showToast("Errore creazione cartella", "error");
    }
  }
}

export function cancelNewItem(this: any) {
  this.newItemKind = null;
  this.newItemName = "";
  this.newItemExt = "";
}

export function renderTree(this: any, path: string, depth = 0) {
  const items =
    path === ""
      ? this.rootItems.length > 0
        ? this.rootItems
        : this.treeData[""] ?? []
      : this.treeData[path] ?? [];
  return items.map((it: TreeItem) => {
    const isDir = it.type === "dir";
    const isExpanded = isDir && this.expanded.has(it.path);
    const active = this.activePath === it.path;

    return html`
      <div
        class="treeRow ${active ? "active" : ""}"
        style="padding-left:${8 + depth * 14}px"
        @click=${() => {
          if (isDir) this.toggleDir(it.path);
          else this.requestOpenFile(it.path);
        }}
        @contextmenu=${(e: MouseEvent) => this.handleTreeContextMenu(e, it)}
      >
        <span class="twisty">${isDir ? (isExpanded ? "▾" : "▸") : ""}</span>
        <span>${isDir ? "📁" : "📄"}</span>
        <span class=${isDir ? "" : "muted"}>${it.name}</span>
      </div>

      ${isDir && isExpanded
        ? html`<div>${this.renderTree(it.path, depth + 1)}</div>`
        : nothing}
    `;
  });
}
