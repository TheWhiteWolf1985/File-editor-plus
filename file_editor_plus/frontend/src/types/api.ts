export type ThemeMode = "auto" | "dark" | "light";
export type UserConfig = {
  font_base_rem?: number;
  theme_mode?: ThemeMode;
  toolbar_visible?: boolean;
  show_indent_guides?: boolean;
};
export type Snippet = { id: string; name: string; description: string; content: string };
export type SearchMatch = { line: number; column: number; preview: string; match_len: number; start?: number };
export type SearchResult = { path: string; mtime: number; size: number; matches: SearchMatch[]; matches_count: number };
export type SearchSummary = { files_scanned: number; files_with_matches: number; matches_total: number };
export type MdiIcon = { name: string; codepoint: string };
