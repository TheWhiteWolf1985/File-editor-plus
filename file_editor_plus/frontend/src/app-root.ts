import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

type TreeItem = { name: string; path: string; type: "dir" | "file"; children?: TreeItem[] };
type Tab = { path: string; name: string; dirty: boolean };

const MOCK_TREE: TreeItem[] = [
  {
    name: "config",
    path: "",
    type: "dir",
    children: [
      { name: "configuration.yaml", path: "configuration.yaml", type: "file" },
      { name: "automations.yaml", path: "automations.yaml", type: "file" },
      {
        name: "packages",
        path: "packages",
        type: "dir",
        children: [
          { name: "lighting.yaml", path: "packages/lighting.yaml", type: "file" },
          { name: "climate.yaml", path: "packages/climate.yaml", type: "file" },
        ],
      },
      {
        name: "scripts",
        path: "scripts",
        type: "dir",
        children: [{ name: "night_mode.yaml", path: "scripts/night_mode.yaml", type: "file" }],
      },
    ],
  },
];

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
      color: #d4d4d4;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: #1e1e1e;
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

    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      border-radius: 12px;
      border: 1px solid #2a2a2a;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.4;
      outline: none;
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

  @state() expanded = new Set<string>([""]); // root expanded
  @state() activePath: string | null = null;
  @state() tabs: Tab[] = [];
  @state() content = "";
  @state() status = "Ready";

  private toggleDir(path: string) {
    const s = new Set(this.expanded);
    s.has(path) ? s.delete(path) : s.add(path);
    this.expanded = s;
  }

  private openFile(path: string) {
    const name = path.split("/").pop() || path;
    const existing = this.tabs.find((t) => t.path === path);
    if (!existing) {
      this.tabs = [...this.tabs, { path, name, dirty: false }];
    }
    this.activePath = path;

    // Mock content
    this.content = `# ${name}\n\n# TODO: collegare FastAPI\n# path: /config/${path}\n`;
    this.status = "Ready";
  }

  private closeTab(path: string) {
    const idx = this.tabs.findIndex((t) => t.path === path);
    if (idx < 0) return;
    const nextTabs = this.tabs.slice(0, idx).concat(this.tabs.slice(idx + 1));
    this.tabs = nextTabs;

    if (this.activePath === path) {
      const next = nextTabs[idx - 1] ?? nextTabs[idx] ?? null;
      this.activePath = next?.path ?? null;
      this.content = next ? this.content : "";
    }
  }

  private markDirty(val: string) {
    this.content = val;
    if (!this.activePath) return;
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath ? { ...t, dirty: true } : t
    );
  }

  private save() {
    if (!this.activePath) return;
    this.status = "Saving (mock)…";
    // Mock save delay
    setTimeout(() => {
      this.tabs = this.tabs.map((t) =>
        t.path === this.activePath ? { ...t, dirty: false } : t
      );
      this.status = "Saved (mock)";
      setTimeout(() => (this.status = "Ready"), 800);
    }, 350);
  }

  private renderTree(items: TreeItem[], depth = 0) {
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

        ${isDir && isExpanded && it.children
          ? html`<div>${this.renderTree(it.children, depth + 1)}</div>`
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
              ${this.renderTree(MOCK_TREE)}
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
                        <span style="opacity:.65; cursor:pointer;" @click=${(e: Event) => (e.stopPropagation(), this.closeTab(t.path))}>✕</span>
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

              <textarea
                .value=${this.content}
                placeholder="Seleziona un file a sinistra…"
                @input=${(e: Event) => this.markDirty((e.target as HTMLTextAreaElement).value)}
              ></textarea>

              <div style="font-size:12px; opacity:.75;">
                Hint: per ora è tutto mock. Prossimo step: collegare /api/tree e /api/file.
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
