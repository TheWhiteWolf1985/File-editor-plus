import { css } from "lit";

export const appStyles = css`
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
      --sidebar-width: 280px;
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
      grid-template-columns: 48px var(--sidebar-width) 1fr; /* activity, sidebar, editor */
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
    .activityGroup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .activityGroup.bottom {
      margin-top: auto;
      padding-bottom: 6px;
    }
    .mdiGlyph {
      font-family: "Material Design Icons";
      font-style: normal;
      font-weight: normal;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
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
      position: relative;
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
    .sidebarResizer {
      position: absolute;
      top: 0;
      right: 0;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      background: transparent;
      z-index: 5;
    }
    .sidebarResizer:hover,
    .sidebarResizer.active {
      background: rgba(255, 255, 255, 0.08);
    }

    .tree {
      padding: 8px 6px 12px;
      font-size: var(--font-size-md);
      overflow-y: auto;
      flex: 1;
      min-height: 0;
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
    .btn.danger {
      background: #b93a3a;
      border-color: #b93a3a;
      color: white;
    }
    .btn.danger:hover {
      background: #a13232;
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
      user-select: none;
      -webkit-user-select: none;
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
      user-select: none;
      -webkit-user-select: none;
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
    .systemPane {
      display: grid;
      gap: 12px;
    }
    .systemGrid {
      display: grid;
      gap: 10px;
    }
    .systemCard {
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px;
      background: var(--card-color);
      display: grid;
      gap: 6px;
      text-align: left;
      color: var(--text-color);
      cursor: pointer;
      box-shadow: var(--menu-shadow);
    }
    .systemCard:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .systemCardTitle {
      font-weight: 700;
      font-size: var(--font-size-md);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .systemCardDesc {
      font-size: var(--font-size-sm);
      color: var(--muted-color);
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
      .sidebarResizer {
        display: none;
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
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      color: inherit;
      font: inherit;
    }
    .contextMenuItem:hover {
      background: var(--hover-color);
    }
    .contextMenuItem.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    .suggestBox {
      position: absolute;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--menu-shadow);
      min-width: 220px;
      max-height: var(--suggest-max-height, 220px);
      overflow: auto;
      z-index: 350;
      color: var(--text-color);
      transform: translateY(0);
    }
    .suggestBox.above {
      transform: translateY(-4px) translateY(-100%);
    }
    .suggestBox.below {
      transform: translateY(4px);
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
