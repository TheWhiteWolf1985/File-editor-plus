import { LitElement, css, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { HAClient, type HassState } from "./ha-client";

type TreeItem = { name: string; path: string; type: "dir" | "file"; children?: TreeItem[] };
type Tab = { path: string; name: string; dirty: boolean };
type Snippet = { id: string; name: string; description: string; content: string };
type SearchMatch = { line: number; column: number; preview: string; match_len: number };
type SearchResult = { path: string; mtime: number; size: number; matches: SearchMatch[]; matches_count: number };
type SearchSummary = { files_scanned: number; files_with_matches: number; matches_total: number };
type DiffHunk = { type: "insert" | "delete" | "replace" | "equal"; base_start: number; base_len: number; mod_start: number; mod_len: number };
type DiffSummary = { added: number; removed: number; changed: number };
type MdiIcon = { name: string; codepoint: string };
type SuggestItem =
  | { type: "entity"; value: string }
  | { type: "mdi"; value: string; codepoint: string };

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 100%;
      width: 100%;
      overflow: hidden;
      position: relative;
      color: var(--text-color);
      font-family: Roboto, "Noto Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      --font-size-xs: 0.6875rem;
      --font-size-sm: 0.75rem;
      --font-size-md: 0.8125rem;
      --font-size-base: 0.875rem;
      --font-size-lg: 1rem;
      font-size: var(--font-size-base);
      background: var(--bg-color);
      box-sizing: border-box;
      --bg-color: #1e1e1e;
      --panel-color: #252526;
      --panel-strong: #2d2d2d;
      --border-color: #2a2a2a;
      --hover-color: #3a3a3a;
      --text-color: #d4d4d4;
      --muted-color: #c8c8c8;
      --activity-color: #333333;
      --accent-color: #0e639c;
      --accent-hover: #1177bb;
      --card-color: #1f1f1f;
      --input-bg: #1e1e1e;
      --toast-bg: #2d2d2d;
      --toast-border: #3a3a3a;
      --error-bg: #3a1f1f;
      --error-border: #c74c4c;
      --status-bg: #007acc;
      --gutter-bg: #1a1a1a;
      --code-bg: #1e1e1e;
      --menu-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      --toast-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      --modal-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      --tree-hover: #2a2d2e;
      --tree-active: #37373d;
      --entity-error-text: #f6dada;
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
      border-bottom: 1px solid var(--border-color);
      background: var(--panel-strong);
      user-select: none;
      font-size: var(--font-size-sm);
      position: relative;
      overflow: visible;
      z-index: 30;
    }
    .menus {
      display: flex;
      gap: 12px;
      opacity: 0.9;
      position: relative;
    }
    .menus span {
      cursor: default;
    }
    .menuItem {
      position: relative;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .menuItem:hover,
    .menuItem.open {
      background: var(--hover-color);
    }
    .menuPopup {
      position: absolute;
      top: 30px;
      left: 0;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      box-shadow: var(--menu-shadow);
      border-radius: 8px;
      min-width: 180px;
      padding: 6px 0;
      z-index: 20;
      overflow: visible;
    }
    .menuItemRow {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .menuItemRow:hover {
      background: var(--hover-color);
    }
    .menuIcon {
      width: 18px;
      text-align: center;
      opacity: 0.85;
    }
    .menuDivider {
      height: 1px;
      margin: 6px 0;
      background: #3a3a3a;
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
      position: relative;
    }

    /* Activity bar */
    .activity {
      background: var(--activity-color);
      border-right: 1px solid var(--border-color);
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
      font-size: 1.5em;
    }
    .act.active {
      background: var(--panel-color);
      outline: 1px solid var(--border-color);
      opacity: 1;
    }
    .sidebarContent {
      padding: 8px 6px 12px;
      font-size: var(--font-size-md);
      overflow-x: hidden;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
      align-content: start;
    }
    .searchPane {
      display: grid;
      gap: 8px;
    }
    .searchRow {
      display: flex;
      gap: 8px;
    }
    .searchInput {
      width: 100%;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--input-bg);
      color: var(--text-color);
      box-sizing: border-box;
    }
    .searchControls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .searchSummary {
      font-size: var(--font-size-sm);
      opacity: 0.8;
    }
    .searchResults {
      display: grid;
      gap: 8px;
      max-height: calc(100vh - 220px);
      overflow: auto;
      padding-right: 4px;
    }
    .searchFile {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--card-color);
      padding: 6px;
    }
    .searchFileHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-weight: 600;
      margin-bottom: 4px;
      font-size: var(--font-size-sm);
      word-break: break-all;
    }
    .searchMatches {
      display: grid;
      gap: 4px;
    }
    .searchMatch {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      padding: 6px;
      border-radius: 6px;
      background: var(--panel-color);
      cursor: pointer;
      border: 1px solid transparent;
    }
    .searchMatch:hover {
      border-color: var(--border-color);
      background: var(--hover-color);
    }
    .lineTag {
      font-size: var(--font-size-xs);
      opacity: 0.8;
      color: var(--muted-color);
    }
    .searchMatch .preview {
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .searchStatus {
      font-size: var(--font-size-sm);
      opacity: 0.8;
      padding: 6px;
    }
    .searchStatus.muted {
      color: var(--muted-color);
    }
    .entityPane {
      display: grid;
      gap: 8px;
    }
    .entityHeader {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .entitySearch {
      width: 100%;
      margin-bottom: 2px;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--input-bg);
      color: var(--text-color);
      box-sizing: border-box;
    }
    .entityList {
      overflow: visible;
      display: grid;
      gap: 6px;
      padding-right: 0;
    }
    .entityCard {
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--card-color);
      box-sizing: border-box;
      position: relative;
      padding-bottom: 22px;
    }
    .entityName {
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .entityId {
      font-size: var(--font-size-sm);
      opacity: 0.8;
      overflow-wrap: anywhere;
    }
    .entityMeta {
      font-size: var(--font-size-sm);
      margin-top: 4px;
      overflow-wrap: anywhere;
    }
    .entityInsert {
      position: absolute;
      right: 6px;
      bottom: 6px;
      border: 1px solid var(--border-color);
      background: var(--panel-color);
      color: var(--text-color);
      border-radius: 8px;
      padding: 4px 6px;
      cursor: pointer;
      font-size: var(--font-size-xs);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      opacity: 0.9;
    }
    .entityInsert:hover {
      background: var(--hover-color);
    }
    .entityError {
      color: var(--entity-error-text);
      background: var(--error-bg);
      padding: 8px;
      border-radius: 8px;
      font-size: var(--font-size-sm);
      box-sizing: border-box;
    }
    .entityGroup {
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      overflow: hidden;
      background: #222;
    }
    .entityGroup + .entityGroup {
      margin-top: 6px;
    }
    .entityGroupHeader {
      width: 100%;
      border: none;
      background: #252526;
      color: #d4d4d4;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      cursor: pointer;
      text-align: left;
      box-sizing: border-box;
      font-size: var(--font-size-md);
    }
    .entityGroupHeader:hover {
      background: #2d2d2d;
    }
    .entityGroupTitle {
      font-weight: 600;
      text-transform: lowercase;
    }
    .entityGroupBody {
      padding: 6px;
      display: grid;
      gap: 6px;
    }
    .entityEmpty {
      padding: 8px;
      font-size: var(--font-size-sm);
      opacity: 0.75;
    }

    /* Sidebar */
    .sidebar {
      background: var(--panel-color);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .sidebarHeader {
      height: 34px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-bottom: 1px solid var(--border-color);
      font-size: var(--font-size-sm);
      letter-spacing: 0.04em;
      color: var(--muted-color);
    }
    .explorerTitle {
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .sidebarClose {
      display: none;
      margin-left: auto;
      border: none;
      background: transparent;
      color: var(--muted-color);
      cursor: pointer;
      font-size: var(--font-size-base);
      padding: 0 6px;
    }
    .sidebarClose:hover {
      color: var(--text-color);
    }
    .sidebarBackdrop {
      display: none;
    }

    .tree {
      padding: 8px 6px 12px;
      font-size: var(--font-size-md);
    }
    .treeRow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-color);
    }
    .treeRow:hover {
      background: var(--tree-hover);
    }
    .treeRow.active {
      background: var(--tree-active);
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
      background: var(--bg-color);
    }

    .tabs {
      display: flex;
      align-items: end;
      gap: 1px;
      padding: 0 8px;
      background: var(--panel-color);
      border-bottom: 1px solid var(--border-color);
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
      background: var(--panel-strong);
      color: var(--muted-color);
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .tab.active {
      background: var(--bg-color);
      color: var(--text-color);
      outline: 1px solid var(--border-color);
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
      font-size: var(--font-size-sm);
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
      font-size: var(--font-size-sm);
      opacity: 0.75;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .btn {
      background: var(--btn-bg, var(--panel-strong));
      color: var(--text-color);
      border: 1px solid var(--btn-border, var(--border-color));
      border-radius: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .btn:hover {
      background: var(--btn-hover, var(--hover-color));
    }
    .btn.primary {
      background: var(--accent-color);
      border-color: var(--accent-color);
      color: white;
    }
    .btn.primary:hover {
      background: var(--accent-hover);
    }

    .editorWrap {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: stretch;
      gap: 0;
      height: 100%;
      overflow: hidden;
      position: relative;
    }
    .splitWrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      height: 100%;
      overflow: hidden;
    }
    .splitPane {
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .gutter {
      width: 52px;
      padding: 12px 8px;
      background: var(--gutter-bg);
      color: #7c7c7c;
      border: 1px solid var(--border-color);
      border-right: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      text-align: right;
      white-space: pre;
      box-sizing: border-box;
      overflow: hidden;
      height: fit-content;
      border-radius: 12px 0 0 12px;
    }
    .codeWrap {
      position: relative;
      --editor-pad: 12px;
      --editor-pad-right: 28px;
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--border-color);
      border-left: none;
      border-radius: 0 12px 12px 0;
      background: var(--code-bg);
    }
    .code {
      position: absolute;
      top: 0;
      left: 0;
      padding: var(--editor-pad) var(--editor-pad-right) var(--editor-pad) var(--editor-pad);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      white-space: pre;
      word-wrap: normal;
      color: var(--text-color);
      pointer-events: none;
      overflow: hidden;
      min-width: 100%;
      width: max-content;
      min-height: 100%;
      box-sizing: border-box;
    }
    .codeLine {
      white-space: normal;
      min-height: 1.4em;
      line-height: 1.4;
    }
    .codeIndent {
      white-space: pre;
    }
    .codeLine.diff-insert {
      background: rgba(46, 160, 67, 0.2);
    }
    .codeLine.diff-delete {
      background: rgba(248, 81, 73, 0.2);
    }
    .codeLine.diff-replace {
      background: rgba(255, 211, 61, 0.2);
    }
    .token-key {
      color: #9cdcfe;
    }
    .token-string {
      color: #ce9178;
    }
    .token-number {
      color: #b5cea8;
    }
    .token-boolean {
      color: #4ec9b0;
    }
    .token-comment {
      color: #6a9955;
    }
    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      border-radius: 0 12px 12px 0;
      border: none;
      border-left: none;
      background: transparent;
      color: transparent;
      caret-color: #d4d4d4;
      padding: var(--editor-pad) var(--editor-pad-right) var(--editor-pad) var(--editor-pad);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      outline: none;
      box-sizing: border-box;
      overflow: auto;
      white-space: pre;
      word-wrap: normal;
      scrollbar-gutter: stable;
    }
    textarea:focus {
      border-color: #3a3a3a;
    }
    .basePre {
      width: 100%;
      height: 100%;
      margin: 0;
      border: none;
      background: transparent;
      color: transparent;
      caret-color: transparent;
      padding: var(--editor-pad) var(--editor-pad-right) var(--editor-pad) var(--editor-pad);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      outline: none;
      box-sizing: border-box;
      overflow: auto;
      white-space: pre;
      word-wrap: normal;
      scrollbar-gutter: stable;
    }

    /* Status bar */
    .statusbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      font-size: var(--font-size-sm);
      background: var(--status-bg);
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
    .statusToggle {
      border: 1px solid rgba(255, 255, 255, 0.4);
      background: transparent;
      color: inherit;
      border-radius: 8px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: var(--font-size-xs);
    }
    .statusToggle:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .snippetGrid {
      display: grid;
      gap: 10px;
      padding: 8px 6px 12px;
      width: 90%;
      box-sizing: border-box;
      overflow-x: hidden;
    }
    .snippetCard {
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px;
      background: var(--card-color);
      display: grid;
      gap: 6px;
      box-shadow: var(--menu-shadow);
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }
    .snippetHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .snippetActions {
      display: flex;
      gap: 6px;
      flex: 0 0 auto;
    }
    @media (max-width: 900px) {
      .main {
        grid-template-columns: 48px 0 1fr;
      }
      .sidebar {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 48px;
        width: min(80vw, 320px);
        transform: translateX(-110%);
        transition: transform 0.2s ease;
        z-index: 40;
        box-shadow: var(--menu-shadow);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sidebarBackdrop {
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 48px;
        right: 0;
        background: rgba(0, 0, 0, 0.3);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 30;
      }
      .sidebarBackdrop.open {
        opacity: 1;
        pointer-events: auto;
      }
      .sidebarClose {
        display: inline-flex;
      }
    }
    .snippetTitle {
      font-weight: 700;
      min-width: 0;
      flex: 1;
      overflow-wrap: anywhere;
    }
    .snippetDesc {
      font-size: var(--font-size-sm);
      color: var(--muted-color);
      overflow-wrap: anywhere;
    }
    .contextMenu {
      position: fixed;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--menu-shadow);
      padding: 6px 0;
      z-index: 400;
      min-width: 160px;
      color: var(--text-color);
    }
    .contextMenuItem {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-md);
    }
    .contextMenuItem:hover {
      background: var(--hover-color);
    }
    .suggestBox {
      position: absolute;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--menu-shadow);
      min-width: 220px;
      max-height: 220px;
      overflow: auto;
      z-index: 350;
      color: var(--text-color);
      transform: translateY(-4px) translateY(-100%);
    }
    .suggestItem {
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-sm);
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: space-between;
    }
    .suggestItemLabel {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .suggestItemIcon {
      font-family: "Material Design Icons";
      font-style: normal;
      font-weight: normal;
      font-size: 2.2em;
      opacity: 0.9;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.4em;
    }
    .suggestItem:hover,
    .suggestItem.active {
      background: var(--hover-color);
    }
    .statusbar .version {
      margin-left: 10px;
      opacity: 0.85;
      font-weight: 600;
    }

    /* Modal */
    .modalBackdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: grid;
      place-items: center;
      z-index: 200;
    }
    .modal {
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
      width: 360px;
      box-shadow: var(--modal-shadow);
      display: grid;
      gap: 12px;
    }
    .modal h3 {
      margin: 0;
      font-size: var(--font-size-lg);
    }
    .modal label {
      font-size: var(--font-size-sm);
      color: #c8c8c8;
      display: grid;
      gap: 6px;
    }
    .modal input {
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      color: var(--text-color);
      padding: 8px;
      border-radius: 8px;
      font-size: var(--font-size-md);
    }
    .modal .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .aboutModal {
      width: 420px;
      height: 360px;
      box-sizing: border-box;
    }
    .aboutHeader {
      display: grid;
      gap: 8px;
      justify-items: center;
      text-align: center;
    }
    .aboutLogo {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      background: var(--panel-color);
      border: 1px solid var(--border-color);
      object-fit: cover;
    }
    .aboutBody {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    .aboutRow {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      align-items: center;
      font-size: var(--font-size-sm);
    }
    .aboutLabel {
      opacity: 0.75;
    }
    .aboutValue a {
      color: var(--accent-color);
      text-decoration: none;
    }
    .aboutValue a:hover {
      text-decoration: underline;
    }
    .settingsTabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
    }
    .settingsTab {
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-color);
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .settingsTab.active {
      background: var(--hover-color);
      border-color: var(--border-color);
    }
    .settingsBody {
      display: grid;
      gap: 10px;
    }
    .settingsRow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .settingsLabel {
      font-weight: 600;
    }
    .settingsHint {
      font-size: var(--font-size-sm);
      opacity: 0.75;
    }
    .settingsValue {
      font-size: var(--font-size-sm);
      font-weight: 600;
    }
    .settingsRange {
      width: 100%;
    }

    /* Toast */
    .toastContainer {
      position: fixed;
      top: 112px;
      right: 12px;
      display: grid;
      gap: 8px;
      z-index: 300;
    }
    .toast {
      min-width: 275px;
      background: var(--toast-bg);
      color: var(--text-color);
      border: 1px solid var(--toast-border);
      border-radius: 10px;
      padding: 12px 16px;
      box-shadow: var(--toast-shadow);
      font-size: var(--font-size-base);
      transform: translateX(120%);
      animation: slide-in 180ms ease-out forwards, slide-out 180ms ease-in forwards;
      animation-delay: 0s, 4.8s;
    }
    .toast.error {
      border-color: var(--error-border);
      background: var(--error-bg);
      color: var(--entity-error-text);
    }
    @keyframes slide-in {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0%);
        opacity: 1;
      }
    }
    @keyframes slide-out {
      from {
        transform: translateX(0%);
        opacity: 1;
      }
      to {
        transform: translateX(120%);
        opacity: 0;
      }
    }
  `;

  private apiBase = (() => {
    const base = new URL("./", window.location.href).pathname;
    return base.endsWith("/") ? base : `${base}/`;
  })();

  static properties = {
    expanded: { state: true },
    activePath: { state: true },
    tabs: { state: true },
    content: { state: true },
    status: { state: true },
    openMenu: { state: true },
    newItemKind: { state: true },
    newItemName: { state: true },
    newItemExt: { state: true },
    activeActivity: { state: true },
    toastMessage: { state: true },
    toastType: { state: true },
    entityFilter: { state: true },
    entities: { state: true },
    entityError: { state: true },
    collapsedDomains: { state: true },
    autoIndentEnabled: { state: true },
    contextMenuOpen: { state: true },
    contextMenuX: { state: true },
    contextMenuY: { state: true },
    themeMode: { state: true },
    suggestOpen: { state: true },
    suggestItems: { state: true },
    suggestContext: { state: true },
    suggestIndex: { state: true },
    suggestTop: { state: true },
    suggestLeft: { state: true },
    snippetEditingId: { state: true },
    showSnippetModal: { state: true },
    showAboutModal: { state: true },
    showSettingsModal: { state: true },
    settingsTab: { state: true },
    settingsFontBaseRem: { state: true },
    snippetName: { state: true },
    snippetDescription: { state: true },
    snippetContent: { state: true },
    snippetSaving: { state: true },
    snippetSearchText: { state: true },
    snippetSearchField: { state: true },
    indenting: { state: true },
    snippets: { state: true },
    rootItems: { state: true },
    treeData: { state: true },
    lineCount: { state: true },
    cursorLine: { state: true },
    cursorCol: { state: true },
    searchQuery: { state: true },
    searchReplace: { state: true },
    searchCaseSensitive: { state: true },
    searchResults: { state: true },
    searchSummary: { state: true },
    searchTruncated: { state: true },
    searchLoading: { state: true },
    sidebarOpen: { state: true },
    openSnapshotText: { state: true },
    savedBaseText: { state: true },
    splitViewEnabled: { state: true },
    compareEnabled: { state: true },
    diffHunks: { state: true },
    diffSummary: { state: true },
    diffLoading: { state: true },
  };

  declare expanded: Set<string>; // root expanded
  declare activePath: string | null;
  declare tabs: Tab[];
  declare content: string;
  declare status: string;
  declare openMenu: string | null;
  declare newItemKind: "file" | "folder" | null;
  declare newItemName: string;
  declare newItemExt: string;
  declare activeActivity: "explorer" | "search" | "entity" | "snippet";
  declare toastMessage: string | null;
  declare toastType: "info" | "error";
  declare entityFilter: string;
  declare entities: Record<string, HassState>;
  declare entityError: string | null;
  declare collapsedDomains: Set<string>;
  declare autoIndentEnabled: boolean;
  declare contextMenuOpen: boolean;
  declare contextMenuX: number;
  declare contextMenuY: number;
  declare themeMode: "auto" | "dark" | "light";
  declare suggestOpen: boolean;
  declare suggestItems: SuggestItem[];
  declare suggestContext: "entity" | "mdi" | null;
  declare suggestIndex: number;
  declare suggestTop: number;
  declare suggestLeft: number;
  declare snippetEditingId: string | null;
  declare showSnippetModal: boolean;
  declare showAboutModal: boolean;
  declare showSettingsModal: boolean;
  declare settingsTab: "appearance" | "localization";
  declare settingsFontBaseRem: number;
  declare snippetName: string;
  declare snippetDescription: string;
  declare snippetContent: string;
  declare snippetSaving: boolean;
  declare snippetSearchText: string;
  declare snippetSearchField: "title" | "description";
  declare indenting: boolean;
  declare snippets: Snippet[];
  declare searchQuery: string;
  declare searchReplace: string;
  declare searchCaseSensitive: boolean;
  declare searchResults: SearchResult[];
  declare searchSummary: SearchSummary | null;
  declare searchTruncated: boolean;
  declare searchLoading: boolean;
  declare sidebarOpen: boolean;
  declare openSnapshotText: string;
  declare savedBaseText: string;
  declare splitViewEnabled: boolean;
  declare compareEnabled: boolean;
  declare diffHunks: DiffHunk[];
  declare diffSummary: DiffSummary | null;
  declare diffLoading: boolean;
  private suggestBlocked = false;
  private snippetMocks: Snippet[] = [
    { id: "mock-1", name: "Light toggle", description: "Esempio di automazione per accendere/spegnere una luce tramite switch con condizione oraria.", content: "alias: Toggle light\ntrigger:\n  - platform: state\n    entity_id: binary_sensor.motion\naction:\n  - service: light.toggle\n    target:\n      entity_id: light.living_room" },
    { id: "mock-2", name: "Presence alert", description: "Notifica push quando un dispositivo torna online in rete domestica.", content: "alias: Presence alert\ntrigger:\n  - platform: state\n    entity_id: device_tracker.phone\n    to: 'home'\naction:\n  - service: notify.mobile_app_phone\n    data:\n      message: \"Bentornato a casa!\"" },
    { id: "mock-3", name: "HVAC preset", description: "Snippet per impostare modalità comfort/eco sul clima con soglie configurabili.", content: "alias: HVAC preset\naction:\n  - service: climate.set_preset_mode\n    target:\n      entity_id: climate.living_room\n    data:\n      preset_mode: comfort" },
    { id: "mock-4", name: "Backup reminder", description: "Promemoria settimanale per eseguire il backup della configurazione di Home Assistant.", content: "alias: Backup reminder\ntrigger:\n  - platform: time\n    at: '20:00:00'\naction:\n  - service: notify.persistent_notification\n    data:\n      message: \"Ricordati il backup della config!\"" },
    { id: "mock-5", name: "Scene starter", description: "Esempio di scena per luci soffuse e musica a volume basso in salotto.", content: "alias: Scene starter\naction:\n  - service: scene.turn_on\n    target:\n      entity_id: scene.relax" },
  ];
  declare rootItems: TreeItem[];
  declare treeData: Record<string, TreeItem[]>;
  declare lineCount: number;
  declare cursorLine: number;
  declare cursorCol: number;
  private loadedPaths = new Set<string>();
  private loadingPaths = new Set<string>();
  private fileCache: Record<string, string> = {};
  private openSnapshotByPath: Record<string, string> = {};
  private savedBaseByPath: Record<string, string> = {};
  private codeRef: HTMLDivElement | null = null;
  private gutterRef: HTMLDivElement | null = null;
  private editorRef: HTMLTextAreaElement | null = null;
  private baseCodeRef: HTMLDivElement | null = null;
  private baseGutterRef: HTMLDivElement | null = null;
  private basePreRef: HTMLPreElement | null = null;
  private cursorRaf: number | null = null;
  private lastCursorLine = 1;
  private lastCursorCol = 1;
  private toastTimer: number | null = null;
  private haClient: HAClient | null = null;
  private readonly fontDefaults = { xs: 0.6875, sm: 0.75, md: 0.8125, base: 0.875, lg: 1 };
  private readonly fontBaseMin = 0.75;
  private readonly fontBaseMax = 1.125;
  private readonly fontBaseStep = 0.0625;
  private fontBaseRem = this.fontDefaults.base;
  private readonly appVersion = "0.1.81";
  private readonly iconUrl = new URL("./assets/icon.png", import.meta.url).href;
  private lastDomains = new Set<string>();
  private themeMedia: MediaQueryList | null = null;
  private diffRequestId = 0;
  private diffDebounce: number | null = null;
  private mdiSuggestCache = new Map<string, MdiIcon[]>();
  private mdiSuggestRequestId = 0;
  private pendingJump: { path: string; line: number; col: number } | null = null;
  private selectionListener = () => {
    if (!this.editorRef) return;
    const active = this.shadowRoot?.activeElement || document.activeElement;
    if (active !== this.editorRef) return;
    this.updateCursorFromPos(this.editorRef.selectionStart ?? 0, this.editorRef.value);
  };

  constructor() {
    super();
    this.expanded = new Set<string>([""]);
    this.activePath = null;
    this.tabs = [];
    this.content = "";
    this.status = "Ready";
    this.openMenu = null;
    this.newItemKind = null;
    this.newItemName = "";
    this.newItemExt = "";
    this.activeActivity = "explorer";
    this.toastMessage = null;
    this.toastType = "info";
    this.entityFilter = "";
    this.entities = {};
    this.entityError = null;
    this.collapsedDomains = new Set<string>();
    this.autoIndentEnabled = true;
    this.contextMenuOpen = false;
    this.contextMenuX = 0;
    this.contextMenuY = 0;
    this.themeMode = "auto";
    this.suggestOpen = false;
    this.suggestItems = [];
    this.suggestContext = null;
    this.suggestIndex = 0;
    this.suggestTop = 0;
    this.suggestLeft = 0;
    this.snippetEditingId = null;
    this.showSnippetModal = false;
    this.showAboutModal = false;
    this.showSettingsModal = false;
    this.settingsTab = "appearance";
    this.settingsFontBaseRem = this.fontBaseRem;
    this.snippetName = "";
    this.snippetDescription = "";
    this.snippetContent = "";
    this.snippetSaving = false;
    this.snippetSearchText = "";
    this.snippetSearchField = "title";
    this.indenting = false;
    this.snippets = [];
    this.searchQuery = "";
    this.searchReplace = "";
    this.searchCaseSensitive = false;
    this.searchResults = [];
    this.searchSummary = null;
    this.searchTruncated = false;
    this.searchLoading = false;
    this.sidebarOpen = false;
    this.openSnapshotText = "";
    this.savedBaseText = "";
    this.splitViewEnabled = false;
    this.compareEnabled = false;
    this.diffHunks = [];
    this.diffSummary = null;
    this.diffLoading = false;
    this.rootItems = [];
    this.treeData = {};
    this.lineCount = 1;
    this.cursorLine = 1;
    this.cursorCol = 1;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.loadedPaths.has("")) {
      this.loadTree("");
    }
    this.themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    this.themeMedia.addEventListener("change", this.handleThemeChange);
    this.applyTheme();
    void this.loadFontSettings();
    document.addEventListener("selectionchange", this.selectionListener);
    document.addEventListener("click", this.handleGlobalClick, true);
    this.loadSnippets();
    this.initEntities();
  }

  disconnectedCallback(): void {
    document.removeEventListener("selectionchange", this.selectionListener);
    document.removeEventListener("click", this.handleGlobalClick, true);
    if (this.themeMedia) {
      this.themeMedia.removeEventListener("change", this.handleThemeChange);
      this.themeMedia = null;
    }
    if (this.cursorRaf !== null) cancelAnimationFrame(this.cursorRaf);
    if (this.haClient) {
      this.haClient.disconnect();
      this.haClient = null;
    }
    super.disconnectedCallback();
  }

  private async loadTree(path: string, force = false) {
    if ((!force && this.loadedPaths.has(path)) || this.loadingPaths.has(path)) {
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
    } catch (e) {
      this.status = "Errore caricamento tree";
    } finally {
      this.loadingPaths.delete(path);
      this.loadedPaths.add(path);
    }
  }

  private async reloadTree() {
    const expandedPaths = Array.from(this.expanded).filter((p) => p !== "");
    this.loadedPaths.clear();
    this.loadingPaths.clear();
    this.treeData = {};
    this.rootItems = [];
    await this.loadTree("", true);
    for (const p of expandedPaths) {
      await this.loadTree(p, true);
    }
    this.showToast("Tree ricaricato");
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
    this.openSnapshotText = "";
    this.savedBaseText = "";
    this.diffHunks = [];
    this.diffSummary = null;
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
      this.fileCache[path] = this.content;
      this.openSnapshotByPath[path] = this.content;
      this.savedBaseByPath[path] = this.content;
      this.openSnapshotText = this.content;
      this.savedBaseText = this.content;
      this.diffHunks = [];
      this.diffSummary = null;
      this.cursorLine = 1;
      this.cursorCol = 1;
      this.tabs = this.tabs.map((t) => (t.path === path ? { ...t, dirty: false } : t));
      const jump = this.pendingJump && this.pendingJump.path === path ? this.pendingJump : null;
      this.pendingJump = null;
      requestAnimationFrame(() => {
        this.syncEditorOverlay();
        this.syncBaseOverlay();
        if (jump) this.jumpToPosition(jump.line, jump.col);
      });
      this.scheduleDiff();
      this.status = "Ready";
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
      if (!next) {
        this.cursorLine = 1;
        this.cursorCol = 1;
        this.lineCount = 1;
      }
    }
    console.debug("[app-root] closeTab: closed", path, { remaining: this.tabs.map((t) => t.path), active: this.activePath });
  }

  private markDirty(val: string) {
    this.content = val;
    this.lineCount = Math.max(1, this.content.split("\n").length);
    if (!this.activePath) return;
    this.fileCache[this.activePath] = val;
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath ? { ...t, dirty: true } : t
    );
    this.scheduleDiff();
  }

  private scheduleDiff() {
    if (!this.splitViewEnabled || !this.compareEnabled) {
      this.diffHunks = [];
      this.diffSummary = null;
      this.diffLoading = false;
      if (this.diffDebounce !== null) {
        clearTimeout(this.diffDebounce);
        this.diffDebounce = null;
      }
      return;
    }
    if (!this.activePath) {
      this.diffHunks = [];
      this.diffSummary = null;
      this.diffLoading = false;
      return;
    }
    if (this.diffDebounce !== null) {
      clearTimeout(this.diffDebounce);
    }
    this.diffDebounce = window.setTimeout(() => {
      this.diffDebounce = null;
      this.fetchDiff();
    }, 350);
  }

  private async fetchDiff() {
    if (!this.splitViewEnabled || !this.compareEnabled) return;
    const requestId = ++this.diffRequestId;
    this.diffLoading = true;
    try {
      const payload = {
        base_text: this.savedBaseText,
        modified_text: this.content,
        mode: "saved",
      };
      const res = await fetch(`${this.apiBase}api/diff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (requestId !== this.diffRequestId) return;
      if (!res.ok || data?.ok !== true) {
        const msg = data?.error?.message || data?.detail?.message || `Diff non disponibile (HTTP ${res.status})`;
        this.showToast(msg, "error");
        this.diffHunks = [];
        this.diffSummary = null;
        this.compareEnabled = false;
        return;
      }
      this.diffHunks = Array.isArray(data?.hunks) ? (data.hunks as DiffHunk[]) : [];
      this.diffSummary = (data?.summary as DiffSummary) || null;
    } catch (e) {
      if (requestId !== this.diffRequestId) return;
      this.showToast("Errore diff", "error");
      this.diffHunks = [];
      this.diffSummary = null;
      this.compareEnabled = false;
    } finally {
      if (requestId === this.diffRequestId) {
        this.diffLoading = false;
      }
    }
  }

  private getDiffMaps() {
    const left = new Map<number, string>();
    const right = new Map<number, string>();
    if (!this.splitViewEnabled || !this.compareEnabled) {
      return { left, right };
    }
    for (const h of this.diffHunks) {
      if (h.type === "insert") {
        for (let i = 0; i < h.mod_len; i++) left.set(h.mod_start + i, "diff-insert");
      } else if (h.type === "delete") {
        for (let i = 0; i < h.base_len; i++) right.set(h.base_start + i, "diff-delete");
      } else if (h.type === "replace") {
        for (let i = 0; i < h.mod_len; i++) left.set(h.mod_start + i, "diff-replace");
        for (let i = 0; i < h.base_len; i++) right.set(h.base_start + i, "diff-replace");
      }
    }
    return { left, right };
  }

  private updateCursorFromPos(pos: number, value?: string) {
    const source = value ?? this.content;
    const upToPos = source.slice(0, pos);
    const lines = upToPos.split("\n");
    const nextLine = Math.max(1, lines.length);
    const nextCol = Math.max(1, lines[lines.length - 1].length + 1);
    if (nextLine !== this.cursorLine || nextCol !== this.cursorCol) {
      this.cursorLine = nextLine;
      this.cursorCol = nextCol;
      this.lastCursorLine = nextLine;
      this.lastCursorCol = nextCol;
      console.debug("[app-root] cursor", { pos, line: nextLine, col: nextCol });
    }
  }

  private updateCursorFromTextarea() {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const pos = ta.selectionStart ?? 0;
    this.updateCursorFromPos(pos, ta.value);
  }

  private syncEditorOverlay() {
    if (!this.editorRef) return;
    this.syncScroll({ target: this.editorRef } as unknown as Event);
  }

  private syncBaseOverlay() {
    if (!this.basePreRef) return;
    this.syncBaseScroll({ target: this.basePreRef } as unknown as Event);
  }

  private jumpToPosition(line: number, col: number) {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const safeLine = Math.max(1, Math.min(line, this.content.split("\n").length));
    const lines = this.content.split("\n");
    let pos = 0;
    for (let i = 0; i < safeLine - 1 && i < lines.length; i++) {
      pos += lines[i].length + 1;
    }
    const lineText = lines[safeLine - 1] ?? "";
    pos += Math.min(Math.max(col, 1) - 1, lineText.length);
    ta.selectionStart = pos;
    ta.selectionEnd = pos;
    const approxLineHeight = 18; // 13px font * 1.4 line-height ~ 18px
    ta.scrollTop = Math.max(0, (safeLine - 1) * approxLineHeight - approxLineHeight);
    this.syncScroll({ target: ta } as unknown as Event);
    ta.focus();
    this.updateCursorFromPos(pos, ta.value);
  }

  private handleInput(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    this.markDirty(ta.value);
    this.updateSuggestions();
    if (this.suggestBlocked && !/[.:]$/.test(ta.value)) {
      this.suggestBlocked = false;
    }
    requestAnimationFrame(() => this.updateCursorFromTextarea());
  }

  private handleCursorMove(e: Event) {
    this.updateSuggestions();
    requestAnimationFrame(() => this.updateCursorFromTextarea());
  }

  private handleEditorKeyDown(e: KeyboardEvent) {
    if ((e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.save();
      return;
    }
    if (this.suggestOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const next = (this.suggestIndex + delta + this.suggestItems.length) % this.suggestItems.length;
        this.suggestIndex = next;
        requestAnimationFrame(() => this.scrollSuggestIntoView());
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        this.applySuggestion();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        this.closeSuggestions(true);
        return;
      }
    }
    if (!this.autoIndentEnabled) {
      this.handleCursorMove(e);
      return;
    }
    if (e.key === "Enter") {
      const handled = this.applyAutoIndent(e);
      if (handled) return;
    } else if (e.key === "Tab") {
      const handled = this.insertTabSpaces(e);
      if (handled) return;
    }
    this.handleCursorMove(e);
  }

  private insertTabSpaces(e: KeyboardEvent) {
    if (!this.editorRef) return false;
    e.preventDefault();
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const tab = "  ";
    const next = `${this.content.slice(0, start)}${tab}${this.content.slice(end)}`;
    this.markDirty(next);
    const pos = start + tab.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = pos;
      this.editorRef.selectionEnd = pos;
      this.editorRef.focus();
      this.updateCursorFromPos(pos, this.content);
    });
    return true;
  }

  private applyAutoIndent(e: KeyboardEvent) {
    if (!this.editorRef) return false;
    if (e.shiftKey) return false; // Shift+Enter: newline default, niente indent automatico
    e.preventDefault();
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const before = this.content.slice(0, start);
    const after = this.content.slice(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.slice(lineStart);
    const baseIndent = currentLine.match(/^[\t ]*/) ? currentLine.match(/^[\t ]*/)![0] : "";
    const trimmed = currentLine.trim();
    let extra = "";
    if (trimmed.endsWith(":")) {
      extra = "  ";
    } else if (trimmed.startsWith("-")) {
      extra = "  ";
    }
    const indent = `${baseIndent}${extra}`;
    const insert = `\n${indent}`;
    const next = `${before}${insert}${after}`;
    this.markDirty(next);
    const pos = start + insert.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = pos;
      this.editorRef.selectionEnd = pos;
      this.editorRef.focus();
      this.updateCursorFromPos(pos, this.content);
    });
    return true;
  }

  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.contextMenuOpen = true;
    this.contextMenuX = e.clientX;
    this.contextMenuY = e.clientY;
    this.closeSuggestions();
  }

  private closeContextMenu() {
    if (this.contextMenuOpen) {
      this.contextMenuOpen = false;
    }
  }

  private async handleCopyCut(action: "copy" | "cut") {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const selection = this.content.slice(start, end);
    if (selection.length === 0 && action === "copy") {
      this.showToast("Niente da copiare", "error");
      return;
    }
    try {
      if (selection.length > 0 && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selection);
      } else {
        document.execCommand(action);
      }
      if (action === "cut") {
        const next = `${this.content.slice(0, start)}${this.content.slice(end)}`;
        this.markDirty(next);
        const pos = start;
        requestAnimationFrame(() => {
          if (!this.editorRef) return;
          this.editorRef.selectionStart = pos;
          this.editorRef.selectionEnd = pos;
          this.editorRef.focus();
          this.updateCursorFromPos(pos, this.content);
        });
      }
      this.showToast(action === "copy" ? "Copiato" : "Tagliato");
    } catch (err) {
      this.showToast("Clipboard non disponibile", "error");
    } finally {
      this.closeContextMenu();
    }
  }

  private async handlePaste() {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    try {
      const text = navigator.clipboard ? await navigator.clipboard.readText() : "";
      if (!text) {
        this.showToast("Niente da incollare", "error");
        this.closeContextMenu();
        return;
      }
      const next = `${this.content.slice(0, start)}${text}${this.content.slice(end)}`;
      this.markDirty(next);
      const pos = start + text.length;
      requestAnimationFrame(() => {
        if (!this.editorRef) return;
        this.editorRef.selectionStart = pos;
        this.editorRef.selectionEnd = pos;
        this.editorRef.focus();
        this.updateCursorFromPos(pos, this.content);
      });
      this.showToast("Incollato");
    } catch (err) {
      this.showToast("Clipboard non disponibile", "error");
    } finally {
      this.closeContextMenu();
    }
  }

  private handleUndoRedo(action: "undo" | "redo") {
    if (!this.editorRef || !this.activePath) {
      this.showToast("Apri un file prima di modificare", "error");
      return;
    }
    const ta = this.editorRef;
    ta.focus();
    const ok = document.execCommand(action);
    const next = ta.value;
    if (next !== this.content) {
      this.markDirty(next);
    }
    if (!ok) {
      this.showToast(action === "undo" ? "Undo non disponibile" : "Redo non disponibile", "error");
    }
  }

  private handleCompareFromContext() {
    this.handleMenuAction("view", "Compare…");
    this.closeContextMenu();
  }

  private reindentAll() {
    const lines = this.content.split("\n");
    let level = 0;
    const out: string[] = [];
    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (trimmed.trim() === "") {
        out.push("");
        continue;
      }
      const clean = trimmed.trim();
      const origIndentSpaces = (line.match(/^ */)?.[0].length ?? 0);
      const origLevel = Math.floor(origIndentSpaces / 2);
      if (origLevel < level) level = origLevel;

      const currentIndent = Math.max(0, level);
      out.push(`${" ".repeat(currentIndent * 2)}${clean}`);

      const endsWithBlock = /:\s*$/.test(clean);
      const startsList = /^-\s*/.test(clean);
      if (endsWithBlock || startsList) {
        level = currentIndent + 1;
      } else {
        level = currentIndent;
      }
    }
    const next = out.join("\n");
    this.markDirty(next);
    requestAnimationFrame(() => this.updateCursorFromTextarea());
    this.closeContextMenu();
    this.showToast("Auto-indent completato");
  }

  private closeSuggestions(block = false) {
    if (this.suggestOpen) {
      this.suggestOpen = false;
      this.suggestItems = [];
      this.suggestIndex = 0;
    }
    this.suggestContext = null;
    if (block) {
      this.suggestBlocked = true;
    }
  }

  private async updateSuggestions() {
    if (this.suggestBlocked) return;
    if (!this.editorRef) {
      this.closeSuggestions();
      return;
    }
    const pos = this.editorRef.selectionStart ?? 0;
    const before = this.content.slice(0, pos);
    const mdiMatch = before.match(/mdi[:.]([a-zA-Z0-9_\\-]*)$/i);
    if (mdiMatch) {
      const query = mdiMatch[1] || "";
      const icons = await this.fetchMdiSuggestions(query);
      if (!icons.length) {
        this.closeSuggestions();
        return;
      }
      const items = icons.map((icon) => ({ type: "mdi", value: icon.name, codepoint: icon.codepoint }));
      const coords = this.getSuggestCoords(before);
      if (!coords) return;
      this.openSuggestions(items, "mdi", coords.top, coords.left);
      return;
    }

    const match = before.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_\\-]*)$/);
    if (!match) {
      this.closeSuggestions();
      return;
    }
    const domain = (match[1] || "").toLowerCase();
    const query = match[2] || "";
    const all = Object.keys(this.entities).sort();
    const items =
      domain === "state" || domain === "states"
        ? all.filter((id) => id.includes(query))
        : all.filter((id) => id.startsWith(`${domain}.`) && id.includes(query));
    if (items.length === 0) {
      this.closeSuggestions();
      return;
    }
    const suggestItems = items.map((id) => ({ type: "entity", value: id }));
    const coords = this.getSuggestCoords(before);
    if (!coords) return;
    this.openSuggestions(suggestItems, "entity", coords.top, coords.left);
  }

  private isSameSuggestItem(a: SuggestItem, b: SuggestItem) {
    if (a.type !== b.type || a.value !== b.value) return false;
    if (a.type === "mdi" && b.type === "mdi") {
      return a.codepoint === b.codepoint;
    }
    return true;
  }

  private openSuggestions(items: SuggestItem[], context: "entity" | "mdi", top: number, left: number) {
    const sameItems =
      this.suggestOpen &&
      this.suggestContext === context &&
      this.suggestItems.length === items.length &&
      this.suggestItems.every((v, i) => this.isSameSuggestItem(v, items[i]));
    this.suggestOpen = true;
    this.suggestContext = context;
    this.suggestItems = items;
    this.suggestIndex = sameItems ? Math.min(this.suggestIndex, items.length - 1) : 0;
    this.suggestTop = top;
    this.suggestLeft = left;
    requestAnimationFrame(() => this.scrollSuggestIntoView());
  }

  private getSuggestCoords(before: string) {
    if (!this.editorRef) return null;
    const lines = before.split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length;
    const lineHeight = 18; // px approx (13px font * 1.4)
    const taRect = this.editorRef.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();
    const padding = 12;
    const charWidth = 8;
    const left = taRect.left - hostRect.left + padding + col * charWidth;
    const top = taRect.top - hostRect.top + padding + (line - 1) * lineHeight - (this.editorRef.scrollTop || 0) - 2;
    return { top, left };
  }

  private async fetchMdiSuggestions(query: string): Promise<MdiIcon[]> {
    const key = query.toLowerCase();
    const cached = this.mdiSuggestCache.get(key);
    if (cached) return cached;
    const requestId = ++this.mdiSuggestRequestId;
    try {
      const res = await fetch(`${this.apiBase}api/mdi/search?query=${encodeURIComponent(key)}&limit=50`);
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      if (requestId !== this.mdiSuggestRequestId) return [];
      if (!res.ok || payload?.ok !== true) {
        return [];
      }
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const icons = items
        .map((it: any) => {
          if (!it) return null;
          if (typeof it === "string") {
            return { name: it, codepoint: "" };
          }
          const name = typeof it.name === "string" ? it.name : null;
          let codepoint = typeof it.codepoint === "string" ? it.codepoint : null;
          if (typeof it.codepoint === "number") {
            codepoint = it.codepoint.toString(16).toUpperCase();
          }
          if (!name) return null;
          return { name, codepoint: codepoint ?? "" };
        })
        .filter((it: MdiIcon | null): it is MdiIcon => Boolean(it && it.name));
      this.mdiSuggestCache.set(key, icons);
      return icons;
    } catch {
      if (requestId === this.mdiSuggestRequestId) {
        this.mdiSuggestCache.set(key, []);
      }
      return [];
    }
  }

  private renderMdiGlyph(codepoint?: string) {
    if (!codepoint) return "";
    const normalized = codepoint.trim().replace(/^0x/i, "");
    if (!normalized) return "";
    const value = Number.parseInt(normalized, 16);
    if (Number.isNaN(value)) return "";
    return String.fromCodePoint(value);
  }

  private applySuggestion() {
    if (!this.editorRef || !this.suggestOpen || this.suggestItems.length === 0) return;
    const ta = this.editorRef;
    const pos = ta.selectionStart ?? 0;
    const before = this.content.slice(0, pos);
    const current = this.suggestItems[this.suggestIndex];
    if (!current) return;
    if (current.type === "mdi") {
      const match = before.match(/mdi[:.]([a-zA-Z0-9_\\-]*)$/i);
      if (!match) {
        this.closeSuggestions();
        return;
      }
      const prefixLen = match[0].length;
      const start = pos - prefixLen;
      const end = ta.selectionEnd ?? pos;
      const insert = `mdi:${current.value}`;
      const next = `${this.content.slice(0, start)}${insert}${this.content.slice(end)}`;
      this.markDirty(next);
      const newPos = start + insert.length;
      requestAnimationFrame(() => {
        if (!this.editorRef) return;
        this.editorRef.selectionStart = newPos;
        this.editorRef.selectionEnd = newPos;
        this.editorRef.focus();
        this.updateCursorFromPos(newPos, this.content);
      });
      this.closeSuggestions();
      return;
    }
    const match = before.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_\\-]*)$/);
    if (!match) {
      this.closeSuggestions();
      return;
    }
    const prefixLen = match[0].length;
    const start = pos - prefixLen;
    const end = ta.selectionEnd ?? pos;
    const insert = current.value;
    const next = `${this.content.slice(0, start)}${insert}${this.content.slice(end)}`;
    this.markDirty(next);
    const newPos = start + insert.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = newPos;
      this.editorRef.selectionEnd = newPos;
      this.editorRef.focus();
      this.updateCursorFromPos(newPos, this.content);
    });
    this.closeSuggestions();
  }

  private async loadSnippets() {
    try {
      const res = await fetch(`${this.apiBase}api/snippets`);
      if (!res.ok) throw new Error(`snippets ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? (data.items as Snippet[]) : [];
      this.snippets = items.length > 0 ? items : this.snippetMocks;
    } catch (e) {
      this.snippets = this.snippetMocks;
      this.showToast("Snippet offline (mock)", "error");
    }
  }

  private openSnippetModal(existing?: Snippet) {
    this.showSnippetModal = true;
    if (existing) {
      this.snippetEditingId = existing.id;
      this.snippetName = existing.name;
      this.snippetDescription = existing.description;
      this.snippetContent = existing.content;
    } else {
      this.snippetEditingId = null;
      this.snippetName = "";
      this.snippetDescription = "";
      this.snippetContent = "";
    }
  }

  private closeSnippetModal() {
    if (this.snippetSaving) return;
    this.showSnippetModal = false;
    this.snippetEditingId = null;
  }

  private async saveSnippet() {
    if (this.snippetSaving) return;
    const name = this.snippetName.trim();
    const description = this.snippetDescription.trim();
    const content = this.snippetContent;
    if (!name || !description || !content) {
      this.showToast("Compila tutti i campi", "error");
      return;
    }
    if (name.length > 100) {
      this.showToast("Titolo troppo lungo (max 100)", "error");
      return;
    }
    if (description.length > 250) {
      this.showToast("Descrizione troppo lunga (max 250)", "error");
      return;
    }
    this.snippetSaving = true;
    try {
      const payload = { name, description, content };
      if (this.snippetEditingId) {
        const res = await fetch(`${this.apiBase}api/snippets/${encodeURIComponent(this.snippetEditingId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`update snippet ${res.status}`);
        const data = await res.json();
        const item = data?.item as Snippet | undefined;
        if (item && item.id) {
          this.snippets = this.snippets.map((s) => (s.id === item.id ? item : s));
        }
        this.showToast("Snippet aggiornato");
      } else {
        const res = await fetch(`${this.apiBase}api/snippets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`save snippet ${res.status}`);
        const data = await res.json();
        const item = data?.item as Snippet | undefined;
        if (item && item.id) {
          this.snippets = [...this.snippets, item];
        } else {
          this.snippets = [...this.snippets, { id: `tmp-${Date.now()}`, name, description, content }];
        }
        this.showToast("Snippet salvato");
      }
      this.showSnippetModal = false;
      this.snippetEditingId = null;
    } catch (e) {
      this.showToast("Errore salvataggio snippet", "error");
    } finally {
      this.snippetSaving = false;
    }
  }

  private scrollSuggestIntoView() {
    if (!this.suggestOpen) return;
    const items = this.shadowRoot?.querySelectorAll(".suggestItem");
    if (!items || items.length === 0) return;
    const el = items[this.suggestIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }

  private async performSearch() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.showToast("Inserisci un termine di ricerca", "error");
      return;
    }
    this.searchTruncated = false;
    this.searchLoading = true;
    try {
      const payload = {
        query,
        case_sensitive: this.searchCaseSensitive,
        max_files: 200,
        max_matches_total: 5000,
        max_matches_per_file: 200,
      };
      const res = await fetch(`${this.apiBase}api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) {
        throw new Error(data?.detail || `search ${res.status}`);
      }
      this.searchResults = Array.isArray(data.results) ? (data.results as SearchResult[]) : [];
      this.searchSummary = (data.summary as SearchSummary) || null;
      this.searchTruncated = !!data.truncated;
    } catch (e) {
      this.showToast("Errore ricerca", "error");
    } finally {
      this.searchLoading = false;
    }
  }

  private async replaceAll() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.showToast("Esegui prima una ricerca", "error");
      return;
    }
    if (this.searchResults.length === 0) {
      this.showToast("Nessun risultato da sostituire", "error");
      return;
    }
    this.searchLoading = true;
    try {
      const files = this.searchResults.map((r) => ({ path: r.path, mtime: r.mtime }));
      const payload = {
        query,
        replace: this.searchReplace,
        case_sensitive: this.searchCaseSensitive,
        scope: "files",
        files,
      };
      const previewRes = await fetch(`${this.apiBase}api/search/replace/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let preview: any = null;
      try {
        preview = await previewRes.json();
      } catch {
        preview = null;
      }
      if (!previewRes.ok || preview?.ok !== true) {
        const detail = preview?.detail || `replace preview ${previewRes.status}`;
        throw new Error(detail);
      }
      const previewSummary = preview?.summary || {};
      const replacements = previewSummary.replacements_total ?? 0;
      const toModify = previewSummary.files_to_modify ?? files.length;
      if (!replacements) {
        this.showToast("Nessuna occorrenza da sostituire");
        return;
      }
      const confirmed = window.confirm(`Sostituire ${replacements} occorrenze in ${toModify} file?`);
      if (!confirmed) return;

      const applyRes = await fetch(`${this.apiBase}api/search/replace/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let apply: any = null;
      try {
        apply = await applyRes.json();
      } catch {
        apply = null;
      }
      if (!applyRes.ok || apply?.ok !== true) {
        const detail = apply?.detail || `replace apply ${applyRes.status}`;
        throw new Error(detail);
      }
      const summary = apply?.summary || {};
      const modified = summary.files_modified ?? summary.files_to_modify ?? 0;
      const stale = summary.stale_files ?? 0;
      const msg = `Replace completato: ${modified} file aggiornati${stale ? `, ${stale} stale` : ""}`;
      this.showToast(msg);
      await this.performSearch();
    } catch (e) {
      this.showToast("Errore replace", "error");
    } finally {
      this.searchLoading = false;
    }
  }

  private openSearchMatch(res: SearchResult, match: SearchMatch) {
    this.pendingJump = { path: res.path, line: match.line, col: match.column };
    this.openFile(res.path);
  }

  private insertSnippet(snippet: Snippet) {
    if (!this.editorRef || !this.activePath) {
      this.showToast("Apri un file prima di inserire", "error");
      return;
    }
    const ta = this.editorRef;
    const start = ta.selectionStart ?? this.content.length;
    const end = ta.selectionEnd ?? start;
    const insert = snippet.content || "";
    const next = `${this.content.slice(0, start)}${insert}${this.content.slice(end)}`;
    this.markDirty(next);
    const pos = start + insert.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = pos;
      this.editorRef.selectionEnd = pos;
      this.editorRef.focus();
      this.updateCursorFromPos(pos, this.content);
    });
    this.showToast(`Snippet inserito: ${snippet.name}`);
  }

  private async deleteSnippet(snippet: Snippet) {
    const id = snippet.id;
    if (!id) {
      this.showToast("ID snippet mancante", "error");
      return;
    }
    try {
      const res = await fetch(`${this.apiBase}api/snippets/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`delete snippet ${res.status}`);
      this.snippets = this.snippets.filter((s) => s.id !== id);
      this.showToast("Snippet eliminato");
    } catch (e) {
      this.showToast("Errore eliminazione snippet", "error");
    }
  }

  private async indentFile() {
    if (!this.activePath || this.indenting) {
      return;
    }
    this.indenting = true;
    this.status = "Formatting YAML...";
    try {
      const res = await fetch(`${this.apiBase}api/format/yaml`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: this.content }),
      });
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      if (!res.ok || payload?.ok !== true) {
        const err = payload?.error ?? payload?.detail;
        const line = err?.line;
        const col = err?.column;
        const raw = String(err?.message ?? "");
        const short = (raw.split("\n")[0] || raw).trim();
        let msg = "YAML non valido";
        if (line != null && col != null) msg += ` (riga ${line}, colonna ${col})`;
        else if (line != null) msg += ` (riga ${line})`;
        if (short) msg += `: ${short}`;
        else msg += ".";
        const hint1 = raw.includes("expected <block end>, but found '?'");
        const hint2 = raw.includes("expected ',' or '}', but got '{'");
        if (hint1) msg += " (controlla che dopo '-' ci sia uno spazio: '- key: value')";
        if (hint2) msg += " (in una mappa {...} manca una virgola o una '}')";
        if (!err) {
          msg = `Impossibile formattare YAML (HTTP ${res.status}).`;
        }
        this.showToast(msg, "error");
        this.status = "Errore formattazione";
        return;
      }
      const formatted = payload.formatted ?? "";
      this.markDirty(formatted);
      this.status = "Formatted (non salvato)";
      this.showToast("YAML formattato");
    } catch (e) {
      this.showToast("Errore formattazione", "error");
      this.status = "Errore formattazione";
    } finally {
      this.indenting = false;
    }
  }

  private startCursorTracking() {
    const tick = () => {
      this.updateCursorFromTextarea();
      this.cursorRaf = requestAnimationFrame(tick);
    };
    if (this.cursorRaf === null) {
      this.cursorRaf = requestAnimationFrame(tick);
    }
  }

  private stopCursorTracking() {
    if (this.cursorRaf !== null) {
      cancelAnimationFrame(this.cursorRaf);
      this.cursorRaf = null;
    }
  }

  private handleGlobalClick = (e: MouseEvent) => {
    if (this.openMenu) {
      const path = e.composedPath();
      const insideMenu = path.some(
        (node) =>
          node instanceof HTMLElement &&
          (node.classList.contains("menuItem") || node.classList.contains("menuPopup"))
      );
      if (!insideMenu) this.openMenu = null;
    }
    if (this.contextMenuOpen) {
      const target = e.target as HTMLElement | null;
      const inside = target?.closest?.(".contextMenu");
      if (!inside) this.closeContextMenu();
    }
    if (this.suggestOpen) {
      const target = e.target as HTMLElement | null;
      const inside = target?.closest?.(".suggestBox");
      if (!inside) this.closeSuggestions(true);
    }
  };

  private toggleMenu(e: Event, name: string) {
    e.preventDefault();
    e.stopPropagation();
    this.openMenu = this.openMenu === name ? null : name;
    console.debug("[app-root] menu toggle", { name, open: this.openMenu });
  }

  private showToast(message: string, type: "info" | "error" = "info") {
    if (this.toastTimer !== null) {
      clearTimeout(this.toastTimer);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage = null;
      this.toastType = "info";
      this.toastTimer = null;
    }, 5000);
  }

  private async initEntities() {
    try {
      this.haClient = new HAClient(this.apiBase);
      this.haClient.connect((ev) => {
        const id = ev.event.data.entity_id;
        const next = { ...this.entities };
        if (ev.event.data.new_state) {
          next[id] = ev.event.data.new_state;
        } else {
          delete next[id];
        }
        this.syncCollapsedDomains(Object.keys(next).map((k) => k.split(".")[0]));
        this.entities = next;
      });
      const states = await this.haClient.getStates();
      const next: Record<string, HassState> = {};
      states.forEach((s) => {
        next[s.entity_id] = s;
      });
      this.syncCollapsedDomains(states.map((s) => s.entity_id.split(".")[0]));
      this.entities = next;
      this.entityError = null;
    } catch (e) {
      this.entityError = "Errore caricamento entità";
      this.showToast("Errore caricamento entità", "error");
    }
  }

  private handleMenuAction(menu: string, action: string) {
    this.openMenu = null;
    if (menu === "file") {
      if (action === "New file") {
        this.newItemKind = "file";
        this.newItemName = "";
        this.newItemExt = "";
      } else if (action === "New folder") {
        this.newItemKind = "folder";
        this.newItemName = "";
      } else if (action === "Save" && this.activePath) {
        this.save();
      } else if (action === "Save as…") {
        this.status = "Save as non implementato";
        this.showToast("Save as non implementato", "info");
      } else if (action === "Settings") {
        this.openSettingsModal();
      }
    } else if (menu === "edit") {
      if (action === "Undo") {
        this.handleUndoRedo("undo");
      } else if (action === "Redo") {
        this.handleUndoRedo("redo");
      } else if (action === "Cut") {
        this.handleCopyCut("cut");
      } else if (action === "Copy") {
        this.handleCopyCut("copy");
      } else if (action === "Paste") {
        this.handlePaste();
      }
    } else if (menu === "view") {
      if (action === "Reload tree") {
        this.reloadTree();
      } else if (action === "Split view") {
        const next = !this.splitViewEnabled;
        this.splitViewEnabled = next;
        if (!next) {
          this.compareEnabled = false;
          this.diffHunks = [];
          this.diffSummary = null;
        } else {
          requestAnimationFrame(() => this.syncBaseOverlay());
        }
      } else if (action === "Compare…") {
        if (!this.splitViewEnabled) {
          this.showToast("Attiva prima Split view", "info");
          return;
        }
        if (!this.activePath) {
          this.showToast("Apri un file per confrontare", "info");
          return;
        }
        this.compareEnabled = !this.compareEnabled;
        if (!this.compareEnabled) {
          this.diffHunks = [];
          this.diffSummary = null;
        } else {
          this.scheduleDiff();
        }
      }
    } else if (menu === "help") {
      if (action === "About") {
        this.openAboutModal();
      } else if (action === "Docs") {
        this.showToast("Docs non disponibili", "info");
      }
    }
  }

  private async createNewItem() {
    if (!this.newItemKind) return;
    const dir = this.activePath && this.activePath.includes("/") ? this.activePath.split("/").slice(0, -1).join("/") : "";
    if (this.newItemKind === "file") {
      const base = this.newItemName.trim();
      const ext = this.newItemExt.trim();
      if (!base) {
        this.status = "Nome file richiesto";
        this.showToast("Nome file richiesto", "error");
        return;
      }
      const filename = ext ? `${base}.${ext.replace(/^\./, "")}` : base;
      const target = dir ? `${dir}/${filename}` : filename;
      try {
        const parentItems =
          dir && dir !== ""
            ? this.treeData[dir] ?? []
            : this.rootItems.length > 0
              ? this.rootItems
              : this.treeData[""] ?? [];
        if (parentItems.some((it) => it.name === filename && it.type === "file")) {
          this.showToast("File already exist", "error");
          this.status = "File already exist";
          return;
        }
        const url = `${this.apiBase}api/file?path=${encodeURIComponent(target)}&create_only=1`;
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "" }),
        });
        if (!res.ok) {
          const detailJson = await res.json().catch(() => null);
          const detailText = !detailJson ? await res.text().catch(() => "") : "";
          const msg =
            (detailJson && (detailJson.detail || detailJson.message)) ||
            detailText ||
            (res.status === 400 ? "File already exist" : "Errore creazione file");
          this.showToast(msg, "error");
          this.status = msg;
          return;
        }
        this.newItemKind = null;
        this.loadedPaths.delete(dir);
        await this.loadTree(dir, true);
        this.expanded = new Set(this.expanded).add(dir);
        this.openFile(target);
      } catch (e) {
        this.status = "Errore creazione file";
        this.showToast("Errore creazione file", "error");
      }
    } else if (this.newItemKind === "folder") {
      const base = this.newItemName.trim();
      if (!base) {
        this.status = "Nome cartella richiesto";
        this.showToast("Nome cartella richiesta", "error");
        return;
      }
      const parentItems =
        dir && dir !== ""
          ? this.treeData[dir] ?? []
          : this.rootItems.length > 0
            ? this.rootItems
            : this.treeData[""] ?? [];
      if (parentItems.some((it) => it.name === base && it.type === "dir")) {
        const msg = "Folder already exist";
        this.showToast(msg, "error");
        this.status = msg;
        return;
      }
      const target = dir ? `${dir}/${base}` : base;
      try {
        const url = `${this.apiBase}api/folder?path=${encodeURIComponent(target)}`;
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) {
          const detailJson = await res.json().catch(() => null);
          const detailText = !detailJson ? await res.text().catch(() => "") : "";
          const msg =
            (detailJson && (detailJson.detail || detailJson.message)) ||
            detailText ||
            (res.status === 400 ? "Folder already exist" : "Cartella esiste già o errore");
          this.showToast(msg, "error");
          this.status = msg;
          return;
        }
        this.newItemKind = null;
        this.loadedPaths.delete(dir);
        await this.loadTree(dir, true);
        this.expanded = new Set(this.expanded).add(target);
      } catch (e) {
        this.status = "Errore creazione cartella";
        this.showToast("Errore creazione cartella", "error");
      }
    }
  }

  private cancelNewItem() {
    this.newItemKind = null;
    this.newItemName = "";
    this.newItemExt = "";
  }

  private handleCloseTab(e: Event, path: string) {
    e.stopPropagation();
    e.preventDefault();
    console.debug("[app-root] close tab click", path, { active: this.activePath, tabs: this.tabs.length });
    this.closeTab(path);
  }

  private switchTab(path: string) {
    this.activePath = path;
    const cached = this.fileCache[path];
    if (cached !== undefined) {
      this.content = cached;
      this.lineCount = Math.max(1, cached.split("\n").length);
      this.cursorLine = 1;
      this.cursorCol = 1;
      this.openSnapshotText = this.openSnapshotByPath[path] ?? cached;
      this.savedBaseText = this.savedBaseByPath[path] ?? cached;
      this.diffHunks = [];
      this.diffSummary = null;
      requestAnimationFrame(() => {
        this.syncEditorOverlay();
        this.syncBaseOverlay();
      });
      this.scheduleDiff();
    } else {
      this.content = "";
      this.lineCount = 1;
      this.cursorLine = 1;
      this.cursorCol = 1;
      this.loadFile(path);
    }
  }

  private highlightLine(line: string) {
    type Seg = { text: string; cls?: string };
    const segments: Seg[] = [];
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
  }

  private renderHighlighted(text: string, diffMap?: Map<number, string>) {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const lineNo = idx + 1;
      const diffClass = diffMap?.get(lineNo);
      const cls = diffClass ? `codeLine ${diffClass}` : "codeLine";
      const indentMatch = line.match(/^[\t ]+/);
      const indentRaw = indentMatch ? indentMatch[0] : "";
      const rest = indentRaw ? line.slice(indentRaw.length) : line;
      const indentRendered = indentRaw
        ? indentRaw.replace(/\t/g, "  ").replace(/ /g, "\u00A0")
        : "";
      const indentNode = indentRendered ? html`<span class="codeIndent">${indentRendered}</span>` : nothing;
      return html`<div class=${cls} data-gutter-line=${lineNo}>
        ${indentNode}
        ${this.highlightLine(rest).map((seg) => html`<span class=${seg.cls ?? ""}>${seg.text || " "}</span>`)}
      </div>`;
    });
  }

  private renderMenu(label: string, name: string, items: { icon: string; label: string }[]) {
    const open = this.openMenu === name;
    return html`
      <div class="menuItem ${open ? "open" : ""}" @click=${(e: Event) => this.toggleMenu(e, name)}>
        <span>${label}</span>
        <div class="menuPopup" ?hidden=${!open} @click=${(e: Event) => e.stopPropagation()}>
          ${items.map(
            (it) => html`<div class="menuItemRow" @click=${() => this.handleMenuAction(name, it.label)}>
              <span class="menuIcon">${it.icon}</span>
              <span>${it.label}</span>
            </div>`
          )}
        </div>
      </div>
    `;
  }

  private syncScroll(e: Event) {
    const top = (e.target as HTMLElement).scrollTop;
    const left = (e.target as HTMLElement).scrollLeft;
    if (this.codeRef) this.codeRef.style.transform = `translate(${-left}px, -${top}px)`;
    if (this.gutterRef) this.gutterRef.style.transform = `translateY(-${top}px)`;
  }

  private syncBaseScroll(e: Event) {
    const top = (e.target as HTMLElement).scrollTop;
    const left = (e.target as HTMLElement).scrollLeft;
    if (this.baseCodeRef) this.baseCodeRef.style.transform = `translate(${-left}px, -${top}px)`;
    if (this.baseGutterRef) this.baseGutterRef.style.transform = `translateY(-${top}px)`;
  }

  private isNarrowLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  private setActivity(name: "explorer" | "search" | "entity" | "snippet") {
    this.activeActivity = name;
    if (this.isNarrowLayout()) {
      this.sidebarOpen = true;
    }
  }

  private toggleDomain(domain: string) {
    const next = new Set(this.collapsedDomains);
    if (next.has(domain)) {
      next.delete(domain);
    } else {
      next.add(domain);
    }
    this.collapsedDomains = next;
  }

  private handleThemeChange = () => {
    if (this.themeMode === "auto") {
      this.applyTheme();
    }
  };

  private cycleTheme() {
    const next = this.themeMode === "auto" ? "light" : this.themeMode === "light" ? "dark" : "auto";
    this.themeMode = next;
    this.applyTheme();
  }

  private getEffectiveTheme(): "dark" | "light" {
    if (this.themeMode === "auto") {
      const prefersDark = this.themeMedia ? this.themeMedia.matches : true;
      return prefersDark ? "dark" : "light";
    }
    return this.themeMode;
  }

  private applyTheme() {
    const theme = this.getEffectiveTheme();
    const palette =
      theme === "dark"
        ? {
            "--bg-color": "#1e1e1e",
            "--panel-color": "#252526",
            "--panel-strong": "#2d2d2d",
            "--border-color": "#2a2a2a",
            "--hover-color": "#3a3a3a",
            "--text-color": "#d4d4d4",
            "--muted-color": "#c8c8c8",
            "--activity-color": "#333333",
            "--accent-color": "#0e639c",
            "--accent-hover": "#1177bb",
            "--card-color": "#1f1f1f",
            "--input-bg": "#1e1e1e",
            "--toast-bg": "#2d2d2d",
            "--toast-border": "#3a3a3a",
            "--error-bg": "#3a1f1f",
            "--error-border": "#c74c4c",
            "--status-bg": "#007acc",
            "--gutter-bg": "#1a1a1a",
            "--code-bg": "#1e1e1e",
            "--tree-hover": "#2a2d2e",
            "--tree-active": "#37373d",
            "--entity-error-text": "#f6dada",
          }
        : {
            "--bg-color": "#f5f6f8",
            "--panel-color": "#ffffff",
            "--panel-strong": "#f1f1f3",
            "--border-color": "#d1d5db",
            "--hover-color": "#e5e7eb",
            "--text-color": "#1f2937",
            "--muted-color": "#4b5563",
            "--activity-color": "#f3f4f6",
            "--accent-color": "#0d6efd",
            "--accent-hover": "#0b5ed7",
            "--card-color": "#ffffff",
            "--input-bg": "#ffffff",
            "--toast-bg": "#ffffff",
            "--toast-border": "#d1d5db",
            "--error-bg": "#ffecec",
            "--error-border": "#d9534f",
            "--status-bg": "#0d6efd",
            "--gutter-bg": "#f3f4f6",
            "--code-bg": "#ffffff",
            "--tree-hover": "#e8eef8",
            "--tree-active": "#d9e6fb",
            "--entity-error-text": "#8b1f1f",
          };
    Object.entries(palette).forEach(([key, value]) => {
      this.style.setProperty(key, value);
    });
  }

  private clampFontBase(value: number) {
    return Math.min(this.fontBaseMax, Math.max(this.fontBaseMin, value));
  }

  private applyFontScale(baseRem: number) {
    const scale = baseRem / this.fontDefaults.base;
    const toRem = (val: number) => `${(val * scale).toFixed(4)}rem`;
    this.style.setProperty("--font-size-xs", toRem(this.fontDefaults.xs));
    this.style.setProperty("--font-size-sm", toRem(this.fontDefaults.sm));
    this.style.setProperty("--font-size-md", toRem(this.fontDefaults.md));
    this.style.setProperty("--font-size-base", `${baseRem.toFixed(4)}rem`);
    this.style.setProperty("--font-size-lg", toRem(this.fontDefaults.lg));
  }

  private async loadFontSettings() {
    try {
      const res = await fetch(`${this.apiBase}api/user-config`);
      if (res.ok) {
        let payload: any = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        const cfg = payload?.config ?? payload ?? {};
        const raw = Number(cfg.font_base_rem);
        if (!Number.isNaN(raw)) {
          this.fontBaseRem = this.clampFontBase(raw);
        }
      }
    } catch {
      /* ignore load errors */
    }
    this.settingsFontBaseRem = this.fontBaseRem;
    this.applyFontScale(this.fontBaseRem);
  }

  private openSettingsModal() {
    this.settingsTab = "appearance";
    this.settingsFontBaseRem = this.fontBaseRem;
    this.showSettingsModal = true;
  }

  private cancelSettingsModal() {
    this.applyFontScale(this.fontBaseRem);
    this.settingsFontBaseRem = this.fontBaseRem;
    this.showSettingsModal = false;
  }

  private async applySettingsModal() {
    const next = this.settingsFontBaseRem;
    try {
      const res = await fetch(`${this.apiBase}api/user-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { font_base_rem: next } }),
      });
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      if (!res.ok || payload?.ok !== true) {
        throw new Error("save-failed");
      }
    } catch {
      this.applyFontScale(this.fontBaseRem);
      this.settingsFontBaseRem = this.fontBaseRem;
      this.showToast("Errore salvataggio impostazioni", "error");
      return;
    }
    this.fontBaseRem = next;
    this.applyFontScale(this.fontBaseRem);
    this.showSettingsModal = false;
    this.showToast("Impostazioni applicate");
  }

  private handleFontSizeInput(e: Event) {
    const raw = Number((e.target as HTMLInputElement).value);
    const next = this.clampFontBase(raw);
    this.settingsFontBaseRem = next;
    this.applyFontScale(next);
  }

  private openAboutModal() {
    this.showAboutModal = true;
  }

  private closeAboutModal() {
    this.showAboutModal = false;
  }

  private insertEntityId(entityId: string) {
    if (!this.activePath || !this.editorRef) {
      this.showToast("Apri un file prima di inserire", "error");
      return;
    }
    const ta = this.editorRef;
    const start = ta.selectionStart ?? this.content.length;
    const end = ta.selectionEnd ?? this.content.length;
    const next = `${this.content.slice(0, start)}${entityId}${this.content.slice(end)}`;
    this.markDirty(next);
    const cursorPos = start + entityId.length;
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      this.editorRef.selectionStart = cursorPos;
      this.editorRef.selectionEnd = cursorPos;
      this.editorRef.focus();
      this.updateCursorFromPos(cursorPos, this.content);
    });
  }

  private syncCollapsedDomains(domains: string[]) {
    const domainSet = new Set(domains);
    if (domainSet.size === 0) {
      this.lastDomains = domainSet;
      return;
    }
    if (this.collapsedDomains.size === 0 && this.lastDomains.size === 0) {
      this.collapsedDomains = new Set(domainSet);
      this.lastDomains = domainSet;
      return;
    }

    const next = new Set<string>();
    domainSet.forEach((d) => {
      if (this.collapsedDomains.has(d)) {
        next.add(d);
      } else if (!this.lastDomains.has(d)) {
        // nuovo dominio: chiuso di default
        next.add(d);
      }
    });

    if (next.size !== this.collapsedDomains.size || Array.from(next).some((d) => !this.collapsedDomains.has(d))) {
      this.collapsedDomains = next;
    }
    this.lastDomains = domainSet;
  }

  private renderSearchResults() {
    if (this.searchLoading && this.searchResults.length === 0) {
      return html`<div class="searchStatus">Ricerca in corso...</div>`;
    }
    if (this.searchResults.length === 0) {
      return html`<div class="searchStatus muted">Nessun risultato</div>`;
    }
    return html`<div class="searchResults">
      ${this.searchResults.map(
        (r) => html`<div class="searchFile">
          <div class="searchFileHeader">
            <div class="path">${r.path}</div>
            <div class="hits">${r.matches_count} hit</div>
          </div>
          <div class="searchMatches">
            ${r.matches.map(
              (m) => html`<div class="searchMatch" @click=${() => this.openSearchMatch(r, m)}>
                <span class="lineTag">L${m.line}</span>
                <span class="preview">${m.preview}</span>
              </div>`
            )}
          </div>
        </div>`
      )}
      ${this.searchTruncated ? html`<div class="searchStatus muted">Risultati troncati dai limiti impostati</div>` : nothing}
    </div>`;
  }

  private renderSidebarContent() {
    if (this.activeActivity === "explorer") {
      return html`<div class="tree">${this.renderTree("")}</div>`;
    }
    if (this.activeActivity === "search") {
      const summary = this.searchSummary;
      return html`<div class="sidebarContent searchPane">
        <div class="searchRow">
          <input
            type="text"
            class="searchInput"
            placeholder="Search..."
            .value=${this.searchQuery}
            @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") this.performSearch();
            }}
          />
        </div>
        <div class="searchRow">
          <input
            type="text"
            class="searchInput"
            placeholder="Replace..."
            .value=${this.searchReplace}
            @input=${(e: Event) => (this.searchReplace = (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="searchControls">
          <label style="display:flex; align-items:center; gap:6px; font-size:var(--font-size-sm);">
            <input type="checkbox" .checked=${this.searchCaseSensitive} @change=${(e: Event) => (this.searchCaseSensitive = (e.target as HTMLInputElement).checked)} />
            Case sensitive
          </label>
          <div style="flex:1;"></div>
          <button class="btn" ?disabled=${this.searchLoading} @click=${() => this.performSearch()}>${this.searchLoading ? "Searching..." : "Find"}</button>
          <button class="btn primary" ?disabled=${this.searchLoading || this.searchResults.length === 0} @click=${() => this.replaceAll()}>
            ${this.searchLoading ? "Working..." : "Replace All"}
          </button>
        </div>
        ${summary
          ? html`<div class="searchSummary">
              ${summary.matches_total ?? 0} hit in ${summary.files_with_matches ?? 0}/${summary.files_scanned ?? 0} file${this.searchTruncated ? " (troncato)" : ""}
            </div>`
          : html``}
        ${this.renderSearchResults()}
      </div>`;
    }
    if (this.activeActivity === "snippet") {
      const term = this.snippetSearchText.toLowerCase();
      const field = this.snippetSearchField;
      const filtered = this.snippets.filter((s) => {
        const hay = field === "description" ? s.description : s.name;
        return hay.toLowerCase().includes(term);
      });
      return html`<div class="sidebarContent" style="display:grid; gap:8px;">
        <button class="btn primary" style="justify-self:flex-start; padding:6px 10px;" @click=${() => this.openSnippetModal()}>
          Add snippet…
        </button>
        <div style="display:flex; gap:8px; align-items:center;">
          <input
            type="text"
            placeholder="Search snippets..."
            .value=${this.snippetSearchText}
            @input=${(e: Event) => (this.snippetSearchText = (e.target as HTMLInputElement).value)}
            style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--border-color); background: var(--input-bg); color: var(--text-color);"
          />
          <select
            .value=${this.snippetSearchField}
            @change=${(e: Event) => (this.snippetSearchField = (e.target as HTMLSelectElement).value as "title" | "description")}
            style="padding:8px; border-radius:8px; border:1px solid var(--border-color); background: var(--input-bg); color: var(--text-color);"
          >
            <option value="title">Title</option>
            <option value="description">Description</option>
          </select>
        </div>
        <div class="snippetGrid">
          ${filtered.map(
            (s) => html`<div class="snippetCard">
              <div class="snippetHeader">
                <div class="snippetTitle">${s.name}</div>
                <div class="snippetActions">
                  <button class="statusToggle" title="Modify" style="padding:2px 6px; border-color:var(--border-color);" @click=${(e: Event) => { e.stopPropagation(); this.openSnippetModal(s); }}>✏️</button>
                  <button class="statusToggle" title="Cancel" style="padding:2px 6px; border-color:var(--border-color);" @click=${(e: Event) => { e.stopPropagation(); this.deleteSnippet(s); }}>🗙</button>
                  <button class="statusToggle" title="Insert" style="padding:2px 6px; border-color:var(--border-color);" @click=${(e: Event) => { e.stopPropagation(); this.insertSnippet(s); }}>➕</button>
                </div>
              </div>
              <div class="snippetDesc">${s.description.slice(0, 200)}</div>
            </div>`
          )}
        </div>
      </div>`;
    }
    // entity mock
    const entries = Object.values(this.entities);
    const filtered = entries
      .filter((e) => {
        const q = this.entityFilter.toLowerCase();
        if (!q) return true;
        return e.entity_id.toLowerCase().includes(q) || (e.attributes?.friendly_name || "").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const da = a.entity_id.split(".")[0];
        const db = b.entity_id.split(".")[0];
        if (da === db) return a.entity_id.localeCompare(b.entity_id);
        return da.localeCompare(db);
      });
    const grouped: Record<string, HassState[]> = {};
    filtered.forEach((e) => {
      const domain = e.entity_id.split(".")[0];
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(e);
    });
    const domains = Object.keys(grouped).sort();
    return html`<div class="sidebarContent entityPane">
      <div class="entityHeader">Entities</div>
      <input
        class="entitySearch"
        type="text"
        .value=${this.entityFilter}
        @input=${(e: Event) => (this.entityFilter = (e.target as HTMLInputElement).value)}
        placeholder="Search entity id or name"
      />
      ${this.entityError
        ? html`<div class="entityError">${this.entityError}</div>`
        : html`<div class="entityList">
            ${domains.length === 0
              ? html`<div class="entityEmpty">No entities</div>`
              : domains.map((domain) => {
                  const items = grouped[domain];
                  const isOpen = !this.collapsedDomains.has(domain);
                  return html`<div class="entityGroup">
                    <button class="entityGroupHeader" type="button" @click=${() => this.toggleDomain(domain)}>
                      <span class="chevron">${isOpen ? "▾" : "▸"}</span>
                      <span class="entityGroupTitle">${domain}</span>
                      <span style="margin-left:auto; opacity:0.75; font-size:var(--font-size-sm);">${items.length}</span>
                    </button>
                    ${isOpen
                      ? html`<div class="entityGroupBody">
                          ${items.map((e) => {
                            const name = (e.attributes?.friendly_name as string) || e.entity_id;
                            return html`<div class="entityCard">
                              <div class="entityName">${name}</div>
                              <div class="entityId">${e.entity_id}</div>
                              <div class="entityMeta">${domain} • State: ${e.state}</div>
                              <button class="entityInsert" title="Insert.." @click=${(ev: Event) => { ev.stopPropagation(); this.insertEntityId(e.entity_id); }}>
                                ➕ <span>Insert</span>
                              </button>
                            </div>`;
                          })}
                        </div>`
                      : nothing}
                  </div>`;
                })}
          </div>`}
    </div>`;
  }

  private renderLineNumbers() {
    const count = Math.max(1, this.lineCount);
    return Array.from({ length: count }, (_, i) => String(i + 1)).join("\n");
  }

  private renderLineNumbersFor(text: string) {
    const count = Math.max(1, text.split("\n").length);
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
      this.fileCache[this.activePath] = this.content;
      this.savedBaseByPath[this.activePath] = this.content;
      this.savedBaseText = this.content;
      this.tabs = this.tabs.map((t) =>
        t.path === this.activePath ? { ...t, dirty: false } : t
      );
      this.scheduleDiff();
      requestAnimationFrame(() => this.syncBaseOverlay());
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
    const diffMaps = this.getDiffMaps();

    return html`
      <div class="shell">
          <div class="titlebar">
          <div class="menus">
            ${this.renderMenu("File", "file", [
              { icon: "📄", label: "New file" },
              { icon: "📁", label: "New folder" },
              { icon: "💾", label: "Save" },
              { icon: "📝", label: "Save as…" },
              { icon: "⚙️", label: "Settings" },
              { icon: "⬆️", label: "Import…" },
              { icon: "⬇️", label: "Export…" },
            ])}
            ${this.renderMenu("Edit", "edit", [
              { icon: "↩️", label: "Undo" },
              { icon: "↪️", label: "Redo" },
              { icon: "✂️", label: "Cut" },
              { icon: "📋", label: "Copy" },
              { icon: "📥", label: "Paste" },
            ])}
            ${this.renderMenu("View", "view", [
              { icon: "🔄", label: "Reload tree" },
              { icon: "🪟", label: "Split view" },
              { icon: "🧭", label: "Compare…" },
            ])}
            ${this.renderMenu("Help", "help", [
              { icon: "📖", label: "Docs" },
              { icon: "❓", label: "About" },
            ])}
          </div>
        </div>

        <div class="main">
          <div class="activity">
            <div class="act ${this.activeActivity === "explorer" ? "active" : ""}" title="Explorer" @click=${() => this.setActivity("explorer")}>📁</div>
            <div class="act ${this.activeActivity === "search" ? "active" : ""}" title="Search" @click=${() => this.setActivity("search")}>🔎</div>
            <div class="act ${this.activeActivity === "entity" ? "active" : ""}" title="Entity" @click=${() => this.setActivity("entity")}>🗂️</div>
            <div class="act ${this.activeActivity === "snippet" ? "active" : ""}" title="Snippet" @click=${() => this.setActivity("snippet")}>📜</div>
          </div>

          <div class="sidebarBackdrop ${this.sidebarOpen ? "open" : ""}" @click=${() => (this.sidebarOpen = false)}></div>

          <div class="sidebar ${this.sidebarOpen ? "open" : ""}">
            <div class="sidebarHeader">
              <div class="explorerTitle">
                ${this.activeActivity === "explorer"
                  ? "Explorer"
                  : this.activeActivity === "search"
                    ? "Search"
                    : this.activeActivity === "entity"
                      ? "Entity"
                      : "Snippet"}
              </div>
              <button class="sidebarClose" title="Close" @click=${() => (this.sidebarOpen = false)}>✕</button>
            </div>
            ${this.renderSidebarContent()}
          </div>

          <div class="editor">
            <div class="tabs">
              ${this.tabs.length === 0
                ? html`<div class="tab active">Welcome</div>`
                : this.tabs.map(
                    (t) => html`
                      <div class="tab ${t.path === this.activePath ? "active" : ""}" @click=${() => this.switchTab(t.path)}>
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
                  <button class="btn" ?disabled=${!this.activePath || this.indenting} @click=${() => this.indentFile()}>
                    ${this.indenting ? "Formatting..." : "Indent file…"}
                  </button>
                </div>
              </div>

              ${this.splitViewEnabled
                ? html`<div class="splitWrap">
                    <div class="splitPane">
                      <div class="editorWrap">
                        <div class="gutter" ${ref((el) => (this.gutterRef = el))}>${this.renderLineNumbers()}</div>
                        <div class="codeWrap">
                          <div class="code" ${ref((el) => (this.codeRef = el))}>${this.renderHighlighted(this.content, diffMaps.left)}</div>
                          <textarea
                            ${ref((el) => (this.editorRef = el))}
                            .value=${this.content}
                            placeholder="Seleziona un file a sinistra…"
                            wrap="off"
                            @scroll=${this.syncScroll}
                            @input=${this.handleInput}
                            @keyup=${this.handleCursorMove}
                            @keydown=${this.handleEditorKeyDown}
                            @click=${this.handleCursorMove}
                            @mouseup=${this.handleCursorMove}
                            @select=${this.handleCursorMove}
                            @contextmenu=${this.handleContextMenu}
                            @focus=${() => this.startCursorTracking()}
                            @blur=${() => this.stopCursorTracking()}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div class="splitPane">
                      <div class="editorWrap">
                        <div class="gutter" ${ref((el) => (this.baseGutterRef = el))}>${this.renderLineNumbersFor(this.savedBaseText)}</div>
                        <div class="codeWrap">
                          <div class="code" ${ref((el) => (this.baseCodeRef = el))}>${this.renderHighlighted(this.savedBaseText, diffMaps.right)}</div>
                          <pre
                            class="basePre"
                            ${ref((el) => (this.basePreRef = el))}
                            @scroll=${this.syncBaseScroll}
                          >${this.savedBaseText}</pre>
                        </div>
                      </div>
                    </div>
                  </div>`
                : html`<div class="editorWrap">
                    <div class="gutter" ${ref((el) => (this.gutterRef = el))}>${this.renderLineNumbers()}</div>
                    <div class="codeWrap">
                      <div class="code" ${ref((el) => (this.codeRef = el))}>${this.renderHighlighted(this.content)}</div>
                      <textarea
                        ${ref((el) => (this.editorRef = el))}
                        .value=${this.content}
                        placeholder="Seleziona un file a sinistra…"
                        wrap="off"
                        @scroll=${this.syncScroll}
                        @input=${this.handleInput}
                        @keyup=${this.handleCursorMove}
                        @keydown=${this.handleEditorKeyDown}
                        @click=${this.handleCursorMove}
                        @mouseup=${this.handleCursorMove}
                        @select=${this.handleCursorMove}
                        @contextmenu=${this.handleContextMenu}
                        @focus=${() => this.startCursorTracking()}
                        @blur=${() => this.stopCursorTracking()}
                      ></textarea>
                    </div>
                  </div>`}

            </div>
          </div>
        </div>

        ${this.contextMenuOpen
          ? html`<div
              class="contextMenu"
              style="top:${this.contextMenuY}px; left:${this.contextMenuX}px;"
              @click=${(e: Event) => e.stopPropagation()}
            >
              <div class="contextMenuItem" @click=${() => this.handleCopyCut("cut")}>✂️ Cut</div>
              <div class="contextMenuItem" @click=${() => this.handleCopyCut("copy")}>📋 Copy</div>
              <div class="contextMenuItem" @click=${() => this.handlePaste()}>📥 Paste</div>
              <div class="contextMenuItem" @click=${() => this.reindentAll()}>🔧 Auto-indent</div>
              <div class="contextMenuItem" @click=${() => this.handleCompareFromContext()}>🧩 Compare…</div>
            </div>`
          : nothing}

        ${this.suggestOpen
          ? html`<div
              class="suggestBox"
              style="top:${this.suggestTop}px; left:${this.suggestLeft}px;"
            >
              ${this.suggestItems.map(
                (s, idx) => html`<div
                  class="suggestItem ${idx === this.suggestIndex ? "active" : ""}"
                  @mousedown=${(ev: Event) => {
                    ev.preventDefault();
                    this.suggestIndex = idx;
                    this.applySuggestion();
                  }}
                >
                  <span class="suggestItemLabel">
                    ${s.type === "entity" ? "🧭" : ""}
                    <span>${s.type === "mdi" ? `mdi:${s.value}` : s.value}</span>
                  </span>
                  ${s.type === "mdi"
                    ? html`<span class="suggestItemIcon">${this.renderMdiGlyph(s.codepoint)}</span>`
                    : nothing}
                </div>`
              )}
            </div>`
          : nothing}

        ${this.toastMessage
          ? html`<div class="toastContainer">
              <div class="toast ${this.toastType === "error" ? "error" : ""}">${this.toastMessage}</div>
            </div>`
          : nothing}

        ${this.newItemKind
          ? html`
              <div class="modalBackdrop" @click=${() => this.cancelNewItem()}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                  <h3>${this.newItemKind === "file" ? "New file" : "New folder"}</h3>
                  <label>
                    Name
                    <input
                      type="text"
                      .value=${this.newItemName}
                      @input=${(e: Event) => (this.newItemName = (e.target as HTMLInputElement).value)}
                      placeholder=${this.newItemKind === "file" ? "config" : "my_folder"}
                    />
                  </label>
                  ${this.newItemKind === "file"
                    ? html`<label>
                        Extension
                        <input
                          type="text"
                          .value=${this.newItemExt}
                          @input=${(e: Event) => (this.newItemExt = (e.target as HTMLInputElement).value)}
                          placeholder="yaml"
                        />
                      </label>`
                    : nothing}
                  <div class="actions">
                    <button class="btn" @click=${() => this.cancelNewItem()}>Cancel</button>
                    <button class="btn primary" @click=${() => this.createNewItem()}>Create</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        ${this.showAboutModal
          ? html`
              <div class="modalBackdrop" @click=${() => this.closeAboutModal()}>
                <div class="modal aboutModal" @click=${(e: Event) => e.stopPropagation()}>
                  <div class="aboutHeader">
                    <img class="aboutLogo" src=${this.iconUrl} alt="File Editor Plus" />
                    <h3>About</h3>
                  </div>
                  <div class="aboutBody">
                    <div class="aboutRow">
                      <div class="aboutLabel">Developer</div>
                      <div class="aboutValue">Juri Zanella</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">GitHub</div>
                      <div class="aboutValue">TheWhiteWolf1985</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">Repository</div>
                      <div class="aboutValue">
                        <a href="https://github.com/TheWhiteWolf1985/File-editor-plus" target="_blank" rel="noopener">
                          https://github.com/TheWhiteWolf1985/File-editor-plus
                        </a>
                      </div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">Version</div>
                      <div class="aboutValue">${this.appVersion}</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">License</div>
                      <div class="aboutValue">MIT</div>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="btn" @click=${() => this.closeAboutModal()}>Close</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        ${this.showSettingsModal
          ? html`
              <div class="modalBackdrop" @click=${() => this.cancelSettingsModal()}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:520px;">
                  <h3>Settings</h3>
                  <div class="settingsTabs">
                    <button
                      class="settingsTab ${this.settingsTab === "localization" ? "active" : ""}"
                      type="button"
                      @click=${() => (this.settingsTab = "localization")}
                    >
                      Localizzazione
                    </button>
                    <button
                      class="settingsTab ${this.settingsTab === "appearance" ? "active" : ""}"
                      type="button"
                      @click=${() => (this.settingsTab = "appearance")}
                    >
                      Aspetto
                    </button>
                  </div>
                  ${this.settingsTab === "appearance"
                    ? html`
                        <div class="settingsBody">
                          <div class="settingsRow">
                            <div>
                              <div class="settingsLabel">Dimensione caratteri</div>
                              <div class="settingsHint">Regola in tempo reale, salva con Apply.</div>
                            </div>
                            <div class="settingsValue">${Math.round(this.settingsFontBaseRem * 16)}px</div>
                          </div>
                          <input
                            class="settingsRange"
                            type="range"
                            min=${this.fontBaseMin}
                            max=${this.fontBaseMax}
                            step=${this.fontBaseStep}
                            .value=${String(this.settingsFontBaseRem)}
                            @input=${this.handleFontSizeInput}
                          />
                        </div>
                      `
                    : html`
                        <div class="settingsBody">
                          <div class="settingsHint">Impostazioni di localizzazione in arrivo.</div>
                        </div>
                      `}
                  <div class="actions">
                    <button class="btn" @click=${() => this.cancelSettingsModal()}>Cancel</button>
                    <button class="btn primary" @click=${() => this.applySettingsModal()}>Apply</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        ${this.showSnippetModal
          ? html`
              <div class="modalBackdrop" @click=${() => this.closeSnippetModal()}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:480px;">
                  <h3>New snippet</h3>
                  <label>
                    Title (max 100)
                    <input
                      type="text"
                      .value=${this.snippetName}
                      maxlength="100"
                      @input=${(e: Event) => (this.snippetName = (e.target as HTMLInputElement).value)}
                      required
                    />
                  </label>
                  <label>
                    Description (max 250)
                    <input
                      type="text"
                      .value=${this.snippetDescription}
                      maxlength="250"
                      @input=${(e: Event) => (this.snippetDescription = (e.target as HTMLInputElement).value)}
                      required
                    />
                  </label>
                  <label>
                    Content
                    <textarea
                      style="min-height:160px; background: var(--input-bg); color: var(--text-color); border:1px solid var(--border-color); border-radius:8px; padding:8px;"
                      .value=${this.snippetContent}
                      @input=${(e: Event) => (this.snippetContent = (e.target as HTMLTextAreaElement).value)}
                      required
                    ></textarea>
                  </label>
                  <div class="actions">
                    <button class="btn" ?disabled=${this.snippetSaving} @click=${() => this.closeSnippetModal()}>Cancel</button>
                    <button class="btn primary" ?disabled=${this.snippetSaving} @click=${() => this.saveSnippet()}>Save</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        <div class="statusbar">
          <div>${this.status}</div>
          <div class="version">v${this.appVersion}</div>
          <div class="right">
            <button class="statusToggle" @click=${() => (this.autoIndentEnabled = !this.autoIndentEnabled)}>
              Auto-indent: ${this.autoIndentEnabled ? "On" : "Off"}
            </button>
            <button class="statusToggle" @click=${() => this.cycleTheme()}>
              Theme: ${this.themeMode.charAt(0).toUpperCase()}${this.themeMode.slice(1)}
            </button>
            <span>Ln ${this.cursorLine}</span>
            <span>Col ${this.cursorCol}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Lit</span>
          </div>
        </div>
      </div>
    `;
  }
}
