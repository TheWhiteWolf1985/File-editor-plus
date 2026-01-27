export type TreeItem = { name: string; path: string; type: "dir" | "file"; writable?: boolean | null; children?: TreeItem[] };
export type Tab = {
  path: string;
  name: string;
  dirty: boolean;
  bufferId?: string;
  bufferSize?: number;
  lastEditAt?: string;
  view?: { scrollTop?: number; selStart?: number; selEnd?: number };
};
export type DiffHunk = {
  type: "insert" | "delete" | "replace" | "equal";
  base_start: number;
  base_len: number;
  mod_start: number;
  mod_len: number;
};
export type DiffSummary = { added: number; removed: number; changed: number };
export type SuggestItem =
  | { type: "entity"; value: string }
  | { type: "mdi"; value: string; codepoint: string };
