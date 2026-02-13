import { html, nothing } from "lit";
import type { TreeItem } from "../../types/editor";
import { apiCreateFile, apiCreateFolder, apiGetTree, apiTreeCopy, apiTreeDelete } from "../../services/api";
import { t } from "../../i18n";

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
    this.status = t("tree.status.loading");
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
    this.status = items.length === 0 ? t("tree.status.empty") : t("status.ready");
  } catch (e) {
    this.status = t("tree.status.error_loading");
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
    this.showToast(t("tree.toast.reloaded"));
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
  this.treeMenuFromBlank = false;
  this.contextMenuOpen = false;
  this.openMenu = null;
  this.closeSuggestions();
}

export function closeTreeMenu(this: any) {
  if (this.treeMenuOpen) {
    this.treeMenuOpen = false;
  }
}

export function handleTreeDragStart(this: any, e: DragEvent, item: TreeItem) {
  if (!e.dataTransfer) return;
  e.dataTransfer.setData("application/json", JSON.stringify({ path: item.path, isDir: item.type === "dir" }));
  e.dataTransfer.effectAllowed = "move";
  this.draggingPath = item.path;
  this.draggingType = item.type;
}

export function handleTreeDragOver(this: any, e: DragEvent, item: TreeItem) {
  if (item.type !== "dir" || item.writable === false) {
    this.dropTargetPath = null;
    return;
  }
  e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  this.dropTargetPath = item.path || "/";
}

export function handleTreeDragLeave(this: any, e: DragEvent, item: TreeItem) {
  if (this.dropTargetPath === (item.path || "/")) {
    this.dropTargetPath = null;
  }
}

export function handleTreeDrop(this: any, e: DragEvent, item: TreeItem) {
  if (item.type !== "dir") return;
  e.preventDefault();
  if (item.writable === false) {
    this.showToast(t("tree.toast.readonly_folder"), "error");
    return;
  }
  let payload: { path?: string; isDir?: boolean } | null = null;
  try {
    payload = e.dataTransfer?.getData("application/json") ? JSON.parse(e.dataTransfer.getData("application/json")) : null;
  } catch {
    payload = null;
  }
  const src = payload?.path || this.draggingPath;
  const srcType = payload?.isDir ? "dir" : this.draggingType;
  this.dropTargetPath = null;
  if (!src) return;
  const dstDir = item.path || "/";
  if (srcType === "dir" && (dstDir === src || dstDir.startsWith(src + "/"))) {
    this.showToast(t("tree.toast.invalid_move_self"), "error");
    return;
  }
  this.queueMove(src, dstDir);
}

export function handleTreeRootDragOver(this: any, e: DragEvent) {
  // drop on blank/root
  if (e.target && (e.target as HTMLElement).closest(".treeRow")) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  this.dropTargetPath = "/";
}

export function handleTreeRootDrop(this: any, e: DragEvent) {
  if (e.target && (e.target as HTMLElement).closest(".treeRow")) return;
  e.preventDefault();
  let payload: { path?: string; isDir?: boolean } | null = null;
  try {
    payload = e.dataTransfer?.getData("application/json") ? JSON.parse(e.dataTransfer.getData("application/json")) : null;
  } catch {
    payload = null;
  }
  const src = payload?.path || this.draggingPath;
  const srcType = payload?.isDir ? "dir" : this.draggingType;
  this.dropTargetPath = null;
  if (!src) return;
  const dstDir = "/";
  if (srcType === "dir" && (dstDir === src || dstDir.startsWith(src + "/"))) {
    this.showToast(t("tree.toast.invalid_move_self"), "error");
    return;
  }
  this.queueMove(src, dstDir);
}

