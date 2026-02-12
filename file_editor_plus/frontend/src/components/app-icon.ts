import { LitElement, css, nothing, svg, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

type IconRenderer = () => ReturnType<typeof svg>;

const ICONS: Record<string, IconRenderer> = {
  "folder-open": () => svg`
    <path d="M3 8.5h6l2 2h10v7.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" />
  `,
  search: () => svg` <circle cx="11" cy="11" r="7" /><path d="m20 20-4.2-4.2" /> `,
  "git-branch": () => svg`
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="5" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M8 5h6" />
    <path d="M18 7v10" />
    <path d="M8 5v10a4 4 0 0 0 4 4h4" />
  `,
  settings: () => svg`
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z" />
  `,
  sun: () => svg`
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  `,
  moon: () => svg` <path d="M21 13a9 9 0 1 1-10-10 7.5 7.5 0 0 0 10 10z" /> `,
  "file-plus": () => svg`
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M12 12v6M9 15h6" />
  `,
  "folder-plus": () => svg`
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M12 11v6M9 14h6" />
  `,
  upload: () => svg`
    <path d="M12 16V5" />
    <path d="m8 9 4-4 4 4" />
    <path d="M4 17.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
  `,
  folder: () => svg` <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> `,
  file: () => svg`
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  `,
  "chevron-right": () => svg` <path d="m9 6 6 6-6 6" /> `,
  "chevron-down": () => svg` <path d="m6 9 6 6 6-6" /> `,
  save: () => svg`
    <path d="M5 4h12l2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M7 4v6h8V4" />
    <path d="M8 17h8" />
  `,
  download: () => svg`
    <path d="M12 4v10" />
    <path d="m8 10 4 4 4-4" />
    <path d="M4 18v2h16v-2" />
  `,
  "save-all": () => svg`
    <rect x="4" y="6" width="10" height="12" rx="2" />
    <rect x="10" y="3" width="10" height="12" rx="2" />
    <path d="M12 7h6" />
  `,
  undo: () => svg`
    <path d="M9 7H4v5" />
    <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8" />
  `,
  redo: () => svg`
    <path d="M15 7h5v5" />
    <path d="M20 12a8 8 0 1 1-2.4-5.7L20 8" />
  `,
  cut: () => svg`
    <circle cx="6" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <path d="M8 8l10 10" />
    <path d="M8 16 18 6" />
  `,
  copy: () => svg`
    <rect x="9" y="9" width="10" height="10" rx="2" />
    <rect x="5" y="5" width="10" height="10" rx="2" />
  `,
  paste: () => svg`
    <rect x="6" y="6" width="12" height="14" rx="2" />
    <path d="M9 4h6v4H9z" />
    <path d="M10 12h6M10 15h6" />
  `,
  "check-square": () => svg`
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="m8 12 3 3 5-6" />
  `,
  square: () => svg` <rect x="4" y="4" width="16" height="16" rx="2" /> `,
  refresh: () => svg`
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  `,
  columns: () => svg`
    <rect x="3" y="5" width="8" height="14" rx="1.5" />
    <rect x="13" y="5" width="8" height="14" rx="1.5" />
  `,
  cloud: () => svg`
    <path d="M7 18h10a4 4 0 0 0 .2-8A5.5 5.5 0 0 0 6.7 8.3 4.5 4.5 0 0 0 7 18z" />
  `,
  edit: () => svg`
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M12 6l4 4" />
  `,
  plus: () => svg` <path d="M12 5v14M5 12h14" /> `,
  trash: () => svg`
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M7 7l1 12h8l1-12" />
  `,
  wrench: () => svg`
    <path d="M21 7.5a5 5 0 0 1-6.4 4.8L8 19l-3-3 6.7-6.6A5 5 0 0 1 16.5 3L14 5.5 18.5 10 21 7.5z" />
  `,
  puzzle: () => svg`
    <path d="M8 8V5a2 2 0 1 1 4 0v3h3a2 2 0 1 1 0 4h-3v3a2 2 0 1 1-4 0v-3H5a2 2 0 1 1 0-4z" />
  `,
  monitor: () => svg`
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16v4" />
  `,
  power: () => svg`
    <path d="M12 3v7" />
    <path d="M6.3 6.3a7.5 7.5 0 1 0 11.4 0" />
  `,
  indent: () => svg`
    <path d="M3 7h8M3 11h12M3 15h8M3 19h12" />
    <path d="m15 13 3 3 3-3" />
  `,
  wifi: () => svg`
    <path d="M5 9a11 11 0 0 1 14 0" />
    <path d="M8 12a7 7 0 0 1 8 0" />
    <path d="M11 15a3 3 0 0 1 2 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  `,
  "alert-circle": () => svg` <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /> `,
  x: () => svg` <path d="m6 6 12 12M18 6 6 18" /> `,
  palette: () => svg`
    <path d="M12 3a9 9 0 1 0 0 18h1.2a2.8 2.8 0 1 0 0-5.6h-1.5a1.4 1.4 0 1 1 0-2.8H14a5 5 0 0 0 0-10z" />
    <circle cx="7.5" cy="10" r="1" />
    <circle cx="9.5" cy="7" r="1" />
    <circle cx="13.5" cy="7" r="1" />
    <circle cx="15.5" cy="10" r="1" />
  `,
};

@customElement("app-icon")
export class AppIcon extends LitElement {
  @property({ type: String }) name = "file";
  @property({ type: Number }) size = 16;

  static styles = css`
    :host {
      display: inline-flex;
      width: var(--app-icon-size, 16px);
      height: var(--app-icon-size, 16px);
      align-items: center;
      justify-content: center;
      line-height: 0;
      flex: 0 0 auto;
      color: inherit;
      vertical-align: middle;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    svg * {
      vector-effect: non-scaling-stroke;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.syncSizeVar();
  }

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (!this.hasUpdated || changedProperties.has("size")) {
      this.syncSizeVar();
    }
  }

  private syncSizeVar() {
    const normalizedSize = Number.isFinite(this.size) && this.size > 0 ? this.size : 16;
    this.style.setProperty("--app-icon-size", `${normalizedSize}px`);
  }

  render() {
    const draw = ICONS[this.name] ?? ICONS.file;
    const iconTitle = (this.getAttribute("title") || "").trim();
    const ariaLabel = (this.getAttribute("aria-label") || "").trim();
    const hasA11yLabel = Boolean(iconTitle || ariaLabel);
    const computedAriaLabel = ariaLabel || iconTitle;

    return svg`
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        role=${hasA11yLabel ? "img" : "presentation"}
        aria-hidden=${hasA11yLabel ? "false" : "true"}
        aria-label=${hasA11yLabel ? computedAriaLabel : nothing}
      >
        ${iconTitle ? svg`<title>${iconTitle}</title>` : nothing}
        ${draw()}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-icon": AppIcon;
  }
}
