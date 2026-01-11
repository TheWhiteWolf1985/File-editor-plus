import { html, nothing } from "lit";

type HighlightSegment = { text: string; cls?: string };

const highlightLine = (line: string): HighlightSegment[] => {
  const segments: HighlightSegment[] = [];
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
};

const renderOverlayText = (text: string) => text.replace(/\t/g, "  ").replace(/ /g, "\u00A0");

export const renderHighlighted = (text: string, diffMap?: Map<number, string>) => {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const lineNo = idx + 1;
    const diffClass = diffMap?.get(lineNo);
    const cls = diffClass ? `codeLine ${diffClass}` : "codeLine";
    const indentMatch = line.match(/^[\t ]+/);
    const indentRaw = indentMatch ? indentMatch[0] : "";
    const rest = indentRaw ? line.slice(indentRaw.length) : line;
    const indentRendered = indentRaw ? indentRaw.replace(/\t/g, "  ").replace(/ /g, "\u00A0") : "";
    const indentNode = indentRendered ? html`<span class="codeIndent">${indentRendered}</span>` : nothing;
    const tokens = highlightLine(rest).map((seg) => {
      const raw = seg.text && seg.text.length > 0 ? seg.text : " ";
      const display = renderOverlayText(raw);
      return html`<span class=${seg.cls ?? ""}>${display}</span>`;
    });
    return html`<div class=${cls} data-gutter-line=${lineNo}>${indentNode}${tokens}</div>`;
  });
};

export const renderLineNumbers = (count: number) => {
  const safeCount = Math.max(1, count);
  return Array.from({ length: safeCount }, (_, i) => String(i + 1)).join("\n");
};

export const renderLineNumbersFor = (text: string) => {
  const count = Math.max(1, text.split("\n").length);
  return renderLineNumbers(count);
};
