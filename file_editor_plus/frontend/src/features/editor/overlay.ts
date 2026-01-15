import { html, nothing } from "lit";

type HighlightSegment = { text: string; cls?: string };

type HighlightOptions = {
  diffMap?: Map<number, string>;
  showGuides?: boolean;
  indentSize?: number;
  skipCommentGuides?: boolean;
  activeSegmentId?: string | null;
};

type LineInfo = { lineNo: number; level: number; eligible: boolean };
export type IndentSegment = { id: string; level: number; start: number; end: number };

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

const computeLineInfo = (lines: string[], indentSize: number, skipCommentGuides: boolean): LineInfo[] =>
  lines.map((line, idx) => {
    const indentMatch = line.match(/^[\t ]+/);
    const indentRaw = indentMatch ? indentMatch[0] : "";
    const indentSpaces = indentRaw
      ? indentRaw.split("").reduce((acc, ch) => acc + (ch === "\t" ? indentSize : 1), 0)
      : 0;
    const level = Math.max(0, Math.floor(indentSpaces / indentSize));
    const trimmed = line.trim();
    const eligible = level > 0 && trimmed !== "" && !(skipCommentGuides && trimmed.startsWith("#"));
    return { lineNo: idx + 1, level, eligible };
  });

export const computeIndentSegments = (
  text: string,
  indentSize: number,
  skipCommentGuides: boolean
): IndentSegment[] => {
  const lines = text.split("\n");
  const info = computeLineInfo(lines, indentSize, skipCommentGuides);
  const open = new Map<number, { start: number }>();
  const segments: IndentSegment[] = [];
  const closeLevelsAbove = (level: number, currentLine: number) => {
    const levels = Array.from(open.keys()).filter((l) => l > level);
    levels.sort((a, b) => b - a);
    levels.forEach((lvl) => {
      const seg = open.get(lvl);
      if (seg) {
        const end = Math.max(seg.start, currentLine - 1);
        segments.push({ id: `${lvl}-${seg.start}-${end}`, level: lvl, start: seg.start, end });
      }
      open.delete(lvl);
    });
  };

  for (const line of info) {
    closeLevelsAbove(line.level, line.lineNo);
    if (line.eligible) {
      if (!open.has(line.level)) {
        open.set(line.level, { start: line.lineNo });
      }
    }
  }
  const lastLine = info.length > 0 ? info[info.length - 1].lineNo : 0;
  closeLevelsAbove(-1, lastLine + 1);
  return segments;
};

export const renderHighlighted = (text: string, options?: HighlightOptions) => {
  const diffMap = options?.diffMap;
  const showGuides = options?.showGuides ?? false;
  const indentSize = options?.indentSize ?? 2;
  const skipCommentGuides = options?.skipCommentGuides ?? true;
  const activeSegmentId = options?.activeSegmentId ?? null;
  const lines = text.split("\n");
  const lineInfo = computeLineInfo(lines, indentSize, skipCommentGuides);
  const segments = showGuides ? computeIndentSegments(text, indentSize, skipCommentGuides) : [];

  const findSegmentId = (lineNo: number, level: number): string | null => {
    const seg = segments.find((s) => s.level === level && s.start <= lineNo && s.end >= lineNo);
    return seg ? seg.id : null;
  };

  return lines.map((line, idx) => {
    const lineNo = idx + 1;
    const info = lineInfo[idx];
    const indentLevel = info?.level ?? 0;
    const eligibleGuide = showGuides && info?.eligible === true;
    const segId = eligibleGuide ? findSegmentId(lineNo, indentLevel) : null;
    const diffClass = diffMap?.get(lineNo);
    let cls = diffClass ? `codeLine ${diffClass}` : "codeLine";
    if (eligibleGuide) cls += " hasGuides";
    if (segId && activeSegmentId && segId === activeSegmentId) cls += " is-active";
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
    const style = eligibleGuide ? `--line-indent-level:${indentLevel};` : nothing;
    return html`<div class=${cls} data-gutter-line=${lineNo} style=${style} data-seg-id=${segId ?? nothing}>${indentNode}${tokens}</div>`;
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
