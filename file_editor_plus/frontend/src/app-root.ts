import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import type { HAClient, HassState } from "./ha-client";
import { appStyles } from "./styles/app-styles";
import { renderHighlighted, renderLineNumbers, renderLineNumbersFor } from "./features/editor/overlay";
import {
  openSearchMatch as searchOpenSearchMatch,
  performSearch as searchPerformSearch,
  renderSearchResults as searchRenderSearchResults,
  replaceAll as searchReplaceAll,
} from "./features/search/search";
import {
  closeSnippetModal as snippetCloseSnippetModal,
  deleteSnippet as snippetDeleteSnippet,
  insertSnippet as snippetInsertSnippet,
  loadSnippets as snippetLoadSnippets,
  openSnippetModal as snippetOpenSnippetModal,
  saveSnippet as snippetSaveSnippet,
} from "./features/snippets/snippets";
import { runBackup as systemRunBackup, runSystemAction as systemRunSystemAction } from "./features/system/system";
import {
  applySettingsModal as settingsApplySettingsModal,
  applyTheme as settingsApplyTheme,
  cancelSettingsModal as settingsCancelSettingsModal,
  cycleTheme as settingsCycleTheme,
  handleFontSizeInput as settingsHandleFontSizeInput,
  handleThemeChange as settingsHandleThemeChange,
  loadFontSettings as settingsLoadFontSettings,
  openSettingsModal as settingsOpenSettingsModal,
  persistUserConfig as settingsPersistUserConfig,
} from "./features/settings/settings";
import {
  applySuggestion as entitiesApplySuggestion,
  closeSuggestions as entitiesCloseSuggestions,
  fetchMdiSuggestions as entitiesFetchMdiSuggestions,
  getSuggestCoords as entitiesGetSuggestCoords,
  initEntities as entitiesInitEntities,
  insertEntityId as entitiesInsertEntityId,
  isSameSuggestItem as entitiesIsSameSuggestItem,
  openSuggestions as entitiesOpenSuggestions,
  renderEntityPane as entitiesRenderEntityPane,
  renderMdiGlyph as entitiesRenderMdiGlyph,
  scrollSuggestIntoView as entitiesScrollSuggestIntoView,
  syncCollapsedDomains as entitiesSyncCollapsedDomains,
  toggleDomain as entitiesToggleDomain,
  updateSuggestions as entitiesUpdateSuggestions,
} from "./features/entities/entities";
import {
  cancelNewItem as treeCancelNewItem,
  closeTreeMenu as treeCloseTreeMenu,
  confirmTreeDelete as treeConfirmTreeDelete,
  copyTreeItem as treeCopyTreeItem,
  createNewItem as treeCreateNewItem,
  executeTreeDelete as treeExecuteTreeDelete,
  handleTreeContextMenu as treeHandleTreeContextMenu,
  loadTree as treeLoadTree,
  pasteTreeItem as treePasteTreeItem,
  reloadTree as treeReloadTree,
  reloadTreePath as treeReloadTreePath,
  renderTree as treeRenderTree,
  toggleDir as treeToggleDir,
  cancelTreeDelete as treeCancelTreeDelete,
} from "./features/tree/tree";
import {
  apiFormatYaml,
  apiGetFile,
  apiGetUserConfig,
  apiPostDiff,
  apiSaveFile,
} from "./services/api";
import { FONT_BASE_MAX, FONT_BASE_MIN, FONT_BASE_STEP, FONT_DEFAULTS } from "./constants";
import type { MdiIcon, SearchResult, SearchSummary, Snippet, ThemeMode } from "./types/api";
import type { DiffHunk, DiffSummary, SuggestItem, Tab, TreeItem } from "./types/editor";

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = appStyles;

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
    sidebarResizing: { state: true },
    systemActionLoading: { state: true },
    systemActionPending: { state: true },
    backupLoading: { state: true },
    backupMode: { state: true },
    treeMenuOpen: { state: true },
    treeMenuX: { state: true },
    treeMenuY: { state: true },
    treeMenuPath: { state: true },
    treeMenuType: { state: true },
    showTreeDeleteModal: { state: true },
    deleteTargetPath: { state: true },
    deleteTargetType: { state: true },
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
  declare activeActivity: "explorer" | "search" | "entity" | "snippet" | "system" | "backup";
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
  declare themeMode: ThemeMode;
  declare suggestOpen: boolean;
  declare suggestItems: SuggestItem[];
  declare suggestContext: "entity" | "mdi" | null;
  declare suggestIndex: number;
  declare suggestTop: number;
  declare suggestLeft: number;
  declare suggestPlacement: "above" | "below";
  declare suggestMaxHeight: number;
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
  declare sidebarResizing: boolean;
  declare systemActionLoading: boolean;
  declare systemActionPending: string | null;
  declare backupLoading: boolean;
  declare backupMode: "download" | "saveas" | null;
  declare treeMenuOpen: boolean;
  declare treeMenuX: number;
  declare treeMenuY: number;
  declare treeMenuPath: string | null;
  declare treeMenuType: "file" | "dir" | null;
  declare showTreeDeleteModal: boolean;
  declare deleteTargetPath: string | null;
  declare deleteTargetType: "file" | "dir" | null;
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
  private mainRef: HTMLDivElement | null = null;
  private sidebarRef: HTMLDivElement | null = null;
  private baseCodeRef: HTMLDivElement | null = null;
  private baseGutterRef: HTMLDivElement | null = null;
  private basePreRef: HTMLPreElement | null = null;
  private cursorRaf: number | null = null;
  private lastCursorLine = 1;
  private lastCursorCol = 1;
  private toastTimer: number | null = null;
  private haClient: HAClient | null = null;
  private readonly fontDefaults = FONT_DEFAULTS;
  private readonly fontBaseMin = FONT_BASE_MIN;
  private readonly fontBaseMax = FONT_BASE_MAX;
  private readonly fontBaseStep = FONT_BASE_STEP;
  private fontBaseRem = this.fontDefaults.base;
  private readonly appVersion = "0.1.111";
  private readonly iconUrl = new URL("./assets/icon.png", import.meta.url).href;
  private lastDomains = new Set<string>();
  private themeMedia: MediaQueryList | null = null;
  private diffRequestId = 0;
  private diffDebounce: number | null = null;
  private mdiSuggestCache = new Map<string, MdiIcon[]>();
  private mdiSuggestRequestId = 0;
  private pendingJump: { path: string; line: number; col: number } | null = null;
  private treeClipboard: { path: string; type: "file" | "dir" } | null = null;
  private selectionListener = () => {
    if (!this.editorRef) return;
    const active = this.shadowRoot?.activeElement || document.activeElement;
    if (active !== this.editorRef) return;
    this.updateCursorFromPos(this.editorRef.selectionStart ?? 0, this.editorRef.value);
  };
  private loadTree = treeLoadTree.bind(this);
  private reloadTree = treeReloadTree.bind(this);
  private toggleDir = treeToggleDir.bind(this);
  private handleTreeContextMenu = treeHandleTreeContextMenu.bind(this);
  private closeTreeMenu = treeCloseTreeMenu.bind(this);
  private copyTreeItem = treeCopyTreeItem.bind(this);
  private pasteTreeItem = treePasteTreeItem.bind(this);
  private confirmTreeDelete = treeConfirmTreeDelete.bind(this);
  private cancelTreeDelete = treeCancelTreeDelete.bind(this);
  private executeTreeDelete = treeExecuteTreeDelete.bind(this);
  private reloadTreePath = treeReloadTreePath.bind(this);
  private createNewItem = treeCreateNewItem.bind(this);
  private cancelNewItem = treeCancelNewItem.bind(this);
  private renderTree = treeRenderTree.bind(this);
  private performSearch = searchPerformSearch.bind(this);
  private replaceAll = searchReplaceAll.bind(this);
  private openSearchMatch = searchOpenSearchMatch.bind(this);
  private renderSearchResults = searchRenderSearchResults.bind(this);
  private loadSnippets = snippetLoadSnippets.bind(this);
  private openSnippetModal = snippetOpenSnippetModal.bind(this);
  private closeSnippetModal = snippetCloseSnippetModal.bind(this);
  private saveSnippet = snippetSaveSnippet.bind(this);
  private insertSnippet = snippetInsertSnippet.bind(this);
  private deleteSnippet = snippetDeleteSnippet.bind(this);
  private runSystemAction = systemRunSystemAction.bind(this);
  private runBackup = systemRunBackup.bind(this);
  private handleThemeChange = settingsHandleThemeChange.bind(this);
  private cycleTheme = settingsCycleTheme.bind(this);
  private applyTheme = settingsApplyTheme.bind(this);
  private persistUserConfig = settingsPersistUserConfig.bind(this);
  private loadFontSettings = settingsLoadFontSettings.bind(this);
  private openSettingsModal = settingsOpenSettingsModal.bind(this);
  private cancelSettingsModal = settingsCancelSettingsModal.bind(this);
  private applySettingsModal = settingsApplySettingsModal.bind(this);
  private handleFontSizeInput = settingsHandleFontSizeInput.bind(this);
  private closeSuggestions = entitiesCloseSuggestions.bind(this);
  private updateSuggestions = entitiesUpdateSuggestions.bind(this);
  private openSuggestions = entitiesOpenSuggestions.bind(this);
  private isSameSuggestItem = entitiesIsSameSuggestItem.bind(this);
  private getSuggestCoords = entitiesGetSuggestCoords.bind(this);
  private fetchMdiSuggestions = entitiesFetchMdiSuggestions.bind(this);
  private renderMdiGlyph = entitiesRenderMdiGlyph.bind(this);
  private applySuggestion = entitiesApplySuggestion.bind(this);
  private scrollSuggestIntoView = entitiesScrollSuggestIntoView.bind(this);
  private initEntities = entitiesInitEntities.bind(this);
  private toggleDomain = entitiesToggleDomain.bind(this);
  private insertEntityId = entitiesInsertEntityId.bind(this);
  private syncCollapsedDomains = entitiesSyncCollapsedDomains.bind(this);
  private renderEntityPane = entitiesRenderEntityPane.bind(this);

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
    this.suggestPlacement = "above";
    this.suggestMaxHeight = 220;
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
    this.sidebarResizing = false;
    this.systemActionLoading = false;
    this.systemActionPending = null;
    this.backupLoading = false;
    this.backupMode = null;
    this.treeMenuOpen = false;
    this.treeMenuX = 0;
    this.treeMenuY = 0;
    this.treeMenuPath = null;
    this.treeMenuType = null;
    this.showTreeDeleteModal = false;
    this.deleteTargetPath = null;
    this.deleteTargetType = null;
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
    this.stopSidebarResize();
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
      const res = await apiGetFile(this.apiBase, path);
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
      const res = await apiPostDiff(this.apiBase, payload);
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

  private startSidebarResize(e: MouseEvent) {
    e.preventDefault();
    this.sidebarResizing = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", this.handleSidebarResize);
    window.addEventListener("mouseup", this.stopSidebarResize);
  }

  private handleSidebarResize = (e: MouseEvent) => {
    if (!this.sidebarResizing) return;
    const hostRect = this.getBoundingClientRect();
    const mainRect = this.mainRef?.getBoundingClientRect() ?? hostRect;
    const sidebarRect = this.sidebarRef?.getBoundingClientRect();
    const sidebarLeft = sidebarRect ? sidebarRect.left : mainRect.left + 48;
    const minWidth = 200;
    const maxWidth = Math.max(minWidth, Math.floor(mainRect.width * 0.5));
    const nextWidth = Math.round(e.clientX - sidebarLeft);
    const clamped = Math.max(minWidth, Math.min(nextWidth, maxWidth));
    this.style.setProperty("--sidebar-width", `${clamped}px`);
  };

  private stopSidebarResize = () => {
    if (!this.sidebarResizing) return;
    this.sidebarResizing = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", this.handleSidebarResize);
    window.removeEventListener("mouseup", this.stopSidebarResize);
  };

  private async indentFile() {
    if (!this.activePath || this.indenting) {
      return;
    }
    this.indenting = true;
    this.status = "Formatting YAML...";
    try {
      const res = await apiFormatYaml(this.apiBase, this.content);
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
    if (this.treeMenuOpen) {
      const target = e.target as HTMLElement | null;
      const inside = target?.closest?.(".treeContextMenu");
      if (!inside) this.closeTreeMenu();
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

  private setActivity(name: "explorer" | "search" | "entity" | "snippet" | "system" | "backup") {
    this.activeActivity = name;
    if (this.isNarrowLayout()) {
      this.sidebarOpen = true;
    }
  }

  private openAboutModal() {
    this.showAboutModal = true;
  }

  private closeAboutModal() {
    this.showAboutModal = false;
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
    if (this.activeActivity === "backup") {
      const downloading = this.backupLoading && this.backupMode === "download";
      const saving = this.backupLoading && this.backupMode === "saveas";
      return html`<div class="sidebarContent systemPane">
        <div class="systemGrid">
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.backupLoading}
            @click=${() => this.runBackup("download")}
          >
            <div class="systemCardTitle">
              <span>💾</span>
              <span>${downloading ? "Backup locale..." : "Backup locale"}</span>
            </div>
            <div class="systemCardDesc">Crea uno zip della cartella /config e avvia il download.</div>
          </button>
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.backupLoading}
            @click=${() => this.runBackup("saveas")}
          >
            <div class="systemCardTitle">
              <span>🗂️</span>
              <span>${saving ? "Backup in rete..." : "Backup in rete"}</span>
            </div>
            <div class="systemCardDesc">Salva lo zip con la finestra di sistema (se supportata).</div>
          </button>
          <button class="systemCard" type="button" disabled>
            <div class="systemCardTitle">
              <span>☁️</span>
              <span>Backup su cloud</span>
            </div>
            <div class="systemCardDesc">Disponibile a breve.</div>
          </button>
        </div>
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
    if (this.activeActivity === "system") {
      const actions = [
        {
          id: "reload_yaml",
          label: "Reload YAML",
          desc: "Ricarica configuration.yaml e include.",
          icon: "🧾",
          confirm: false,
        },
        {
          id: "restart_core",
          label: "Restart Core",
          desc: "Riavvia Home Assistant Core.",
          icon: "🔄",
          confirm: true,
        },
        {
          id: "restart_supervisor",
          label: "Restart Supervisor",
          desc: "Riavvia Supervisor (gestione add-on).",
          icon: "🧩",
          confirm: true,
        },
        {
          id: "reboot_host",
          label: "Reboot Host",
          desc: "Riavvia il dispositivo/OS.",
          icon: "💻",
          confirm: true,
        },
        {
          id: "shutdown_host",
          label: "Shutdown Host",
          desc: "Spegni il dispositivo/OS.",
          icon: "⏻",
          confirm: true,
        },
      ];
      return html`<div class="sidebarContent systemPane">
        <div class="systemGrid">
          ${actions.map((action) => {
            const pending = this.systemActionPending === action.id;
            return html`<button
              class="systemCard"
              type="button"
              ?disabled=${this.systemActionLoading}
              @click=${() => this.runSystemAction(action.id, action.label, action.confirm)}
            >
              <div class="systemCardTitle">
                <span>${action.icon}</span>
                <span>${pending ? "In corso..." : action.label}</span>
              </div>
              <div class="systemCardDesc">${action.desc}</div>
            </button>`;
          })}
        </div>
      </div>`;
    }
    return this.renderEntityPane();
  }

  private async save() {
    if (!this.activePath) return;
    this.status = "Saving...";
    try {
      const res = await apiSaveFile(this.apiBase, this.activePath, this.content);
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

        <div class="main" ${ref((el) => (this.mainRef = el))}>
          <div class="activity">
            <div class="activityGroup">
              <div class="act ${this.activeActivity === "explorer" ? "active" : ""}" title="Explorer" @click=${() => this.setActivity("explorer")}>📁</div>
              <div class="act ${this.activeActivity === "search" ? "active" : ""}" title="Search" @click=${() => this.setActivity("search")}>🔎</div>
              <div class="act ${this.activeActivity === "entity" ? "active" : ""}" title="Entity" @click=${() => this.setActivity("entity")}>🗂️</div>
              <div class="act ${this.activeActivity === "snippet" ? "active" : ""}" title="Snippet" @click=${() => this.setActivity("snippet")}>📜</div>
              <div class="act ${this.activeActivity === "backup" ? "active" : ""}" title="Backup" @click=${() => this.setActivity("backup")}>💾</div>
            </div>
            <div class="activityGroup bottom">
              <div class="act ${this.activeActivity === "system" ? "active" : ""}" title="System" @click=${() => this.setActivity("system")}>
                <span class="mdiGlyph">${this.renderMdiGlyph("F0425")}</span>
              </div>
            </div>
          </div>

          <div class="sidebarBackdrop ${this.sidebarOpen ? "open" : ""}" @click=${() => (this.sidebarOpen = false)}></div>

          <div class="sidebar ${this.sidebarOpen ? "open" : ""}" ${ref((el) => (this.sidebarRef = el))}>
            <div class="sidebarHeader">
              <div class="explorerTitle">
                ${this.activeActivity === "explorer"
                  ? "Explorer"
                  : this.activeActivity === "search"
                    ? "Search"
                    : this.activeActivity === "entity"
                      ? "Entity"
                      : this.activeActivity === "snippet"
                        ? "Snippet"
                        : this.activeActivity === "backup"
                          ? "Backup"
                          : "System"}
              </div>
              <button class="sidebarClose" title="Close" @click=${() => (this.sidebarOpen = false)}>✕</button>
            </div>
            ${this.renderSidebarContent()}
            <div class="sidebarResizer ${this.sidebarResizing ? "active" : ""}" @mousedown=${this.startSidebarResize}></div>
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
                        <div class="gutter" ${ref((el) => (this.gutterRef = el))}>${renderLineNumbers(this.lineCount)}</div>
                        <div class="codeWrap">
                      <div class="code" ${ref((el) => (this.codeRef = el))}>${renderHighlighted(this.content, diffMaps.left)}</div>
                      <textarea
                        ${ref((el) => (this.editorRef = el))}
                        .value=${this.content}
                        placeholder="Seleziona un file a sinistra…"
                        spellcheck="false"
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
                        <div class="gutter" ${ref((el) => (this.baseGutterRef = el))}>${renderLineNumbersFor(this.savedBaseText)}</div>
                        <div class="codeWrap">
                          <div class="code" ${ref((el) => (this.baseCodeRef = el))}>${renderHighlighted(this.savedBaseText, diffMaps.right)}</div>
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
                    <div class="gutter" ${ref((el) => (this.gutterRef = el))}>${renderLineNumbers(this.lineCount)}</div>
                    <div class="codeWrap">
                      <div class="code" ${ref((el) => (this.codeRef = el))}>${renderHighlighted(this.content)}</div>
                      <textarea
                        ${ref((el) => (this.editorRef = el))}
                        .value=${this.content}
                        placeholder="Seleziona un file a sinistra…"
                        spellcheck="false"
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

        ${this.treeMenuOpen
          ? html`<div
              class="contextMenu treeContextMenu"
              style="top:${this.treeMenuY}px; left:${this.treeMenuX}px;"
              @click=${(e: Event) => e.stopPropagation()}
            >
              <div class="contextMenuItem" @click=${() => this.copyTreeItem()}>📋 Copia</div>
              <div
                class="contextMenuItem ${this.treeClipboard ? "" : "disabled"}"
                @click=${() => this.pasteTreeItem()}
              >
                📥 Incolla
              </div>
              <div class="contextMenuItem" @click=${() => this.confirmTreeDelete()}>🗑️ Elimina</div>
            </div>`
          : nothing}

        ${this.suggestOpen
          ? html`<div
              class="suggestBox ${this.suggestPlacement}"
              style="top:${this.suggestTop}px; left:${this.suggestLeft}px; --suggest-max-height:${this.suggestMaxHeight}px;"
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

        ${this.showTreeDeleteModal
          ? html`<div class="modalBackdrop" @click=${() => this.cancelTreeDelete()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                <h3>Conferma eliminazione</h3>
                <div class="muted" style="font-size: var(--font-size-sm);">
                  Vuoi eliminare ${this.deleteTargetType === "dir" ? "la cartella" : "il file"}:
                  <strong>${this.deleteTargetPath}</strong>?
                </div>
                <div class="actions">
                  <button class="btn" @click=${() => this.cancelTreeDelete()}>Cancel</button>
                  <button class="btn danger" @click=${() => this.executeTreeDelete()}>Delete</button>
                </div>
              </div>
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
