import { LitElement, css, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { HAClient, type HassState } from "./ha-client";

type TreeItem = { name: string; path: string; type: "dir" | "file"; children?: TreeItem[] };
type Tab = { path: string; name: string; dirty: boolean };

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 100%;
      width: 100%;
      overflow: hidden;
      color: #d4d4d4;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: #1e1e1e;
      box-sizing: border-box;
    }

    /* Layout */
    .shell {
      height: 100%;
      display: grid;
      grid-template-rows: 34px 1fr 22px; /* titlebar, main, status */
    }

    /* Titlebar */
    .titlebar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 10px;
      border-bottom: 1px solid #2a2a2a;
      background: #2d2d2d;
      user-select: none;
      font-size: 12px;
      position: relative;
      overflow: visible;
      z-index: 30;
    }
    .menus {
      display: flex;
      gap: 12px;
      opacity: 0.9;
      position: relative;
    }
    .menus span {
      cursor: default;
    }
    .menuItem {
      position: relative;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .menuItem:hover,
    .menuItem.open {
      background: #3a3a3a;
    }
    .menuPopup {
      position: absolute;
      top: 30px;
      left: 0;
      background: #2d2d2d;
      border: 1px solid #3a3a3a;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      border-radius: 8px;
      min-width: 180px;
      padding: 6px 0;
      z-index: 20;
      overflow: visible;
    }
    .menuItemRow {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
    }
    .menuItemRow:hover {
      background: #3a3a3a;
    }
    .menuIcon {
      width: 18px;
      text-align: center;
      opacity: 0.85;
    }
    .menuDivider {
      height: 1px;
      margin: 6px 0;
      background: #3a3a3a;
    }
    .title {
      margin-left: auto;
      opacity: 0.7;
    }

    /* Main area */
    .main {
      display: grid;
      grid-template-columns: 48px 280px 1fr; /* activity, sidebar, editor */
      height: 100%;
      overflow: hidden;
    }

    /* Activity bar */
    .activity {
      background: #333333;
      border-right: 1px solid #2a2a2a;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      gap: 8px;
    }
    .act {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      cursor: pointer;
      opacity: 0.85;
    }
    .act.active {
      background: #252526;
      outline: 1px solid #3a3a3a;
      opacity: 1;
    }
    .sidebarContent {
      padding: 8px 6px 12px;
      font-size: 13px;
      overflow-x: hidden;
    }
    .entityPane {
      display: grid;
      gap: 8px;
    }
    .entityHeader {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .entitySearch {
      width: 100%;
      margin-bottom: 2px;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid #3a3a3a;
      background: #1e1e1e;
      color: #d4d4d4;
      box-sizing: border-box;
    }
    .entityList {
      overflow: visible;
      display: grid;
      gap: 6px;
      padding-right: 0;
    }
    .entityCard {
      padding: 8px;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      background: #1f1f1f;
      box-sizing: border-box;
      position: relative;
      padding-bottom: 22px;
    }
    .entityName {
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .entityId {
      font-size: 12px;
      opacity: 0.8;
      overflow-wrap: anywhere;
    }
    .entityMeta {
      font-size: 12px;
      margin-top: 4px;
      overflow-wrap: anywhere;
    }
    .entityInsert {
      position: absolute;
      right: 6px;
      bottom: 6px;
      border: 1px solid #3a3a3a;
      background: #2a2a2a;
      color: #d4d4d4;
      border-radius: 8px;
      padding: 4px 6px;
      cursor: pointer;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      opacity: 0.9;
    }
    .entityInsert:hover {
      background: #343434;
    }
    .entityError {
      color: #f6dada;
      background: #3a1f1f;
      padding: 8px;
      border-radius: 8px;
      font-size: 12px;
      box-sizing: border-box;
    }
    .entityGroup {
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      overflow: hidden;
      background: #222;
    }
    .entityGroup + .entityGroup {
      margin-top: 6px;
    }
    .entityGroupHeader {
      width: 100%;
      border: none;
      background: #252526;
      color: #d4d4d4;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      cursor: pointer;
      text-align: left;
      box-sizing: border-box;
      font-size: 13px;
    }
    .entityGroupHeader:hover {
      background: #2d2d2d;
    }
    .entityGroupTitle {
      font-weight: 600;
      text-transform: lowercase;
    }
    .entityGroupBody {
      padding: 6px;
      display: grid;
      gap: 6px;
    }
    .entityEmpty {
      padding: 8px;
      font-size: 12px;
      opacity: 0.75;
    }

    /* Sidebar */
    .sidebar {
      background: #252526;
      border-right: 1px solid #2a2a2a;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .sidebarHeader {
      height: 34px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-bottom: 1px solid #2a2a2a;
      font-size: 12px;
      letter-spacing: 0.04em;
      color: #c8c8c8;
    }
    .explorerTitle {
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .tree {
      padding: 8px 6px 12px;
      font-size: 13px;
    }
    .treeRow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      cursor: pointer;
      color: #d4d4d4;
    }
    .treeRow:hover {
      background: #2a2d2e;
    }
    .treeRow.active {
      background: #37373d;
    }
    .indent {
      width: 14px;
      flex: 0 0 14px;
    }
    .twisty {
      width: 14px;
      flex: 0 0 14px;
      opacity: 0.9;
    }
    .muted {
      opacity: 0.8;
    }

    /* Editor */
    .editor {
      display: grid;
      grid-template-rows: 34px 1fr; /* tabs, content */
      overflow: hidden;
      background: #1e1e1e;
    }

    .tabs {
      display: flex;
      align-items: end;
      gap: 1px;
      padding: 0 8px;
      background: #252526;
      border-bottom: 1px solid #2a2a2a;
      overflow: auto;
      white-space: nowrap;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 30px;
      padding: 0 10px;
      margin-top: 4px;
      border-radius: 10px 10px 0 0;
      background: #2d2d2d;
      color: #c8c8c8;
      cursor: pointer;
      font-size: 12px;
    }
    .tab.active {
      background: #1e1e1e;
      color: #ffffff;
      outline: 1px solid #2a2a2a;
      outline-offset: -1px;
    }
    .tabClose {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
      margin: 0;
      opacity: 0.65;
      font-size: 12px;
      display: grid;
      place-items: center;
      line-height: 1;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 99px;
      background: #d4d4d4;
      opacity: 0.65;
    }

    .content {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 8px;
      padding: 12px;
      overflow: hidden;
    }

    .crumbs {
      font-size: 12px;
      opacity: 0.75;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .btn {
      background: #2d2d2d;
      color: #d4d4d4;
      border: 1px solid #3a3a3a;
      border-radius: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:hover {
      background: #333333;
    }
    .btn.primary {
      background: #0e639c;
      border-color: #0e639c;
      color: white;
    }
    .btn.primary:hover {
      background: #1177bb;
    }

    .editorWrap {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: stretch;
      gap: 0;
      height: 100%;
      overflow: hidden;
      position: relative;
    }
    .gutter {
      width: 52px;
      padding: 12px 8px;
      background: #1a1a1a;
      color: #7c7c7c;
      border: 1px solid #2a2a2a;
      border-right: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.4;
      text-align: right;
      white-space: pre;
      box-sizing: border-box;
      overflow: hidden;
      height: fit-content;
      border-radius: 12px 0 0 12px;
    }
    .codeWrap {
      position: relative;
      height: 100%;
      overflow: auto;
      border: 1px solid #2a2a2a;
      border-left: none;
      border-radius: 0 12px 12px 0;
      background: #1e1e1e;
    }
    .code {
      position: absolute;
      inset: 0;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre;
      word-wrap: normal;
      color: #d4d4d4;
      pointer-events: none;
      overflow: hidden;
      box-sizing: border-box;
    }
    .codeLine {
      white-space: pre;
      min-height: 1.4em;
      line-height: 1.4;
    }
    .token-key {
      color: #9cdcfe;
    }
    .token-string {
      color: #ce9178;
    }
    .token-number {
      color: #b5cea8;
    }
    .token-boolean {
      color: #4ec9b0;
    }
    .token-comment {
      color: #6a9955;
    }
    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      border-radius: 0 12px 12px 0;
      border: none;
      border-left: none;
      background: transparent;
      color: transparent;
      caret-color: #d4d4d4;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.4;
      outline: none;
      box-sizing: border-box;
      overflow: auto;
    }
    textarea:focus {
      border-color: #3a3a3a;
    }

    /* Status bar */
    .statusbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      font-size: 12px;
      background: #007acc;
      color: white;
      user-select: none;
    }
    .statusbar .right {
      margin-left: auto;
      opacity: 0.95;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .statusToggle {
      border: 1px solid rgba(255, 255, 255, 0.4);
      background: transparent;
      color: inherit;
      border-radius: 8px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 11px;
    }
    .statusToggle:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .statusbar .version {
      margin-left: 10px;
      opacity: 0.85;
      font-weight: 600;
    }

    /* Modal */
    .modalBackdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: grid;
      place-items: center;
      z-index: 200;
    }
    .modal {
      background: #2d2d2d;
      border: 1px solid #3a3a3a;
      border-radius: 12px;
      padding: 16px;
      width: 360px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      display: grid;
      gap: 12px;
    }
    .modal h3 {
      margin: 0;
      font-size: 16px;
    }
    .modal label {
      font-size: 12px;
      color: #c8c8c8;
      display: grid;
      gap: 6px;
    }
    .modal input {
      background: #1e1e1e;
      border: 1px solid #3a3a3a;
      color: #d4d4d4;
      padding: 8px;
      border-radius: 8px;
      font-size: 13px;
    }
    .modal .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    /* Toast */
    .toastContainer {
      position: fixed;
      top: 112px;
      right: 12px;
      display: grid;
      gap: 8px;
      z-index: 300;
    }
    .toast {
      min-width: 275px;
      background: #2d2d2d;
      color: #e5e5e5;
      border: 1px solid #3a3a3a;
      border-radius: 10px;
      padding: 12px 16px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      font-size: 14px;
      transform: translateX(120%);
      animation: slide-in 180ms ease-out forwards, slide-out 180ms ease-in forwards;
      animation-delay: 0s, 4.8s;
    }
    .toast.error {
      border-color: #c74c4c;
      background: #3a1f1f;
      color: #f6dada;
    }
    @keyframes slide-in {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0%);
        opacity: 1;
      }
    }
    @keyframes slide-out {
      from {
        transform: translateX(0%);
        opacity: 1;
      }
      to {
        transform: translateX(120%);
        opacity: 0;
      }
    }
  `;

  private apiBase = (() => {
    const base = new URL("./", window.location.href).pathname;
    return base.endsWith("/") ? base : `${base}/`;
  })();

  static properties = {
    expanded: { state: true },
    activePath: { state: true },
    tabs: { state: true },
    content: { state: true },
    status: { state: true },
    openMenu: { state: true },
    newItemKind: { state: true },
    newItemName: { state: true },
    newItemExt: { state: true },
    activeActivity: { state: true },
    toastMessage: { state: true },
    toastType: { state: true },
    entityFilter: { state: true },
    entities: { state: true },
    entityError: { state: true },
    collapsedDomains: { state: true },
    autoIndentEnabled: { state: true },
    rootItems: { state: true },
    treeData: { state: true },
    lineCount: { state: true },
    cursorLine: { state: true },
    cursorCol: { state: true },
  };

  declare expanded: Set<string>; // root expanded
  declare activePath: string | null;
  declare tabs: Tab[];
  declare content: string;
  declare status: string;
  declare openMenu: string | null;
  declare newItemKind: "file" | "folder" | null;
  declare newItemName: string;
  declare newItemExt: string;
  declare activeActivity: "explorer" | "search" | "entity";
  declare toastMessage: string | null;
  declare toastType: "info" | "error";
  declare entityFilter: string;
  declare entities: Record<string, HassState>;
  declare entityError: string | null;
  declare collapsedDomains: Set<string>;
  declare autoIndentEnabled: boolean;
  declare rootItems: TreeItem[];
  declare treeData: Record<string, TreeItem[]>;
  declare lineCount: number;
  declare cursorLine: number;
  declare cursorCol: number;
  private loadedPaths = new Set<string>();
  private loadingPaths = new Set<string>();
  private fileCache: Record<string, string> = {};
  private codeRef: HTMLDivElement | null = null;
  private gutterRef: HTMLDivElement | null = null;
  private editorRef: HTMLTextAreaElement | null = null;
  private cursorRaf: number | null = null;
  private lastCursorLine = 1;
  private lastCursorCol = 1;
  private toastTimer: number | null = null;
  private haClient: HAClient | null = null;
  private readonly appVersion = "0.1.25";
  private lastDomains = new Set<string>();
  private selectionListener = () => {
    if (!this.editorRef) return;
    const active = this.shadowRoot?.activeElement || document.activeElement;
    if (active !== this.editorRef) return;
    this.updateCursorFromPos(this.editorRef.selectionStart ?? 0, this.editorRef.value);
  };

  constructor() {
    super();
    this.expanded = new Set<string>([""]);
    this.activePath = null;
    this.tabs = [];
    this.content = "";
    this.status = "Ready";
    this.openMenu = null;
    this.newItemKind = null;
    this.newItemName = "";
    this.newItemExt = "";
    this.activeActivity = "explorer";
    this.toastMessage = null;
    this.toastType = "info";
    this.entityFilter = "";
    this.entities = {};
    this.entityError = null;
    this.collapsedDomains = new Set<string>();
    this.autoIndentEnabled = true;
    this.rootItems = [];
    this.treeData = {};
    this.lineCount = 1;
    this.cursorLine = 1;
    this.cursorCol = 1;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.loadedPaths.has("")) {
      this.loadTree("");
    }
    document.addEventListener("selectionchange", this.selectionListener);
    document.addEventListener("click", this.handleGlobalClick, true);
    this.initEntities();
  }

  disconnectedCallback(): void {
    document.removeEventListener("selectionchange", this.selectionListener);
    document.removeEventListener("click", this.handleGlobalClick, true);
    if (this.cursorRaf !== null) cancelAnimationFrame(this.cursorRaf);
    if (this.haClient) {
      this.haClient.disconnect();
      this.haClient = null;
    }
    super.disconnectedCallback();
  }

  private async loadTree(path: string, force = false) {
    if ((!force && this.loadedPaths.has(path)) || this.loadingPaths.has(path)) {
      return;
    }
    this.loadingPaths.add(path);

    try {
      this.status = "Loading tree...";
      const url = `${this.apiBase}api/tree${path ? `?path=${encodeURIComponent(path)}` : ""}`;
      const res = await fetch(url);
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

  private async toggleDir(path: string) {
    const s = new Set(this.expanded);
    const willExpand = !s.has(path);
    willExpand ? s.add(path) : s.delete(path);
    this.expanded = s;

    if (willExpand && !this.treeData[path]) {
      await this.loadTree(path);
    }
  }

  private openFile(path: string) {
    const name = path.split("/").pop() || path;
    const existing = this.tabs.find((t) => t.path === path);
    if (!existing) {
      this.tabs = [...this.tabs, { path, name, dirty: false }];
    }
    this.activePath = path;
    this.content = "";
    this.loadFile(path);
  }

  private async loadFile(path: string) {
    try {
      this.status = "Loading file...";
      const url = `${this.apiBase}api/file?path=${encodeURIComponent(path)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`file ${res.status}`);
      }
      const data = await res.json();
      this.content = data.content ?? "";
      this.lineCount = Math.max(1, this.content.split("\n").length);
      this.fileCache[path] = this.content;
      this.cursorLine = 1;
      this.cursorCol = 1;
      this.tabs = this.tabs.map((t) => (t.path === path ? { ...t, dirty: false } : t));
      this.status = "Ready";
    } catch (e) {
      this.status = "Errore caricamento file";
    }
  }

  private closeTab(path: string) {
    const idx = this.tabs.findIndex((t) => t.path === path);
    if (idx < 0) {
      console.debug("[app-root] closeTab: tab not found", path);
      return;
    }
    const nextTabs = this.tabs.slice(0, idx).concat(this.tabs.slice(idx + 1));
    this.tabs = nextTabs;

    if (this.activePath === path) {
      const next = nextTabs[idx - 1] ?? nextTabs[idx] ?? null;
      this.activePath = next?.path ?? null;
      this.content = next ? this.content : "";
      if (!next) {
        this.cursorLine = 1;
        this.cursorCol = 1;
        this.lineCount = 1;
      }
    }
    console.debug("[app-root] closeTab: closed", path, { remaining: this.tabs.map((t) => t.path), active: this.activePath });
  }

  private markDirty(val: string) {
    this.content = val;
    this.lineCount = Math.max(1, this.content.split("\n").length);
    if (!this.activePath) return;
    this.fileCache[this.activePath] = val;
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath ? { ...t, dirty: true } : t
    );
  }

  private updateCursorFromPos(pos: number, value?: string) {
    const source = value ?? this.content;
    const upToPos = source.slice(0, pos);
    const lines = upToPos.split("\n");
    const nextLine = Math.max(1, lines.length);
    const nextCol = Math.max(1, lines[lines.length - 1].length + 1);
    if (nextLine !== this.cursorLine || nextCol !== this.cursorCol) {
      this.cursorLine = nextLine;
      this.cursorCol = nextCol;
      this.lastCursorLine = nextLine;
      this.lastCursorCol = nextCol;
      console.debug("[app-root] cursor", { pos, line: nextLine, col: nextCol });
    }
  }

  private updateCursorFromTextarea() {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const pos = ta.selectionStart ?? 0;
    this.updateCursorFromPos(pos, ta.value);
  }

  private handleInput(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    this.markDirty(ta.value);
    requestAnimationFrame(() => this.updateCursorFromTextarea());
  }

  private handleCursorMove(e: Event) {
    requestAnimationFrame(() => this.updateCursorFromTextarea());
  }

  private handleEditorKeyDown(e: KeyboardEvent) {
    if (!this.autoIndentEnabled) {
      this.handleCursorMove(e);
      return;
    }
    if (e.key === "Enter") {
      const handled = this.applyAutoIndent(e);
      if (handled) return;
    } else if (e.key === "Tab") {
      const handled = this.insertTabSpaces(e);
      if (handled) return;
    }
    this.handleCursorMove(e);
  }

  private insertTabSpaces(e: KeyboardEvent) {
    if (!this.editorRef) return false;
    e.preventDefault();
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const tab = "  ";
    const next = `${this.content.slice(0, start)}${tab}${this.content.slice(end)}`;
    this.markDirty(next);
    const pos = start + tab.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = pos;
      this.editorRef.selectionEnd = pos;
      this.editorRef.focus();
      this.updateCursorFromPos(pos, this.content);
    });
    return true;
  }

  private applyAutoIndent(e: KeyboardEvent) {
    if (!this.editorRef) return false;
    if (e.shiftKey) return false; // Shift+Enter: newline default, niente indent automatico
    e.preventDefault();
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const before = this.content.slice(0, start);
    const after = this.content.slice(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.slice(lineStart);
    const baseIndent = currentLine.match(/^[\t ]*/) ? currentLine.match(/^[\t ]*/)![0] : "";
    const trimmed = currentLine.trim();
    let extra = "";
    if (trimmed.endsWith(":")) {
      extra = "  ";
    } else if (trimmed.startsWith("-")) {
      extra = "  ";
    }
    const indent = `${baseIndent}${extra}`;
    const insert = `\n${indent}`;
    const next = `${before}${insert}${after}`;
    this.markDirty(next);
    const pos = start + insert.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = pos;
      this.editorRef.selectionEnd = pos;
      this.editorRef.focus();
      this.updateCursorFromPos(pos, this.content);
    });
    return true;
  }

  private startCursorTracking() {
    const tick = () => {
      this.updateCursorFromTextarea();
      this.cursorRaf = requestAnimationFrame(tick);
    };
    if (this.cursorRaf === null) {
      this.cursorRaf = requestAnimationFrame(tick);
    }
  }

  private stopCursorTracking() {
    if (this.cursorRaf !== null) {
      cancelAnimationFrame(this.cursorRaf);
      this.cursorRaf = null;
    }
  }

  private handleGlobalClick = (e: MouseEvent) => {
    if (!this.openMenu) return;
    const path = e.composedPath();
    if (path.includes(this)) return;
    if (this.shadowRoot && path.includes(this.shadowRoot.host)) return;
    this.openMenu = null;
  };

  private toggleMenu(e: Event, name: string) {
    e.preventDefault();
    e.stopPropagation();
    this.openMenu = this.openMenu === name ? null : name;
    console.debug("[app-root] menu toggle", { name, open: this.openMenu });
  }

  private showToast(message: string, type: "info" | "error" = "info") {
    if (this.toastTimer !== null) {
      clearTimeout(this.toastTimer);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage = null;
      this.toastType = "info";
      this.toastTimer = null;
    }, 5000);
  }

  private async initEntities() {
    try {
      this.haClient = new HAClient(this.apiBase);
      this.haClient.connect((ev) => {
        const id = ev.event.data.entity_id;
        const next = { ...this.entities };
        if (ev.event.data.new_state) {
          next[id] = ev.event.data.new_state;
        } else {
          delete next[id];
        }
        this.syncCollapsedDomains(Object.keys(next).map((k) => k.split(".")[0]));
        this.entities = next;
      });
      const states = await this.haClient.getStates();
      const next: Record<string, HassState> = {};
      states.forEach((s) => {
        next[s.entity_id] = s;
      });
      this.syncCollapsedDomains(states.map((s) => s.entity_id.split(".")[0]));
      this.entities = next;
      this.entityError = null;
    } catch (e) {
      this.entityError = "Errore caricamento entità";
      this.showToast("Errore caricamento entità", "error");
    }
  }

  private handleMenuAction(menu: string, action: string) {
    this.openMenu = null;
    if (menu === "file") {
      if (action === "New file") {
        this.newItemKind = "file";
        this.newItemName = "";
        this.newItemExt = "";
      } else if (action === "New folder") {
        this.newItemKind = "folder";
        this.newItemName = "";
      } else if (action === "Save" && this.activePath) {
        this.save();
      } else if (action === "Save as…") {
        this.status = "Save as non implementato";
        this.showToast("Save as non implementato", "info");
      }
    } else if (menu === "run" && action === "Save all") {
      this.save();
    }
  }

  private async createNewItem() {
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
      const filename = ext ? `${base}.${ext.replace(/^\./, "")}` : base;
      const target = dir ? `${dir}/${filename}` : filename;
      try {
        const parentItems =
          dir && dir !== ""
            ? this.treeData[dir] ?? []
            : this.rootItems.length > 0
              ? this.rootItems
              : this.treeData[""] ?? [];
        if (parentItems.some((it) => it.name === filename && it.type === "file")) {
          this.showToast("File already exist", "error");
          this.status = "File already exist";
          return;
        }
        const url = `${this.apiBase}api/file?path=${encodeURIComponent(target)}&create_only=1`;
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "" }),
        });
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
        this.newItemKind = null;
        this.loadedPaths.delete(dir);
        await this.loadTree(dir, true);
        this.expanded = new Set(this.expanded).add(dir);
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
      if (parentItems.some((it) => it.name === base && it.type === "dir")) {
        const msg = "Folder already exist";
        this.showToast(msg, "error");
        this.status = msg;
        return;
      }
      const target = dir ? `${dir}/${base}` : base;
      try {
        const url = `${this.apiBase}api/folder?path=${encodeURIComponent(target)}`;
        const res = await fetch(url, { method: "POST" });
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
        this.newItemKind = null;
        this.loadedPaths.delete(dir);
        await this.loadTree(dir, true);
        this.expanded = new Set(this.expanded).add(target);
      } catch (e) {
        this.status = "Errore creazione cartella";
        this.showToast("Errore creazione cartella", "error");
      }
    }
  }

  private cancelNewItem() {
    this.newItemKind = null;
    this.newItemName = "";
    this.newItemExt = "";
  }

  private handleCloseTab(e: Event, path: string) {
    e.stopPropagation();
    e.preventDefault();
    console.debug("[app-root] close tab click", path, { active: this.activePath, tabs: this.tabs.length });
    this.closeTab(path);
  }

  private switchTab(path: string) {
    this.activePath = path;
    const cached = this.fileCache[path];
    if (cached !== undefined) {
      this.content = cached;
      this.lineCount = Math.max(1, cached.split("\n").length);
      this.cursorLine = 1;
      this.cursorCol = 1;
    } else {
      this.content = "";
      this.lineCount = 1;
      this.cursorLine = 1;
      this.cursorCol = 1;
      this.loadFile(path);
    }
  }

  private highlightLine(line: string) {
    type Seg = { text: string; cls?: string };
    const segments: Seg[] = [];
    const pushWithStyles = (text: string) => {
      const regex = /(".*?"|'.*?'|\btrue\b|\bfalse\b|\bnull\b|\b\d+(?:\.\d+)?\b)/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > last) {
          segments.push({ text: text.slice(last, m.index) });
        }
        const token = m[1];
        if (token === "true" || token === "false" || token === "null") {
          segments.push({ text: token, cls: "token-boolean" });
        } else if (/^\d/.test(token)) {
          segments.push({ text: token, cls: "token-number" });
        } else {
          segments.push({ text: token, cls: "token-string" });
        }
        last = m.index + token.length;
      }
      if (last < text.length) {
        segments.push({ text: text.slice(last) });
      }
    };

    const commentIdx = line.indexOf("#");
    const contentPart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : null;

    const keyMatch = contentPart.match(/^(\s*-?\s*[^:\s#]+:)/);
    if (keyMatch) {
      const key = keyMatch[1];
      segments.push({ text: key, cls: "token-key" });
      const rest = contentPart.slice(key.length);
      if (rest) pushWithStyles(rest);
    } else {
      pushWithStyles(contentPart);
    }

    if (commentPart) {
      segments.push({ text: commentPart, cls: "token-comment" });
    }
    if (segments.length === 0) {
      segments.push({ text: " " });
    }
    return segments;
  }

  private renderHighlighted() {
    const lines = this.content.split("\n");
    return lines.map(
      (line, idx) =>
        html`<div class="codeLine" data-gutter-line=${idx + 1}>${this.highlightLine(line).map((seg) => html`<span class=${seg.cls ?? ""}>${seg.text || " "}</span>`)}</div>`
    );
  }

  private renderMenu(label: string, name: string, items: { icon: string; label: string }[]) {
    const open = this.openMenu === name;
    return html`
      <div class="menuItem ${open ? "open" : ""}" @click=${(e: Event) => this.toggleMenu(e, name)}>
        <span>${label}</span>
        <div class="menuPopup" ?hidden=${!open} @click=${(e: Event) => e.stopPropagation()}>
          ${items.map(
            (it) => html`<div class="menuItemRow" @click=${() => this.handleMenuAction(name, it.label)}>
              <span class="menuIcon">${it.icon}</span>
              <span>${it.label}</span>
            </div>`
          )}
        </div>
      </div>
    `;
  }

  private syncScroll(e: Event) {
    const top = (e.target as HTMLElement).scrollTop;
    if (this.codeRef) this.codeRef.style.transform = `translateY(-${top}px)`;
    if (this.gutterRef) this.gutterRef.style.transform = `translateY(-${top}px)`;
  }

  private setActivity(name: "explorer" | "search" | "entity") {
    this.activeActivity = name;
  }

  private toggleDomain(domain: string) {
    const next = new Set(this.collapsedDomains);
    if (next.has(domain)) {
      next.delete(domain);
    } else {
      next.add(domain);
    }
    this.collapsedDomains = next;
  }

  private insertEntityId(entityId: string) {
    if (!this.activePath || !this.editorRef) {
      this.showToast("Apri un file prima di inserire", "error");
      return;
    }
    const ta = this.editorRef;
    const start = ta.selectionStart ?? this.content.length;
    const end = ta.selectionEnd ?? this.content.length;
    const next = `${this.content.slice(0, start)}${entityId}${this.content.slice(end)}`;
    this.markDirty(next);
    const cursorPos = start + entityId.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = cursorPos;
      this.editorRef.selectionEnd = cursorPos;
      this.editorRef.focus();
      this.updateCursorFromPos(cursorPos, this.content);
    });
  }

  private syncCollapsedDomains(domains: string[]) {
    const domainSet = new Set(domains);
    if (domainSet.size === 0) {
      this.lastDomains = domainSet;
      return;
    }
    if (this.collapsedDomains.size === 0 && this.lastDomains.size === 0) {
      this.collapsedDomains = new Set(domainSet);
      this.lastDomains = domainSet;
      return;
    }

    const next = new Set<string>();
    domainSet.forEach((d) => {
      if (this.collapsedDomains.has(d)) {
        next.add(d);
      } else if (!this.lastDomains.has(d)) {
        // nuovo dominio: chiuso di default
        next.add(d);
      }
    });

    if (next.size !== this.collapsedDomains.size || Array.from(next).some((d) => !this.collapsedDomains.has(d))) {
      this.collapsedDomains = next;
    }
    this.lastDomains = domainSet;
  }

  private renderSidebarContent() {
    if (this.activeActivity === "explorer") {
      return html`<div class="tree">${this.renderTree("")}</div>`;
    }
    if (this.activeActivity === "search") {
      return html`<div class="sidebarContent">Search coming soon…</div>`;
    }
    // entity mock
    const entries = Object.values(this.entities);
    const filtered = entries
      .filter((e) => {
        const q = this.entityFilter.toLowerCase();
        if (!q) return true;
        return e.entity_id.toLowerCase().includes(q) || (e.attributes?.friendly_name || "").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const da = a.entity_id.split(".")[0];
        const db = b.entity_id.split(".")[0];
        if (da === db) return a.entity_id.localeCompare(b.entity_id);
        return da.localeCompare(db);
      });
    const grouped: Record<string, HassState[]> = {};
    filtered.forEach((e) => {
      const domain = e.entity_id.split(".")[0];
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(e);
    });
    const domains = Object.keys(grouped).sort();
    return html`<div class="sidebarContent entityPane">
      <div class="entityHeader">Entities</div>
      <input
        class="entitySearch"
        type="text"
        .value=${this.entityFilter}
        @input=${(e: Event) => (this.entityFilter = (e.target as HTMLInputElement).value)}
        placeholder="Search entity id or name"
      />
      ${this.entityError
        ? html`<div class="entityError">${this.entityError}</div>`
        : html`<div class="entityList">
            ${domains.length === 0
              ? html`<div class="entityEmpty">No entities</div>`
              : domains.map((domain) => {
                  const items = grouped[domain];
                  const isOpen = !this.collapsedDomains.has(domain);
                  return html`<div class="entityGroup">
                    <button class="entityGroupHeader" type="button" @click=${() => this.toggleDomain(domain)}>
                      <span class="chevron">${isOpen ? "▾" : "▸"}</span>
                      <span class="entityGroupTitle">${domain}</span>
                      <span style="margin-left:auto; opacity:0.75; font-size:12px;">${items.length}</span>
                    </button>
                    ${isOpen
                      ? html`<div class="entityGroupBody">
                          ${items.map((e) => {
                            const name = (e.attributes?.friendly_name as string) || e.entity_id;
                            return html`<div class="entityCard">
                              <div class="entityName">${name}</div>
                              <div class="entityId">${e.entity_id}</div>
                              <div class="entityMeta">${domain} • State: ${e.state}</div>
                              <button class="entityInsert" title="Insert.." @click=${(ev: Event) => { ev.stopPropagation(); this.insertEntityId(e.entity_id); }}>
                                ➕ <span>Insert</span>
                              </button>
                            </div>`;
                          })}
                        </div>`
                      : nothing}
                  </div>`;
                })}
          </div>`}
    </div>`;
  }

  private renderLineNumbers() {
    const count = Math.max(1, this.lineCount);
    return Array.from({ length: count }, (_, i) => String(i + 1)).join("\n");
  }

  private async save() {
    if (!this.activePath) return;
    this.status = "Saving...";
    try {
      const url = `${this.apiBase}api/file?path=${encodeURIComponent(this.activePath)}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: this.content }),
      });
      if (!res.ok) {
        throw new Error(`save ${res.status}`);
      }
      this.fileCache[this.activePath] = this.content;
      this.tabs = this.tabs.map((t) =>
        t.path === this.activePath ? { ...t, dirty: false } : t
      );
      this.status = "Saved";
      setTimeout(() => (this.status = "Ready"), 800);
    } catch (e) {
      this.status = "Errore salvataggio";
    }
  }

  private renderTree(path: string, depth = 0) {
    const items =
      path === ""
        ? this.rootItems.length > 0
          ? this.rootItems
          : this.treeData[""] ?? []
        : this.treeData[path] ?? [];
    return items.map((it) => {
      const isDir = it.type === "dir";
      const isExpanded = isDir && this.expanded.has(it.path);
      const active = this.activePath === it.path;

      return html`
        <div
          class="treeRow ${active ? "active" : ""}"
          style="padding-left:${8 + depth * 14}px"
          @click=${() => {
            if (isDir) this.toggleDir(it.path);
            else this.openFile(it.path);
          }}
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

  render() {
    const activeTab = this.tabs.find((t) => t.path === this.activePath) ?? null;

    return html`
      <div class="shell">
          <div class="titlebar">
          <div class="menus">
            ${this.renderMenu("File", "file", [
              { icon: "📄", label: "New file" },
              { icon: "📁", label: "New folder" },
              { icon: "💾", label: "Save" },
              { icon: "📝", label: "Save as…" },
              { icon: "⬆️", label: "Import…" },
              { icon: "⬇️", label: "Export…" },
            ])}
            ${this.renderMenu("Edit", "edit", [
              { icon: "↩️", label: "Undo" },
              { icon: "↪️", label: "Redo" },
              { icon: "✂️", label: "Cut" },
              { icon: "📋", label: "Copy" },
              { icon: "📥", label: "Paste" },
              { icon: "🔍", label: "Find…" },
              { icon: "♻️", label: "Replace…" },
            ])}
            ${this.renderMenu("View", "view", [
              { icon: "🔄", label: "Reload tree" },
              { icon: "🔡", label: "Toggle line numbers" },
              { icon: "↔️", label: "Toggle wrap" },
            ])}
            ${this.renderMenu("Go", "go", [
              { icon: "📂", label: "Go to file…" },
              { icon: "🔢", label: "Go to line…" },
              { icon: "📜", label: "Open recent…" },
            ])}
            ${this.renderMenu("Run", "run", [
              { icon: "💾", label: "Save all" },
              { icon: "🗂️", label: "Reload config" },
              { icon: "✅", label: "Check health" },
            ])}
            ${this.renderMenu("Help", "help", [
              { icon: "📖", label: "Docs" },
              { icon: "❓", label: "About" },
            ])}
          </div>
          <div class="title">File Editor Plus</div>
          <button class="btn" style="margin-left:12px;" @click=${() => this.showToast("Toast di test", "info")}>Toast test</button>
        </div>

        <div class="main">
          <div class="activity">
            <div class="act ${this.activeActivity === "explorer" ? "active" : ""}" title="Explorer" @click=${() => this.setActivity("explorer")}>📁</div>
            <div class="act ${this.activeActivity === "search" ? "active" : ""}" title="Search" @click=${() => this.setActivity("search")}>🔎</div>
            <div class="act ${this.activeActivity === "entity" ? "active" : ""}" title="Entity" @click=${() => this.setActivity("entity")}>🗂️</div>
          </div>

          <div class="sidebar">
            <div class="sidebarHeader">
              <div class="explorerTitle">
                ${this.activeActivity === "explorer"
                  ? "Explorer"
                  : this.activeActivity === "search"
                    ? "Search"
                    : "Entity"}
              </div>
            </div>
            ${this.renderSidebarContent()}
          </div>

          <div class="editor">
            <div class="tabs">
              ${this.tabs.length === 0
                ? html`<div class="tab active">Welcome</div>`
                : this.tabs.map(
                    (t) => html`
                      <div class="tab ${t.path === this.activePath ? "active" : ""}" @click=${() => this.switchTab(t.path)}>
                        <span>${t.name}</span>
                        ${t.dirty ? html`<span class="dot" title="Unsaved"></span>` : nothing}
                        <button
                          class="tabClose"
                          type="button"
                          title="Close"
                          @click=${(e: Event) => this.handleCloseTab(e, t.path)}
                        >
                          ✕
                        </button>
                      </div>
                    `
                  )}
            </div>

            <div class="content">
              <div class="crumbs">
                <div>${activeTab ? `/config/${activeTab.path}` : "Apri un file dall’Explorer"}</div>
                <div style="display:flex; gap:8px;">
                  <button class="btn" ?disabled=${!this.activePath} @click=${this.save}>Save</button>
                  <button class="btn primary" ?disabled=${!this.activePath} @click=${this.save}>Save All</button>
                </div>
              </div>

              <div class="editorWrap">
                <div class="gutter" ${ref((el) => (this.gutterRef = el))}>${this.renderLineNumbers()}</div>
                <div class="codeWrap">
                  <div class="code" ${ref((el) => (this.codeRef = el))}>${this.renderHighlighted()}</div>
                  <textarea
                    ${ref((el) => (this.editorRef = el))}
                    .value=${this.content}
                    placeholder="Seleziona un file a sinistra…"
                    @scroll=${this.syncScroll}
                    @input=${this.handleInput}
                    @keyup=${this.handleCursorMove}
                    @keydown=${this.handleEditorKeyDown}
                    @click=${this.handleCursorMove}
                    @mouseup=${this.handleCursorMove}
                    @select=${this.handleCursorMove}
                    @focus=${() => this.startCursorTracking()}
                    @blur=${() => this.stopCursorTracking()}
                  ></textarea>
                </div>
              </div>

              <div style="font-size:12px; opacity:.75;">
                Hint: Explorer e editor usano /api/tree e /api/file (PUT) sull'ingress corrente.
              </div>
            </div>
          </div>
        </div>

        ${this.toastMessage
          ? html`<div class="toastContainer">
              <div class="toast ${this.toastType === "error" ? "error" : ""}">${this.toastMessage}</div>
            </div>`
          : nothing}

        ${this.newItemKind
          ? html`
              <div class="modalBackdrop" @click=${() => this.cancelNewItem()}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                  <h3>${this.newItemKind === "file" ? "New file" : "New folder"}</h3>
                  <label>
                    Name
                    <input
                      type="text"
                      .value=${this.newItemName}
                      @input=${(e: Event) => (this.newItemName = (e.target as HTMLInputElement).value)}
                      placeholder=${this.newItemKind === "file" ? "config" : "my_folder"}
                    />
                  </label>
                  ${this.newItemKind === "file"
                    ? html`<label>
                        Extension
                        <input
                          type="text"
                          .value=${this.newItemExt}
                          @input=${(e: Event) => (this.newItemExt = (e.target as HTMLInputElement).value)}
                          placeholder="yaml"
                        />
                      </label>`
                    : nothing}
                  <div class="actions">
                    <button class="btn" @click=${() => this.cancelNewItem()}>Cancel</button>
                    <button class="btn primary" @click=${() => this.createNewItem()}>Create</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        <div class="statusbar">
          <div>${this.status}</div>
          <div class="version">v${this.appVersion}</div>
          <div class="right">
            <button class="statusToggle" @click=${() => (this.autoIndentEnabled = !this.autoIndentEnabled)}>
              Auto-indent: ${this.autoIndentEnabled ? "On" : "Off"}
            </button>
            <span>Ln ${this.cursorLine}</span>
            <span>Col ${this.cursorCol}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Lit</span>
          </div>
        </div>
      </div>
    `;
  }
}
