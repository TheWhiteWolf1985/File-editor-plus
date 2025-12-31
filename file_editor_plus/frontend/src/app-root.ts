import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

type TreeItem = { name: string; path: string; type: "dir" | "file" };

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = css`
    :host { display: block; height: 100vh; font-family: system-ui, sans-serif; }
    .wrap { display: grid; grid-template-columns: 320px 1fr; height: 100%; }
    .left { border-right: 1px solid #ddd; padding: 12px; overflow: auto; }
    .right { padding: 12px; display: grid; grid-template-rows: auto 1fr auto; gap: 8px; }
    .path { font-size: 12px; opacity: 0.75; }
    ul { list-style: none; padding: 0; margin: 8px 0 0; }
    li { padding: 6px 8px; border-radius: 8px; cursor: pointer; }
    li:hover { background: #f3f3f3; }
    .dir { font-weight: 600; }
    textarea { width: 100%; height: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; padding: 10px; border: 1px solid #ddd; border-radius: 10px; }
    button { padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; background: white; cursor: pointer; }
    button:hover { background: #f6f6f6; }
    .status { font-size: 12px; opacity: 0.8; }
    .row { display:flex; gap:8px; align-items:center; justify-content:space-between; }
  `;

  @state() cwd = "";
  @state() items: TreeItem[] = [];
  @state() selectedFile: string | null = null;
  @state() content = "";
  @state() status = "Ready";

  connectedCallback(): void {
    super.connectedCallback();
    this.loadTree("");
  }

  async loadTree(path: string) {
    this.status = "Loading tree...";
    const res = await fetch(`api/tree?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      this.status = `Tree error: ${res.status}`;
      return;
    }
    const data = await res.json();
    this.cwd = data.path ?? "";
    this.items = data.items ?? [];
    this.status = "Ready";
  }

  async openFile(path: string) {
    this.status = "Opening file...";
    const res = await fetch(`api/file?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      this.status = `Open error: ${res.status}`;
      return;
    }
    const data = await res.json();
    this.selectedFile = data.path;
    this.content = data.content ?? "";
    this.status = "Ready";
  }

  async saveFile() {
    if (!this.selectedFile) return;
    this.status = "Saving...";
    const res = await fetch(`api/file?path=${encodeURIComponent(this.selectedFile)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: this.content })
    });
    if (!res.ok) {
      this.status = `Save error: ${res.status}`;
      return;
    }
    const data = await res.json();
    this.status = data.backup ? `Saved (backup: ${data.backup})` : "Saved";
    setTimeout(() => (this.status = "Ready"), 1500);
  }

  goUp() {
    if (!this.cwd) return;
    const parts = this.cwd.split("/").filter(Boolean);
    parts.pop();
    this.loadTree(parts.join("/"));
  }

  render() {
    return html`
      <div class="wrap">
        <div class="left">
          <div class="row">
            <div>
              <div><b>/config</b></div>
              <div class="path">${this.cwd ? `/${this.cwd}` : "/"}</div>
            </div>
            <div>
              <button @click=${this.goUp} ?disabled=${!this.cwd}>Up</button>
            </div>
          </div>

          <ul>
            ${this.items.map((it) => html`
              <li
                class=${it.type === "dir" ? "dir" : ""}
                @click=${() => it.type === "dir" ? this.loadTree(it.path) : this.openFile(it.path)}
              >
                ${it.type === "dir" ? "📁" : "📄"} ${it.name}
              </li>
            `)}
          </ul>
        </div>

        <div class="right">
          <div class="row">
            <div class="path">${this.selectedFile ? `/${this.selectedFile}` : "No file selected"}</div>
            <button @click=${this.saveFile} ?disabled=${!this.selectedFile}>Save</button>
          </div>

          <textarea
            .value=${this.content}
            @input=${(e: Event) => (this.content = (e.target as HTMLTextAreaElement).value)}
            placeholder="Seleziona un file a sinistra…"
          ></textarea>

          <div class="status">${this.status}</div>
        </div>
      </div>
    `;
  }
}
