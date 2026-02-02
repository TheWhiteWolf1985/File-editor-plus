export type ImagePreviewOverlayOptions = {
  srcUrl: string;
  filename: string;
  sizeBytes?: number;
  ext?: string;
  onError?: (message?: string) => void;
};

const STYLE = `
.fep-img-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:99999;}
.fep-img-panel{background:var(--panel-color,#1f1f1f);color:var(--text-color,#f5f5f5);border:1px solid var(--border-color,#333);border-radius:10px;max-width:92vw;max-height:92vh;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.45);position:relative;display:grid;grid-template-rows:auto 1fr auto;min-width:320px;}
.fep-img-header{display:flex;align-items:center;padding:10px 14px;gap:10px;background:var(--panel-strong,#262626);border-bottom:1px solid var(--border-color,#333);}
.fep-img-title{font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fep-img-close{border:none;background:transparent;color:inherit;font-size:18px;cursor:pointer;}
.fep-img-body{padding:12px 14px;overflow:auto;display:grid;gap:10px;justify-items:center;}
.fep-img-preview{max-width:88vw;max-height:68vh;object-fit:contain;border:1px solid var(--border-color,#333);border-radius:6px;background:var(--code-bg,#1e1e1e);}
.fep-img-meta{width:100%;display:grid;gap:6px;font-size:var(--font-size-sm,0.9rem);} 
.fep-img-row{display:flex;gap:8px;} 
.fep-img-label{width:90px;color:var(--muted-color,#aaa);flex-shrink:0;text-align:right;} 
.fep-img-value{flex:1;word-break:break-all;font-family:"JetBrains Mono","Fira Code",monospace;}
`;

export function openImagePreviewOverlay(opts: ImagePreviewOverlayOptions): void {
  const { srcUrl, filename, sizeBytes, ext, onError } = opts;

  const overlay = document.createElement("div");
  overlay.className = "fep-img-overlay";
  const style = document.createElement("style");
  style.textContent = STYLE;
  overlay.appendChild(style);

  const panel = document.createElement("div");
  panel.className = "fep-img-panel";
  overlay.appendChild(panel);

  const header = document.createElement("div");
  header.className = "fep-img-header";
  const title = document.createElement("div");
  title.className = "fep-img-title";
  title.textContent = filename || "Anteprima";
  const closeBtn = document.createElement("button");
  closeBtn.className = "fep-img-close";
  closeBtn.setAttribute("aria-label", "Chiudi anteprima");
  closeBtn.textContent = "✕";
  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const body = document.createElement("div");
  body.className = "fep-img-body";
  const img = document.createElement("img");
  img.className = "fep-img-preview";
  img.src = srcUrl;
  body.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "fep-img-meta";
  const rows: Array<[string, string]> = [
    ["Nome", filename || "—"],
    ["Estensione", ext || (filename.split(".").pop() || "")],
    ["Dimensioni", "—"],
    ["Peso", formatSize(sizeBytes)],
  ];
  const valueEls: HTMLElement[] = [];
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    row.className = "fep-img-row";
    const l = document.createElement("div");
    l.className = "fep-img-label";
    l.textContent = label;
    const v = document.createElement("div");
    v.className = "fep-img-value";
    v.textContent = value || "—";
    valueEls.push(v);
    row.appendChild(l);
    row.appendChild(v);
    meta.appendChild(row);
  }
  body.appendChild(meta);
  panel.appendChild(body);

  const close = (reason?: string | Event) => {
    window.removeEventListener("keydown", escListener, true);
    overlay.remove();
    if (onError && typeof reason === "string") {
      onError(reason);
    }
  };

  img.onload = () => {
    valueEls[2].textContent = `${img.naturalWidth}×${img.naturalHeight}px`;
  };
  img.onerror = () => {
    valueEls[2].textContent = "Errore";
    close("Impossibile caricare anteprima immagine");
  };
  const escListener = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };
  window.addEventListener("keydown", escListener, true);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", () => close());

  document.body.appendChild(overlay);
}

function formatSize(bytes?: number) {
  if (bytes == null || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 2 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 2 : 1)} MB`;
}
