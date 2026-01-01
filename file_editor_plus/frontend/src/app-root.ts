import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

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
    }
    .menus {
      display: flex;
      gap: 12px;
      opacity: 0.9;
    }
    .menus span {
      cursor: default;
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

    /* Sidebar */
    .sidebar {
      background: #252526;
      border-right: 1px solid #2a2a2a;
      overflow: auto;
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
    }
    .gutter {
      width: 52px;
      padding: 10px 8px;
      background: #1a1a1a;
      color: #7c7c7c;
      border: 1px solid #2a2a2a;
      border-right: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      line-height: 1.4;
      text-align: right;
      white-space: pre;
      box-sizing: border-box;
      overflow: hidden;
      border-radius: 12px 0 0 12px;
    }
    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      border-radius: 0 12px 12px 0;
      border: 1px solid #2a2a2a;
      border-left: none;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.4;
      outline: none;
      box-sizing: border-box;
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
  `;

  private apiBase = (() => {
    const base = new URL("./", window.location.href).pathname;
    return base.endsWith("/") ? base : `${base}/`;
  })();

  @state() expanded = new Set<string>([""]); // root expanded
  @state() activePath: string | null = null;
  @state() tabs: Tab[] = [];
  @state() content = "";
  @state() status = "Ready";
  @state() rootItems: TreeItem[] = [];
  @state() treeData: Record<string, TreeItem[]> = {};
  @state() lineCount = 1;
  private loadedPaths = new Set<string>();
  private loadingPaths = new Set<string>();

  connectedCallback() {
    super.connectedCallback();
    if (!this.loadedPaths.has("")) {
      this.loadTree("");
    }
  }

  private async loadTree(path: string) {
    if (this.loadedPaths.has(path) || this.loadingPaths.has(path)) {
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
      await this.requestUpdate();
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
      this.tabs = this.tabs.map((t) => (t.path === path ? { ...t, dirty: false } : t));
      this.status = "Ready";
      await this.requestUpdate();
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
    }
    console.debug("[app-root] closeTab: closed", path, { remaining: this.tabs.map((t) => t.path), active: this.activePath });
    this.requestUpdate();
  }

  private markDirty(val: string) {
    this.content = val;
    this.lineCount = Math.max(1, this.content.split("\n").length);
    if (!this.activePath) return;
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath ? { ...t, dirty: true } : t
    );
  }

  private handleCloseTab(e: Event, path: string) {
    e.stopPropagation();
    e.preventDefault();
    console.debug("[app-root] close tab click", path, { active: this.activePath, tabs: this.tabs.length });
    this.closeTab(path);
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
            <span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Run</span><span>Help</span>
          </div>
          <div class="title">File Editor Plus</div>
        </div>

        <div class="main">
          <div class="activity">
            <div class="act active" title="Explorer">📁</div>
            <div class="act" title="Search">🔎</div>
            <div class="act" title="Source Control">🌿</div>
            <div class="act" title="Extensions">🧩</div>
          </div>

          <div class="sidebar">
            <div class="sidebarHeader">
              <div class="explorerTitle">Explorer</div>
            </div>
            <div class="tree">
              ${this.renderTree("")}
            </div>
          </div>

          <div class="editor">
            <div class="tabs">
              ${this.tabs.length === 0
                ? html`<div class="tab active">Welcome</div>`
                : this.tabs.map(
                    (t) => html`
                      <div class="tab ${t.path === this.activePath ? "active" : ""}" @click=${() => (this.activePath = t.path)}>
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
                <div class="gutter">${this.renderLineNumbers()}</div>
                <textarea
                  .value=${this.content}
                  placeholder="Seleziona un file a sinistra…"
                  @input=${(e: Event) => this.markDirty((e.target as HTMLTextAreaElement).value)}
                ></textarea>
              </div>

              <div style="font-size:12px; opacity:.75;">
                Hint: Explorer e editor usano /api/tree e /api/file (PUT) sull'ingress corrente.
              </div>
            </div>
          </div>
        </div>

        <div class="statusbar">
          <div>${this.status}</div>
          <div class="right">
            <span>UTF-8</span>
            <span>LF</span>
            <span>Lit</span>
          </div>
        </div>
      </div>
    `;
  }
}
