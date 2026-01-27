import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

type ImageMeta = {
  width?: number;
  height?: number;
  size?: number | null;
};

@customElement("image-preview-modal")
export class ImagePreviewModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) src: string | null = null;
  @property({ type: String }) path: string | null = null;
  @property({ type: String }) name: string | null = null;
  @property({ type: Number }) size: number | null = null;

  private meta: ImageMeta = {};

  static styles = css`
    :host {
      position: relative;
      z-index: 9999;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
    }
    .modal {
      background: var(--panel-color, #1f1f1f);
      color: var(--text-color, #eee);
      border: 1px solid var(--border-color, #333);
      border-radius: 10px;
      max-width: 92vw;
      max-height: 80vh;
      width: 720px;
      overflow: hidden;
      display: grid;
      grid-template-rows: auto 1fr auto;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    }
    .header {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      gap: 10px;
      background: var(--panel-strong, #262626);
      border-bottom: 1px solid var(--border-color, #333);
    }
    .title {
      font-weight: 600;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .closeBtn {
      border: none;
      background: transparent;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
    }
    .body {
      padding: 12px 14px;
      overflow: auto;
      display: grid;
      gap: 10px;
      justify-items: center;
    }
    .preview {
      max-width: 90vw;
      max-height: 70vh;
      object-fit: contain;
      border: 1px solid var(--border-color, #333);
      border-radius: 6px;
      background: var(--code-bg, #1e1e1e);
    }
    .meta {
      width: 100%;
      display: grid;
      gap: 6px;
      font-size: var(--font-size-sm, 0.85rem);
    }
    .row {
      display: flex;
      gap: 8px;
    }
    .label {
      width: 90px;
      color: var(--muted-color, #aaa);
      flex-shrink: 0;
      text-align: right;
    }
    .value {
      flex: 1;
      word-break: break-all;
      font-family: "JetBrains Mono", "Fira Code", monospace;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.onKeyDown);
  }

  disconnectedCallback(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    super.disconnectedCallback();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this.emitClose();
    }
  };

  private emitClose() {
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  private handleImgLoad(e: Event) {
    const img = e.target as HTMLImageElement;
    this.meta = { width: img.naturalWidth, height: img.naturalHeight, size: this.size };
    this.requestUpdate();
  }

  private handleImgError() {
    this.meta = {};
    this.dispatchEvent(new CustomEvent("error", { bubbles: true, composed: true }));
  }

  private formatSize(size?: number | null): string {
    if (size == null || size < 0) return "—";
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  render() {
    if (!this.open) return nothing;
    return html`<div class="backdrop" @click=${this.emitClose}>
      <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
        <div class="header">
          <div class="title">${this.name || this.path || "Image preview"}</div>
          <button class="closeBtn" aria-label="Chiudi anteprima" @click=${this.emitClose}>✕</button>
        </div>
        <div class="body">
          ${this.src
            ? html`<img class="preview" src=${this.src} @load=${this.handleImgLoad} @error=${this.handleImgError} />`
            : html`<div>Immagine non disponibile</div>`}
          <div class="meta">
            <div class="row">
              <div class="label">Nome</div>
              <div class="value">${this.name || "—"}</div>
            </div>
            <div class="row">
              <div class="label">Path</div>
              <div class="value">${this.path || "—"}</div>
            </div>
            <div class="row">
              <div class="label">Dimensioni</div>
              <div class="value">
                ${this.meta.width && this.meta.height ? `${this.meta.width}×${this.meta.height}px` : "—"}
              </div>
            </div>
            <div class="row">
              <div class="label">Peso</div>
              <div class="value">${this.formatSize(this.size ?? this.meta.size)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "image-preview-modal": ImagePreviewModal;
  }
}