export function copyTreeItem(this: any) {
  if (!this.treeMenuPath || !this.treeMenuType) return;
  this.treeClipboard = { path: this.treeMenuPath, type: this.treeMenuType };
  this.showToast(t("tree.toast.copied", { path: this.treeMenuPath }));
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
      const msg = payload?.detail || payload?.error?.message || t("tree.error.copy_http", { status: res.status });
      this.showToast(msg, "error");
      return;
    }
    const destPath = payload?.dest ? String(payload.dest) : destName;
    this.showToast(t("tree.toast.pasted", { path: destPath }));
    if (typeof this.notifyFsChanged === "function") {
      await this.notifyFsChanged();
    } else {
      await this.reloadTreePath(destDir);
    }
  } catch {
    this.showToast(t("tree.toast.copy_error"), "error");
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
      const msg = payload?.detail || payload?.error?.message || t("tree.error.delete_http", { status: res.status });
      this.showToast(msg, "error");
      return;
    }
    closeTabsForDeletedPath(this, target, this.deleteTargetType);
    this.showToast(t("tree.toast.deleted"));
    if (typeof this.notifyFsChanged === "function") {
      await this.notifyFsChanged();
    } else {
      await this.reloadTreePath(parent);
    }
  } catch {
    this.showToast(t("tree.toast.delete_error"), "error");
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
  const dirBase = this.activeDir && this.activeDir !== "/" ? this.activeDir : "";
  const dir = dirBase;
  if (this.newItemKind === "file") {
    const base = this.newItemName.trim();
    const ext = this.newItemExt.trim();
    if (!base) {
      this.status = t("tree.validation.file_name_required");
      this.showToast(t("tree.validation.file_name_required"), "error");
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
        this.showToast(t("tree.validation.file_exists"), "error");
        this.status = t("tree.validation.file_exists");
        return;
      }
      const res = await apiCreateFile(this.apiBase, target);
      if (!res.ok) {
        const detailJson = await res.json().catch(() => null);
        const detailText = !detailJson ? await res.text().catch(() => "") : "";
        const msg =
          (detailJson && (detailJson.detail || detailJson.message)) ||
          detailText ||
          (res.status === 400 ? t("tree.validation.file_exists") : t("tree.error.create_file"));
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
      this.status = t("tree.error.create_file");
      this.showToast(t("tree.error.create_file"), "error");
    }
  } else if (this.newItemKind === "folder") {
    const base = this.newItemName.trim();
    if (!base) {
      this.status = t("tree.validation.folder_name_required");
      this.showToast(t("tree.validation.folder_name_required"), "error");
      return;
    }
    const parentItems =
      dir && dir !== ""
        ? this.treeData[dir] ?? []
        : this.rootItems.length > 0
          ? this.rootItems
          : this.treeData[""] ?? [];
    if (parentItems.some((it: TreeItem) => it.name === base && it.type === "dir")) {
      const msg = t("tree.validation.folder_exists");
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
          (res.status === 400 ? t("tree.validation.folder_exists") : t("tree.error.create_folder_exists"));
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
      this.status = t("tree.error.create_folder");
      this.showToast(t("tree.error.create_folder"), "error");
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
    const targetDir = isDir && this.activeDir === it.path;
    const readonlyDir = isDir && it.writable === false;
    const dropActive = this.dropTargetPath === (it.path || "/");

    return html`
      <div
        class="treeRow file-tree-item ${active ? "active selected" : ""} ${targetDir ? "targetDir" : ""} ${dropActive ? "dropTarget" : ""} ${readonlyDir ? "readonly-dir" : ""}"
        style="padding-left:${8 + depth * 14}px"
        draggable="true"
        @dragstart=${(e: DragEvent) => this.handleTreeDragStart(e, it)}
        @dragover=${(e: DragEvent) => this.handleTreeDragOver(e, it)}
        @dragleave=${(e: DragEvent) => this.handleTreeDragLeave(e, it)}
        @drop=${(e: DragEvent) => this.handleTreeDrop(e, it)}
        @click=${() => {
          if (isDir) {
            this.setActiveSelection(it.path, true);
            this.toggleDir(it.path);
          } else {
            this.requestOpenFile(it.path, (it as any).size);
          }
        }}
        @contextmenu=${(e: MouseEvent) => this.handleTreeContextMenu(e, it)}
      >
        <span class="twisty">
          ${isDir
            ? isExpanded
              ? html`<app-icon name="chevron-down" size="14" class="tree-icon tree-icon--chevron chevron"></app-icon>`
              : html`<app-icon name="chevron-right" size="14" class="tree-icon tree-icon--chevron chevron"></app-icon>`
            : nothing}
        </span>
        ${isDir
          ? html`<app-icon name="folder" size="16" class="tree-icon tree-icon--folder folder-icon"></app-icon>`
          : html`<app-icon name="file" size="16" class="tree-icon tree-icon--file file-icon"></app-icon>`}
        <span class=${isDir ? "tree-label" : "tree-label muted"}>${it.name}</span>
      </div>

      ${isDir && isExpanded
        ? html`<div>${this.renderTree(it.path, depth + 1)}</div>`
        : nothing}
    `;
  });
}
