import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import "./components/app-icon";
import { openImagePreviewOverlay } from "./components/image_preview_overlay";
import type { HAClient, HassState } from "./ha-client";
import { appStyles } from "./styles/app-styles";
import { figmaEditorStyles } from "./styles/figma-editor-styles";
import {
  computeIndentSegments,
  renderHighlighted,
  renderLineNumbers,
  renderLineNumbersFor,
} from "./features/editor/overlay";
import {
  openSearchMatch as searchOpenSearchMatch,
  performSearch as searchPerformSearch,
  renderSearchResults as searchRenderSearchResults,
  replaceAll as searchReplaceAll,
  replaceOne as searchReplaceOne,
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
  apiGetSession,
  apiPostDiff,
  apiSaveFile,
  apiCreateFile,
  apiGenerateDebugLog,
  apiUpload,
  apiMovePath,
  apiPutSession,
  apiPutSessionBuffer,
  apiGetSessionBuffer,
  apiResetSession,
  apiGdriveBackup,
  apiGdriveDeviceCancel,
  apiGdriveDeviceStart,
  apiGdriveDisconnect,
  apiGdriveGetSchedule,
  apiGdriveOauthStart,
  apiGdrivePutSchedule,
  apiGdriveStatus,
} from "./services/api";
import { SUPPORTED_LOCALES, getPersistedLocale, loadLocale, setLocale, t, type SupportedLocaleCode } from "./i18n";
import { FONT_BASE_MAX, FONT_BASE_MIN, FONT_BASE_STEP, FONT_DEFAULTS } from "./constants";
import type { MdiIcon, SearchResult, SearchSummary, Snippet, ThemeMode } from "./types/api";
import type { DiffHunk, DiffSummary, SuggestItem, Tab, TreeItem } from "./types/editor";

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = [appStyles, figmaEditorStyles];

  private apiBase = (() => {
    const base = new URL("./", window.location.href).pathname;
    return base.endsWith("/") ? base : `${base}/`;
  })();

  private saveAsConflictResolver: ((choice: "overwrite" | "suffix" | "cancel") => void) | null = null;
  private gdrivePollTimer: number | null = null;

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
    activeIsDir: { state: true },
    activeDir: { state: true },
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
    selectedLocale: { state: true },
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
    treeDirty: { state: true },
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
    treeMenuFromBlank: { state: true },
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
    toolbarVisible: { state: true },
    showIndentGuides: { state: true },
    activeIndentSegmentId: { state: true },
    showUnsavedModal: { state: true },
    utilityGenerating: { state: true },
    showUploadModal: { state: true },
    showSaveAsModal: { state: true },
    saveAsTargetDir: { state: true },
    saveAsFilename: { state: true },
    saveAsInProgress: { state: true },
    saveAsConflictOpen: { state: true },
    saveAsConflictPath: { state: true },
    showGdriveModal: { state: true },
    gdriveStatus: { state: true },
    gdriveSchedule: { state: true },
    gdriveLoading: { state: true },
    gdriveSavingSchedule: { state: true },
    uploadTargetDir: { state: true },
    uploadInProgress: { state: true },
    uploadFiles: { state: true },
    uploadProgress: { state: true },
    pendingMove: { state: true },
    dropTargetPath: { state: true },
    moveConfirmOpen: { state: true },
    conflictDialogOpen: { state: true },
    conflictData: { state: true },
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
  declare activeActivity: "explorer" | "search" | "entity" | "snippet" | "system" | "backup" | "utility";
  declare toastMessage: string | null;
  declare toastType: "info" | "error";
  declare activeIsDir: boolean;
  declare activeDir: string;
  declare entityFilter: string;
  declare entities: Record<string, HassState>;
  declare entityError: string | null;
  declare collapsedDomains: Set<string>;
  declare autoIndentEnabled: boolean;
  declare toolbarVisible: boolean;
  declare showIndentGuides: boolean;
  declare activeIndentSegmentId: string | null;
  declare showUnsavedModal: boolean;
  declare utilityGenerating: boolean;
  declare showUploadModal: boolean;
  declare showSaveAsModal: boolean;
  declare saveAsTargetDir: string;
  declare saveAsFilename: string;
  declare saveAsInProgress: boolean;
  declare saveAsConflictOpen: boolean;
  declare saveAsConflictPath: string | null;
  declare showGdriveModal: boolean;
  declare gdriveStatus: any;
  declare gdriveSchedule: any;
  declare gdriveLoading: boolean;
  declare gdriveSavingSchedule: boolean;
  declare uploadTargetDir: string;
  declare uploadFile: File | null;
  declare uploadFiles: File[];
  declare uploadInProgress: boolean;
  declare uploadProgress: { done: number; total: number } | null;
  declare pendingMove: { src: string; dstDir: string } | null;
  declare dropTargetPath: string | null;
  declare moveConfirmOpen: boolean;
  declare conflictDialogOpen: boolean;
  declare conflictData: { type: "upload" | "move"; name: string; target: string } | null;
  declare showResetSessionModal: boolean;
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
  declare selectedLocale: SupportedLocaleCode;
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
  declare treeMenuFromBlank: boolean;
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
  treeDirty = false;
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
  private overlayRootRef: HTMLDivElement | null = null;
  private baseCodeRef: HTMLDivElement | null = null;
  private baseGutterRef: HTMLDivElement | null = null;
  private basePreRef: HTMLPreElement | null = null;
  private cursorRaf: number | null = null;
  private sessionSaveTimer: number | null = null;
  private lastSessionSnapshot: string | null = null;
  private safeView(v: any) {
    return {
      scrollTop: Number(v?.scrollTop ?? 0),
      selStart: Number(v?.selStart ?? 0),
      selEnd: Number(v?.selEnd ?? 0),
    };
  }
  private restoringSession = false;
  private bufferSaveTimers: Map<string, number> = new Map();
  private restoredBufferCount = 0;
  private readonly maxBufferBytes = 256 * 1024;
  private readonly maxBufferFiles = 10;
  private pendingViewApply: Record<string, { scrollTop?: number; selStart?: number; selEnd?: number }> = {};
  private readonly indentUnit = "  ";
  private dirtySessionToastShown = false;
  private readonly maxPreviewBytes = 20 * 1024 * 1024;
  private lastCursorLine = 1;
  private lastCursorCol = 1;
  private toastTimer: number | null = null;
  private haClient: HAClient | null = null;
  private readonly handleI18nChanged = () => this.requestUpdate();
  private readonly fontDefaults = FONT_DEFAULTS;
  private readonly fontBaseMin = FONT_BASE_MIN;
  private readonly fontBaseMax = FONT_BASE_MAX;
  private readonly fontBaseStep = FONT_BASE_STEP;
  private fontBaseRem = this.fontDefaults.base;
  private readonly appVersion = (() => {
    const value = (import.meta.env.VITE_APP_VERSION ?? "").trim();
    return value.length > 0 ? value : "unknown";
  })();
  private readonly iconUrl = new URL("./assets/icon.png", import.meta.url).href;
  private lastDomains = new Set<string>();
  private themeMedia: MediaQueryList | null = null;
  private diffRequestId = 0;
  private diffDebounce: number | null = null;
  private mdiSuggestCache = new Map<string, MdiIcon[]>();
  private mdiSuggestRequestId = 0;
  private pendingJump: { path: string; line: number; col: number } | null = null;
  private pendingUnsavedAction: { type: "open" | "close"; path: string } | null = null;
  private treeClipboard: { path: string; type: "file" | "dir" } | null = null;
  private draggingPath: string | null = null;
  private draggingType: "file" | "dir" | null = null;
  private beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    if (this.isActiveDirty()) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  private conflictResolver: ((choice: "skip" | "overwrite" | "autorename") => void) | null = null;
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
  private queueMove = (src: string, dstDir: string) => {
    this.pendingMove = { src, dstDir };
    this.moveConfirmOpen = true;
  };

  private cancelMoveConfirm() {
    this.pendingMove = null;
    this.moveConfirmOpen = false;
  }

  private async confirmMove() {
    if (!this.pendingMove) {
      this.moveConfirmOpen = false;
      return;
    }
    const { src, dstDir } = this.pendingMove;
    await this.performMove(src, dstDir);
  }
  private handleTreeDragStart(e: DragEvent, item: TreeItem) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData("application/json", JSON.stringify({ path: item.path, isDir: item.type === "dir" }));
    e.dataTransfer.effectAllowed = "move";
    this.draggingPath = item.path;
    this.draggingType = item.type;
  }
  private handleTreeDragOver(e: DragEvent, item: TreeItem) {
    if (item.type !== "dir" || item.writable === false) {
      this.dropTargetPath = null;
      return;
    }
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    this.dropTargetPath = item.path || "/";
  }
  private handleTreeDragLeave(_e: DragEvent, item: TreeItem) {
    if (this.dropTargetPath === (item.path || "/")) {
      this.dropTargetPath = null;
    }
  }
  private handleTreeDrop(e: DragEvent, item: TreeItem) {
    if (item.type !== "dir") return;
    e.preventDefault();
    if (item.writable === false) {
      this.showToast(t("tree.toast.readonly_folder"), "error");
      return;
    }
    let payload: { path?: string; isDir?: boolean } | null = null;
    try {
      payload = e.dataTransfer?.getData("application/json") ? JSON.parse(e.dataTransfer.getData("application/json")) : null;
    } catch {
      payload = null;
    }
    const src = payload?.path || this.draggingPath;
    const srcType = payload?.isDir ? "dir" : this.draggingType;
    this.dropTargetPath = null;
    if (!src) return;
    const dstDir = item.path || "/";
    if (srcType === "dir" && (dstDir === src || dstDir.startsWith(src + "/"))) {
      this.showToast(t("tree.toast.invalid_move_self"), "error");
      return;
    }
    this.queueMove(src, dstDir);
  }
  private handleTreeRootDragOver(e: DragEvent) {
    if (e.target && (e.target as HTMLElement).closest(".treeRow")) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    this.dropTargetPath = "/";
  }
  private handleTreeRootDrop(e: DragEvent) {
    if (e.target && (e.target as HTMLElement).closest(".treeRow")) return;
    e.preventDefault();
    let payload: { path?: string; isDir?: boolean } | null = null;
    try {
      payload = e.dataTransfer?.getData("application/json") ? JSON.parse(e.dataTransfer.getData("application/json")) : null;
    } catch {
      payload = null;
    }
    const src = payload?.path || this.draggingPath;
    const srcType = payload?.isDir ? "dir" : this.draggingType;
    this.dropTargetPath = null;
    if (!src) {
      this.showToast(t("toast.move.missing_source"), "error");
      return;
    }
    const dstDir = "";
    if (srcType === "dir" && (dstDir === src || dstDir.startsWith(src + "/"))) {
      this.showToast(t("tree.toast.invalid_move_self"), "error");
      return;
    }
    this.queueMove(src, dstDir);
  }
  private performSearch = searchPerformSearch.bind(this);
  private replaceAll = searchReplaceAll.bind(this);
  private replaceOne = searchReplaceOne.bind(this);
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
  private resolveThemeMode(): "dark" | "light" {
    if (this.themeMode === "auto") {
      const prefersDark = this.themeMedia ? this.themeMedia.matches : true;
      return prefersDark ? "dark" : "light";
    }
    return this.themeMode;
  }
  private applyTheme() {
    settingsApplyTheme.call(this);
    const resolvedTheme = this.resolveThemeMode();
    this.setAttribute("data-theme", resolvedTheme);
  }
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
    this.activeIsDir = false;
    this.activeDir = "/";
    this.collapsedDomains = new Set<string>();
    this.autoIndentEnabled = true;
    this.toolbarVisible = true;
    this.showIndentGuides = false;
    this.activeIndentSegmentId = null;
    this.showUnsavedModal = false;
    this.utilityGenerating = false;
    this.showUploadModal = false;
    this.showSaveAsModal = false;
    this.saveAsTargetDir = "/";
    this.saveAsFilename = "";
    this.saveAsInProgress = false;
    this.saveAsConflictOpen = false;
    this.saveAsConflictPath = null;
    this.showGdriveModal = false;
    this.gdriveStatus = null;
    this.gdriveSchedule = null;
    this.gdriveLoading = false;
    this.gdriveSavingSchedule = false;
    this.uploadTargetDir = "/";
    this.uploadFile = null;
    this.uploadFiles = [];
    this.uploadInProgress = false;
    this.uploadProgress = null;
    this.pendingMove = null;
    this.dropTargetPath = null;
    this.moveConfirmOpen = false;
    this.conflictDialogOpen = false;
    this.conflictData = null;
    this.conflictDialogOpen = false;
    this.conflictData = null;
    this.conflictDialogOpen = false;
    this.conflictData = null;
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
    this.selectedLocale = getPersistedLocale();
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
    this.treeMenuFromBlank = false;
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
    this.showResetSessionModal = false;
  }

  connectedCallback() {
    super.connectedCallback();
    const locale = getPersistedLocale();
    this.selectedLocale = locale;
    void loadLocale(locale).then(() => {
      setLocale(locale);
      this.requestUpdate();
    });
    window.addEventListener("i18n-changed", this.handleI18nChanged);
    if (!this.loadedPaths.has("")) {
      this.loadTree("");
    }
    this.themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    this.themeMedia.addEventListener("change", this.handleThemeChange);
    this.applyTheme();
    void this.loadFontSettings();
    document.addEventListener("selectionchange", this.selectionListener);
    document.addEventListener("click", this.handleGlobalClick, true);
    window.addEventListener("beforeunload", this.beforeUnloadHandler);
    this.loadSnippets();
    this.initEntities();
    void this.restoreSession();
  }

  disconnectedCallback(): void {
    window.removeEventListener("i18n-changed", this.handleI18nChanged);
    document.removeEventListener("selectionchange", this.selectionListener);
    document.removeEventListener("click", this.handleGlobalClick, true);
    window.removeEventListener("beforeunload", this.beforeUnloadHandler);
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
    if (this.gdrivePollTimer !== null) {
      window.clearInterval(this.gdrivePollTimer);
      this.gdrivePollTimer = null;
    }
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has("content") ||
      changedProperties.has("activePath") ||
      changedProperties.has("splitViewEnabled")
    ) {
      requestAnimationFrame(() => {
        this.syncEditorOverlay();
        this.syncBaseOverlay();
      });
    }
  }

  private async selectLocale(locale: SupportedLocaleCode) {
    this.selectedLocale = locale;
    setLocale(locale);
    await loadLocale(locale);
    this.requestUpdate();
  }

  private requestOpenFile(path: string, sizeBytes?: number) {
    if (this.isImagePath(path)) {
      const url = `${this.apiBase}api/fs/download?path=${encodeURIComponent(path)}`;
      const filename = path.split("/").pop() || path;
      const ext = (filename.split(".").pop() || "").toLowerCase();
      openImagePreviewOverlay({
        srcUrl: url,
        filename,
        sizeBytes,
        ext,
        onError: (msg?: string) => this.showToast(msg || t("modal.preview.error_load"), "error"),
        mountRoot: this.overlayRootRef ?? this.shadowRoot ?? this,
      });
      return;
    }
    if (this.activePath === path) {
      if (!this.tabs.find((t) => t.path === path)) {
        this.openFile(path);
      }
      return;
    }
    if (this.isActiveDirty()) {
      this.pendingUnsavedAction = { type: "open", path };
      this.showUnsavedModal = true;
      return;
    }
    this.openFile(path);
  }

  private async generateDebugLog() {
    if (this.utilityGenerating) return;
    this.utilityGenerating = true;
    this.status = t("status.debug_log_generating");
    try {
      const res = await apiGenerateDebugLog(this.apiBase);
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      if (!res.ok || payload?.ok !== true) {
        const msg = payload?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const fname = payload?.filename || "debug log";
      await this.notifyFsChanged();
      this.showToast(t("toast.debug_log_created", { filename: fname }));
      this.status = t("status.ready");
    } catch (e) {
      this.showToast(t("toast.debug_log_error"), "error");
      this.status = t("status.debug_log_error");
    } finally {
      this.utilityGenerating = false;
      if (this.status === t("status.debug_log_error")) {
        setTimeout(() => (this.status = t("status.ready")), 1200);
      }
    }
  }

  private openUploadModal() {
    const defaultDir = this.isDirWritable(this.activeDir || "/")
      ? this.normalizeDir(this.activeDir || "/")
      : (this.getDirectoryOptions().find((d) => d.writable)?.path ?? "/");
    this.uploadTargetDir = defaultDir || "/";
    this.uploadFile = null;
    this.uploadFiles = [];
    this.uploadProgress = null;
    this.showUploadModal = true;
  }

  private openSaveAsModal() {
    if (!this.activePath) {
      this.showToast(t("toast.editor.open_file_first"), "info");
      return;
    }
    const parts = this.activePath.split("/");
    const name = parts.pop() || this.activePath;
    const dir = parts.length ? parts.join("/") : "/";
    this.saveAsTargetDir = this.normalizeDir(dir || "/");
    this.saveAsFilename = name;
    this.saveAsInProgress = false;
    this.saveAsConflictOpen = false;
    this.saveAsConflictPath = null;
    this.showSaveAsModal = true;
  }

  private closeSaveAsModal() {
    if (this.saveAsInProgress) return;
    this.showSaveAsModal = false;
    this.saveAsConflictOpen = false;
    this.saveAsConflictPath = null;
    this.saveAsConflictResolver = null;
  }

  private buildSaveAsDestPath(dir: string, filename: string): string {
    const cleanName = filename.trim();
    if (!cleanName) return "";
    const cleanDir = this.normalizeDir(dir);
    return cleanDir === "/" ? cleanName : `${cleanDir}/${cleanName}`;
  }

  private isCreateConflict(res: Response, payload: any): boolean {
    if (res.status === 409) return true;
    if (res.status !== 400) return false;
    const msg = String(payload?.detail || payload?.error || "").toLowerCase();
    return msg.includes("already exists") || msg.includes("exists");
  }

  private nextAvailableFilename(filename: string, i: number): string {
    const base = filename.trim();
    const dot = base.lastIndexOf(".");
    const hasExt = dot > 0 && dot < base.length - 1;
    const stem = hasExt ? base.slice(0, dot) : base;
    const ext = hasExt ? base.slice(dot) : "";
    return `${stem} (${i})${ext}`;
  }

  private promptSaveAsConflict(destPath: string) {
    this.saveAsConflictPath = destPath;
    this.saveAsConflictOpen = true;
    return new Promise<"overwrite" | "suffix" | "cancel">((resolve) => {
      this.saveAsConflictResolver = resolve;
    });
  }

  private resolveSaveAsConflict(choice: "overwrite" | "suffix" | "cancel") {
    const resolver = this.saveAsConflictResolver;
    this.saveAsConflictResolver = null;
    this.saveAsConflictOpen = false;
    this.saveAsConflictPath = null;
    if (resolver) resolver(choice);
  }

  private async submitSaveAs() {
    if (this.saveAsInProgress) return;
    if (!this.activePath) {
      this.showToast(t("toast.editor.open_file_first"), "info");
      return;
    }
    const content = this.content ?? "";
    const initialDest = this.buildSaveAsDestPath(this.saveAsTargetDir, this.saveAsFilename);
    if (!initialDest) {
      this.showToast("Nome file non valido", "error");
      return;
    }
    if (initialDest.startsWith("/")) {
      this.showToast("Il percorso deve essere relativo a /config", "error");
      return;
    }

    this.saveAsInProgress = true;
    try {
      const tryCreate = async (destPath: string) => {
        const res = await apiCreateFile(this.apiBase, destPath, content);
        let payload: any = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        return { res, payload };
      };

      let destPath = initialDest;
      while (true) {
        const { res, payload } = await tryCreate(destPath);
        if (res.ok && payload?.ok === true) {
          this.showSaveAsModal = false;
          this.openFile(destPath);
          this.showToast("File salvato", "info");
          return;
        }

        if (this.isCreateConflict(res, payload)) {
          const choice = await this.promptSaveAsConflict(destPath);
          if (choice === "cancel") {
            this.showToast("Operazione annullata", "info");
            return;
          }
          if (choice === "overwrite") {
            const overwrite = await apiSaveFile(this.apiBase, destPath, content);
            let overPayload: any = null;
            try {
              overPayload = await overwrite.json();
            } catch {
              overPayload = null;
            }
            if (overwrite.ok && overPayload?.ok === true) {
              this.showSaveAsModal = false;
              this.openFile(destPath);
              this.showToast("File sovrascritto", "info");
              return;
            }
            const msg = overPayload?.detail || overPayload?.error || `HTTP ${overwrite.status}`;
            this.showToast(String(msg), "error");
            return;
          }

          // suffix
          for (let i = 1; i < 200; i++) {
            const tryName = this.nextAvailableFilename(this.saveAsFilename, i);
            const tryPath = this.buildSaveAsDestPath(this.saveAsTargetDir, tryName);
            const { res: retryRes, payload: retryPayload } = await tryCreate(tryPath);
            if (retryRes.ok && retryPayload?.ok === true) {
              this.showSaveAsModal = false;
              this.openFile(tryPath);
              this.showToast("File salvato", "info");
              return;
            }
            if (!this.isCreateConflict(retryRes, retryPayload)) {
              const msg = retryPayload?.detail || retryPayload?.error || `HTTP ${retryRes.status}`;
              this.showToast(String(msg), "error");
              return;
            }
          }
          this.showToast("Impossibile trovare un nome disponibile", "error");
          return;
        }

        const msg = payload?.detail || payload?.error || `HTTP ${res.status}`;
        this.showToast(String(msg), "error");
        return;
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn("save-as failed", e);
      this.showToast("Errore Save As", "error");
    } finally {
      this.saveAsInProgress = false;
    }
  }

  private async loadGdriveState() {
    const [statusRes, scheduleRes] = await Promise.all([
      apiGdriveStatus(this.apiBase),
      apiGdriveGetSchedule(this.apiBase),
    ]);
    const statusPayload = await statusRes.json().catch(() => null);
    const schedulePayload = await scheduleRes.json().catch(() => null);
    this.gdriveStatus = statusPayload;
    this.gdriveSchedule = schedulePayload;
  }

  private async openGdriveModal() {
    this.showGdriveModal = true;
    this.gdriveLoading = true;
    try {
      await this.loadGdriveState();
    } catch (e) {
      if (import.meta.env.DEV) console.warn("gdrive load failed", e);
      this.showToast("Errore caricamento Google Drive", "error");
    } finally {
      this.gdriveLoading = false;
    }
  }

  private closeGdriveModal() {
    this.showGdriveModal = false;
    if (this.gdrivePollTimer !== null) {
      window.clearInterval(this.gdrivePollTimer);
      this.gdrivePollTimer = null;
    }
  }

  private startGdriveStatusPolling() {
    if (this.gdrivePollTimer !== null) return;
    this.gdrivePollTimer = window.setInterval(async () => {
      try {
        const s = await apiGdriveStatus(this.apiBase);
        const sp = await s.json().catch(() => null);
        this.gdriveStatus = sp;
        if (sp?.connected) {
          window.clearInterval(this.gdrivePollTimer!);
          this.gdrivePollTimer = null;
          await this.loadGdriveState();
          this.showToast("Google Drive connesso");
          return;
        }
        const st = sp?.device_flow?.status;
        if (st === "expired" || st === "error") {
          window.clearInterval(this.gdrivePollTimer!);
          this.gdrivePollTimer = null;
        }
      } catch {
        // ignore transient polling failures
      }
    }, 2000);
  }

  private async startGdriveOAuthFlow() {
    this.gdriveLoading = true;
    try {
      const res = await apiGdriveOauthStart(this.apiBase);
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.ok !== true || !payload?.auth_url) {
        const msg = payload?.detail || payload?.error || `HTTP ${res.status}`;
        const lowered = String(msg).toLowerCase();
        if (lowered.includes("client_id")) {
          this.showToast("OAuth non disponibile: passo al Device Flow", "info");
          await this.startGdriveDeviceFlow();
          return;
        }
        this.showToast(String(msg), "error");
        return;
      }
      const popup = window.open(String(payload.auth_url), "gdrive_oauth", "width=520,height=720,noopener,noreferrer");
      if (!popup) {
        this.showToast("Popup bloccato: avvio Device Flow", "info");
        await this.startGdriveDeviceFlow();
        return;
      }
      popup.focus();
      this.showToast("Completa l'accesso Google nella finestra aperta", "info");
      this.startGdriveStatusPolling();
    } finally {
      this.gdriveLoading = false;
    }
  }

  private async startGdriveDeviceFlow() {
    this.gdriveLoading = true;
    try {
      const res = await apiGdriveDeviceStart(this.apiBase);
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.ok !== true) {
        const msg = payload?.detail || payload?.error || `HTTP ${res.status}`;
        this.showToast(String(msg), "error");
        return;
      }
      this.gdriveStatus = { ...(this.gdriveStatus || {}), device_flow: payload };
      this.showToast("Connetti Google Drive: inserisci il codice nel link mostrato", "info");
      this.startGdriveStatusPolling();
    } finally {
      this.gdriveLoading = false;
    }
  }

  private async cancelGdriveDeviceFlow() {
    try {
      await apiGdriveDeviceCancel(this.apiBase);
      await this.loadGdriveState();
    } catch {
      // ignore
    }
  }

  private async disconnectGdrive() {
    this.gdriveLoading = true;
    try {
      const res = await apiGdriveDisconnect(this.apiBase);
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.ok !== true) {
        const msg = payload?.detail || payload?.error || `HTTP ${res.status}`;
        this.showToast(String(msg), "error");
        return;
      }
      await this.loadGdriveState();
      this.showToast("Google Drive disconnesso");
    } finally {
      this.gdriveLoading = false;
    }
  }

  private async runGdriveBackupNow() {
    this.gdriveLoading = true;
    try {
      const res = await apiGdriveBackup(this.apiBase);
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.ok !== true) {
        const msg = payload?.detail || payload?.error || `HTTP ${res.status}`;
        this.showToast(String(msg), "error");
        return;
      }
      this.showToast("Backup cloud avviato/completato");
    } finally {
      this.gdriveLoading = false;
    }
  }

  private async saveGdriveSchedule() {
    const cfg = this.gdriveSchedule;
    if (!cfg || typeof cfg !== "object") return;
    const enabled = !!cfg.enabled;
    const modeRaw = String(cfg.mode || "daily");
    const mode = (modeRaw === "hourly" || modeRaw === "daily" || modeRaw === "weekly" || modeRaw === "monthly" ? modeRaw : "daily") as
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly";

    const reqPayload: any = { enabled, mode };

    const retentionCount = Number(cfg.retention_count ?? cfg.retention ?? 0);
    reqPayload.retention_count = Number.isFinite(retentionCount) ? Math.max(0, Math.min(200, retentionCount)) : 0;

    if (mode === "hourly") {
      const interval = Number(cfg.hour_interval ?? 1);
      reqPayload.hour_interval = Number.isFinite(interval) ? Math.max(1, Math.min(24, interval)) : 1;
    } else {
      const atTime = String(cfg.at_time || cfg.time || "03:00");
      reqPayload.at_time = atTime;
      if (mode === "weekly") {
        reqPayload.weekday = String(cfg.weekday || "mon");
      }
      if (mode === "monthly") {
        const md = Number(cfg.monthday ?? 1);
        reqPayload.monthday = Number.isFinite(md) ? Math.max(1, Math.min(28, md)) : 1;
      }
    }
    this.gdriveSavingSchedule = true;
    try {
      const res = await apiGdrivePutSchedule(this.apiBase, reqPayload);
      const respPayload = await res.json().catch(() => null);
      if (!res.ok || respPayload?.ok !== true) {
        const msg = respPayload?.detail || respPayload?.error || `HTTP ${res.status}`;
        this.showToast(String(msg), "error");
        return;
      }
      this.gdriveSchedule = respPayload;
      this.showToast("Schedulazione aggiornata");
    } finally {
      this.gdriveSavingSchedule = false;
    }
  }

  private triggerPathDownload(path: string) {
    const url = `${this.apiBase}api/fs/download?path=${encodeURIComponent(path)}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    link.rel = "noopener";
    document.documentElement.appendChild(link);
    link.click();
    link.remove();
  }

  private closeUploadModal() {
    if (this.uploadInProgress) return;
    this.showUploadModal = false;
    this.uploadFile = null;
    this.uploadFiles = [];
    this.uploadInProgress = false;
    this.uploadProgress = null;
    this.uploadTargetDir = this.normalizeDir(this.activeDir || "/");
  }

  private handleUploadFileChange(e: Event) {
    const input = e.target as HTMLInputElement | null;
    const files = input?.files ? Array.from(input.files) : [];
    this.uploadFiles = files;
    this.uploadFile = files[0] ?? null;
  }

  private promptConflict(type: "upload" | "move", name: string, target: string) {
    this.conflictData = { type, name, target };
    this.conflictDialogOpen = true;
    return new Promise<"skip" | "overwrite" | "autorename">((resolve) => {
      this.conflictResolver = resolve;
    });
  }

  private resolveConflict(choice: "skip" | "overwrite" | "autorename") {
    if (this.conflictResolver) {
      this.conflictResolver(choice);
    }
    this.conflictResolver = null;
    this.conflictDialogOpen = false;
    this.conflictData = null;
  }

  private async submitUpload() {
    if (this.uploadInProgress) return;
    if (!this.uploadFiles || this.uploadFiles.length === 0) {
      this.showToast(t("modal.upload.error_select_files"), "error");
      return;
    }
    if (!this.isDirWritable(this.uploadTargetDir)) {
      this.showToast(t("modal.upload.error_readonly_destination"), "error");
      return;
    }
    const dir = this.uploadTargetDir || "/";
    const targetDir = dir === "/" ? "/config" : dir;
    this.uploadInProgress = true;
    this.uploadProgress = { done: 0, total: this.uploadFiles.length };
    let success = 0;
    try {
      for (const file of this.uploadFiles) {
        let res: Response | null = null;
        let payload: any = null;
        try {
          res = await apiUpload(this.apiBase, file, targetDir, "fail");
          try {
            payload = await res.json();
          } catch {
            payload = null;
          }
        } catch (e) {
          this.showToast(t("modal.upload.error_upload_file", { name: file.name }), "error");
          this.uploadProgress = { done: (this.uploadProgress?.done ?? 0) + 1, total: this.uploadFiles.length };
          continue;
        }

        if (!res.ok || payload?.ok !== true) {
          if (res.status === 409) {
            const choice = await this.promptConflict("upload", file.name, targetDir);
            if (choice !== "skip") {
              const retry = await apiUpload(this.apiBase, file, targetDir, choice);
              let retryPayload: any = null;
              try {
                retryPayload = await retry.json();
              } catch {
                retryPayload = null;
              }
              if (retry.ok && retryPayload?.ok === true) {
                const fname = retryPayload?.path || file.name;
                this.showToast(t("modal.upload.file_uploaded", { name: fname }));
                success += 1;
              } else {
                this.showToast(t("modal.upload.error_upload_file", { name: file.name }), "error");
              }
            }
          } else if (res.status === 413) {
            this.showToast(t("modal.upload.error_file_too_large", { name: file.name }), "error");
          } else if (res.status === 404) {
            this.showToast(t("modal.upload.error_destination_not_found"), "error");
          } else if (res.status === 400 || res.status === 415) {
            this.showToast(t("modal.upload.error_invalid_name", { name: file.name }), "error");
          } else {
            const msg = payload?.detail || payload?.error || `HTTP ${res.status}`;
            this.showToast(t("modal.upload.error_file_detail", { name: file.name, detail: msg }), "error");
          }
        } else {
          const fname = payload?.path || file.name;
          this.showToast(t("modal.upload.file_uploaded", { name: fname }));
          success += 1;
        }

        this.uploadProgress = { done: (this.uploadProgress?.done ?? 0) + 1, total: this.uploadFiles.length };
      }

      this.showToast(t("modal.upload.completed", { success, total: this.uploadFiles.length }));
      if (success > 0) {
        await this.notifyFsChanged();
      }
      this.closeUploadModal();
    } finally {
      this.uploadInProgress = false;
      this.uploadProgress = null;
    }
  }

  private async performMove(src: string, dstDir: string, mode: "fail" | "overwrite" | "autorename" = "fail"): Promise<void> {
    const payloadDst = dstDir === "/" ? "" : dstDir;
    try {
      const res = await apiMovePath(this.apiBase, src, payloadDst, mode);
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      if (!res.ok || body?.ok !== true) {
        if (res.status === 409) {
          if (mode !== "fail") {
            this.showToast(t("toast.move.destination_conflict"), "error");
            return;
          }
          const choice = await this.promptConflict("move", src.split("/").pop() || src, dstDir || "/");
          if (choice === "skip") return;
          return await this.performMove(src, dstDir, choice);
        } else if (res.status === 400) {
          this.showToast(body?.detail || t("toast.move.invalid"), "error");
        } else if (res.status === 404) {
          this.showToast(t("toast.move.not_found"), "error");
        } else {
          this.showToast(t("toast.move.error_http", { status: res.status }), "error");
        }
        return;
      }
      const dstPath = (body?.dst as string) || null;
      this.showToast(t("toast.move.moved", { name: src.split("/").pop() || src }));

      if (dstPath) {
        // Aggiorna tab aperti che puntavano al vecchio path
        const updatedTabs = this.tabs.map((t) => (t.path === src ? { ...t, path: dstPath, name: dstPath.split("/").pop() || dstPath } : t));
        const activeChanged = this.activePath === src;
        if (activeChanged) {
          this.activePath = dstPath;
          const cached = this.fileCache[src];
          if (cached !== undefined) {
            delete this.fileCache[src];
            this.fileCache[dstPath] = cached;
          }
          const savedBase = this.savedBaseByPath[src];
          if (savedBase !== undefined) {
            delete this.savedBaseByPath[src];
            this.savedBaseByPath[dstPath] = savedBase;
          }
          const snap = this.openSnapshotByPath[src];
          if (snap !== undefined) {
            delete this.openSnapshotByPath[src];
            this.openSnapshotByPath[dstPath] = snap;
          }
        }
        this.tabs = updatedTabs;
        if (activeChanged) {
          this.status = "File spostato: riaperto dal nuovo percorso";
        }
      } else if (this.activePath === src) {
        this.showToast(t("toast.move.file_reopen_needed"), "error");
      }

      await this.notifyFsChanged();
    } catch (e) {
      this.showToast(t("toast.move.error"), "error");
    } finally {
      this.pendingMove = null;
      this.moveConfirmOpen = false;
    }
  }

  private openFile(path: string) {
    this.setActiveSelection(path, false);
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
    this.scheduleSaveSession();
  }

  private async confirmUnsavedSave() {
    const action = this.pendingUnsavedAction;
    await this.save();
    if (this.isActiveDirty()) {
      this.showToast(t("toast.file.save_error"), "error");
      return;
    }
    this.showUnsavedModal = false;
    this.pendingUnsavedAction = null;
    if (action) {
      if (action.type === "open") {
        this.openFile(action.path);
      } else if (action.type === "close") {
        this.closeTab(action.path, true);
      }
    }
  }

  private confirmUnsavedDiscard() {
    const action = this.pendingUnsavedAction;
    this.showUnsavedModal = false;
    this.pendingUnsavedAction = null;
    if (action) {
      if (action.type === "open") {
        this.openFile(action.path);
      } else if (action.type === "close") {
        this.closeTab(action.path, true);
      }
    }
  }

  private cancelUnsavedModal() {
    this.showUnsavedModal = false;
    this.pendingUnsavedAction = null;
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

  private closeTab(path: string, skipPrompt = false) {
    if (!skipPrompt && path === this.activePath && this.isActiveDirty()) {
      this.pendingUnsavedAction = { type: "close", path };
      this.showUnsavedModal = true;
      return;
    }
    if (path === this.activePath) {
      this.captureActiveView();
    }
    this.clearBufferTimer(path);
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
    this.scheduleSaveSession();
  }

  private markDirty(val: string) {
    this.content = val;
    this.lineCount = Math.max(1, this.content.split("\n").length);
    if (!this.activePath) return;
    const prevTab = this.tabs.find((t) => t.path === this.activePath);
    const wasDirty = !!prevTab?.dirty;
    if (this.editorRef) {
      const scrollTop = this.editorRef.scrollTop;
      const selStart = this.editorRef.selectionStart ?? 0;
      const selEnd = this.editorRef.selectionEnd ?? selStart;
      this.tabs = this.tabs.map((t) =>
        t.path === this.activePath ? { ...t, view: { scrollTop, selStart, selEnd } } : t
      );
    }
    this.fileCache[this.activePath] = val;
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath ? { ...t, dirty: true } : t
    );
    this.scheduleDiff();
    if (!wasDirty) {
      this.scheduleSaveSession();
    }
    this.scheduleBufferSave(this.activePath, val);
  }

  private isActiveDirty() {
    if (!this.activePath) return false;
    const tab = this.tabs.find((t) => t.path === this.activePath);
    return Boolean(tab?.dirty);
  }

  private clearBufferTimer(path: string) {
    const existing = this.bufferSaveTimers.get(path);
    if (existing !== undefined) {
      clearTimeout(existing);
      this.bufferSaveTimers.delete(path);
    }
  }

  private async persistBuffer(path: string, content: string) {
    const dirtyTabs = this.tabs.filter((t) => t.dirty);
    if (dirtyTabs.length > this.maxBufferFiles) {
      console.warn("buffer save skipped: too many dirty tabs", dirtyTabs.length);
      return;
    }
    const size = new TextEncoder().encode(content).length;
    if (size > this.maxBufferBytes) {
      console.warn("buffer save skipped: too large", { path, size });
      return;
    }
    try {
      const res = await apiPutSessionBuffer(this.apiBase, { path, content });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        console.warn("buffer save failed", res.status, data);
        return;
      }
      const bufferId = data?.buffer_id || data?.bufferId;
      const bufferSize = data?.size ?? size;
      const lastEditAt = Date.now();
      this.tabs = this.tabs.map((t) =>
        t.path === path ? { ...t, bufferId, bufferSize, lastEditAt } : t
      );
      this.scheduleSaveSession();
    } catch (err) {
      console.warn("persistBuffer error", err);
    }
  }

  private scheduleBufferSave(path: string, content: string) {
    if (!path) return;
    this.clearBufferTimer(path);
    const timer = window.setTimeout(() => {
      this.bufferSaveTimers.delete(path);
      void this.persistBuffer(path, content);
    }, 1000);
    this.bufferSaveTimers.set(path, timer);
  }

  private captureActiveView() {
    if (!this.activePath || !this.editorRef) return;
    const scrollTop = this.editorRef.scrollTop;
    const selStart = this.editorRef.selectionStart ?? 0;
    const selEnd = this.editorRef.selectionEnd ?? selStart;
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath ? { ...t, view: { scrollTop, selStart, selEnd } } : t
    );
  }

  private applyViewForPath(path: string) {
    const tab = this.tabs.find((t) => t.path === path);
    const view = tab?.view ?? this.pendingViewApply[path];
    if (!view || !this.editorRef) return;
    const len = this.content.length;
    const selStart = Math.max(0, Math.min(view.selStart ?? 0, len));
    const selEnd = Math.max(0, Math.min(view.selEnd ?? selStart, len));
    requestAnimationFrame(() => {
      if (!this.editorRef) return;
      if (typeof view.scrollTop === "number") {
        this.editorRef.scrollTop = Math.max(0, view.scrollTop);
      }
      try {
        this.editorRef.setSelectionRange(selStart, selEnd);
      } catch {
        // ignore invalid selection
      }
      this.updateCursorFromTextarea();
    });
    delete this.pendingViewApply[path];
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
      this.showToast(t("toast.diff.error"), "error");
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
    this.updateActiveIndentSegment(pos, source);
  }

  private updateCursorFromTextarea() {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const pos = ta.selectionStart ?? 0;
    this.updateCursorFromPos(pos, ta.value);
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

  private applyTextEditWithUndo(
    ta: HTMLTextAreaElement,
    start: number,
    end: number,
    replacement: string,
    selStart: number,
    selEnd: number,
    nextValue: string
  ) {
    try {
      ta.focus();
      let applied = false;
      try {
        ta.setSelectionRange(start, end);
        if (typeof document !== "undefined" && typeof (document as any).execCommand === "function") {
          applied = (document as any).execCommand("insertText", false, replacement);
        }
      } catch {
        applied = false;
      }
      if (!applied && typeof ta.setRangeText === "function") {
        ta.setSelectionRange(start, end);
        ta.setRangeText(replacement, start, end, "preserve");
      } else {
        ta.value = nextValue;
      }
      ta.setSelectionRange(selStart, selEnd);
      try {
        const evt = new InputEvent("input", { bubbles: true, cancelable: false, inputType: "insertText", data: replacement });
        ta.dispatchEvent(evt);
      } catch {
        // ignore if InputEvent unsupported
      }
    } catch (err) {
      console.warn("applyTextEditWithUndo failed, fallback", err);
      ta.value = nextValue;
      ta.setSelectionRange(selStart, selEnd);
    }
    this.markDirty(nextValue);
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
    if (e.key === "Tab") {
      const handled = this.insertTabSpaces(e);
      if (handled) return;
    }
    if (!this.autoIndentEnabled) {
      this.handleCursorMove(e);
      return;
    }
    if (e.key === "Enter") {
      const handled = this.applyAutoIndent(e);
      if (handled) return;
    }
    this.handleCursorMove(e);
  }

  private insertTabSpaces(e: KeyboardEvent) {
    if (!this.editorRef) return false;
    e.preventDefault();
    const ta = this.editorRef;
    const value = this.content;
    const indent = this.indentUnit;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const newlineMatch = value.match(/\r\n/);
    const newline = newlineMatch ? "\r\n" : "\n";
    const blockStart = (() => {
      const nl = value.lastIndexOf("\n", start - 1);
      return nl === -1 ? 0 : nl + 1;
    })();
    const endLineBreak = (() => {
      const nl = value.indexOf("\n", end);
      return nl === -1 ? value.length : nl;
    })();
    const block = value.slice(blockStart, endLineBreak);
    const lines = block.split(/\r?\n/);

    if (!e.shiftKey) {
      const indented = lines.map((line) => `${indent}${line}`);
      const newBlock = indented.join(newline);
      const newValue = `${value.slice(0, blockStart)}${newBlock}${value.slice(endLineBreak)}`;
      const newStart = start + indent.length;
      const newEnd = end + indent.length * lines.length;
      this.applyTextEditWithUndo(ta, blockStart, endLineBreak, newBlock, newStart, newEnd, newValue);
      return true;
    }

    let removedFirst = 0;
    let totalRemoved = 0;
    const outdented = lines.map((line, idx) => {
      let removed = 0;
      if (line.startsWith(indent)) {
        line = line.slice(indent.length);
        removed = indent.length;
      } else if (line.startsWith("\t")) {
        line = line.slice(1);
        removed = 1;
      } else if (line.startsWith(" ")) {
        const match = line.match(/^ +/);
        const count = Math.min(indent.length, match ? match[0].length : 0);
        line = line.slice(count);
        removed = count;
      }
      if (idx === 0) removedFirst = removed;
      totalRemoved += removed;
      return line;
    });
    const newBlock = outdented.join(newline);
    const newValue = `${value.slice(0, blockStart)}${newBlock}${value.slice(endLineBreak)}`;
    const newStart = Math.max(blockStart, start - removedFirst);
    const newEnd = Math.max(newStart, end - totalRemoved);
    this.applyTextEditWithUndo(ta, blockStart, endLineBreak, newBlock, newStart, newEnd, newValue);
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
      this.contextMenuX = 0;
      this.contextMenuY = 0;
    }
    if (this.treeMenuOpen) {
      this.treeMenuOpen = false;
      this.treeMenuX = 0;
      this.treeMenuY = 0;
      this.treeMenuPath = null;
      this.treeMenuType = null;
      this.treeMenuFromBlank = false;
    }
  }

  private createFromContext(kind: "file" | "folder") {
    if (!this.treeMenuPath || this.treeMenuType !== "dir") return;
    this.setActiveSelection(this.treeMenuPath, true);
    this.newItemKind = kind;
    this.newItemName = "";
    this.newItemExt = "";
    this.closeContextMenu();
  }

  private handleTreeBlankContextMenu(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    const insideItem = target?.closest?.(".treeRow");
    if (insideItem) return;
    e.preventDefault();
    const path = this.normalizeDir(this.activeDir || "/");
    this.treeMenuOpen = true;
    this.treeMenuX = e.clientX;
    this.treeMenuY = e.clientY;
    this.treeMenuPath = path;
    this.treeMenuType = "dir";
    this.treeMenuFromBlank = true;
    this.contextMenuOpen = false;
    this.openMenu = null;
    this.closeSuggestions();
  }

  private isImagePath(path: string | null): boolean {
    if (!path) return false;
    const lower = path.toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"].some((ext) => lower.endsWith(ext));
  }

  private async handleCopyCut(action: "copy" | "cut") {
    if (!this.editorRef) return;
    const ta = this.editorRef;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const selection = this.content.slice(start, end);
    if (selection.length === 0 && action === "copy") {
      this.showToast(t("toast.clipboard.nothing_to_copy"), "error");
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
      this.showToast(action === "copy" ? t("toast.clipboard.copied") : t("toast.clipboard.cut"));
    } catch (err) {
      this.showToast(t("toast.clipboard.unavailable"), "error");
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
        this.showToast(t("toast.clipboard.nothing_to_paste"), "error");
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
      this.showToast(t("toast.clipboard.pasted"));
    } catch (err) {
      this.showToast(t("toast.clipboard.unavailable"), "error");
    } finally {
      this.closeContextMenu();
    }
  }

  private handleUndoRedo(action: "undo" | "redo") {
    if (!this.editorRef || !this.activePath) {
      this.showToast(t("toast.editor.open_file_first"), "error");
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
      this.showToast(action === "undo" ? t("toast.editor.undo_unavailable") : t("toast.editor.redo_unavailable"), "error");
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
    this.showToast(t("toast.editor.auto_indent_completed"));
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
    this.status = t("status.yaml_formatting");
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
        let msg = t("toast.yaml.invalid");
        if (line != null && col != null) msg += ` (riga ${line}, colonna ${col})`;
        else if (line != null) msg += ` (riga ${line})`;
        if (short) msg += `: ${short}`;
        else msg += ".";
        const hint1 = raw.includes("expected <block end>, but found '?'");
        const hint2 = raw.includes("expected ',' or '}', but got '{'");
        if (hint1) msg += " (controlla che dopo '-' ci sia uno spazio: '- key: value')";
        if (hint2) msg += " (in una mappa {...} manca una virgola o una '}')";
        if (!err) {
          msg = t("toast.yaml.format_http_error", { status: res.status });
        }
        this.showToast(msg, "error");
        this.status = t("status.format_error");
        return;
      }
      const formatted = payload.formatted ?? "";
      this.markDirty(formatted);
      this.status = t("status.formatted_unsaved");
      this.showToast(t("toast.yaml.formatted"));
    } catch (e) {
      this.showToast(t("toast.yaml.format_error"), "error");
      this.status = t("status.format_error");
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

  private openSearchTab(focus: "search" | "replace" = "search") {
    this.setActivity("search");
    requestAnimationFrame(() => {
      if (!this.shadowRoot) return;
      const selector = focus === "search" ? 'input.searchInput[data-search-field="search"]' : 'input.searchInput[data-search-field="replace"]';
      const el = this.shadowRoot.querySelector(selector) as HTMLInputElement | null;
      el?.focus();
    });
  }

  private updateActiveIndentSegment(pos: number, value?: string) {
    const source = value ?? this.content;
    const lines = source.split("\n");
    const lineIdx = Math.min(Math.max(this.cursorLine - 1, 0), lines.length - 1);
    const line = lines[lineIdx] ?? "";
    const indentMatch = line.match(/^[\t ]+/);
    const indentRaw = indentMatch ? indentMatch[0] : "";
    const indentSize = 2;
    const indentSpaces = indentRaw
      ? indentRaw.split("").reduce((acc, ch) => acc + (ch === "\t" ? indentSize : 1), 0)
      : 0;
    const level = Math.max(0, Math.floor(indentSpaces / indentSize));
    if (level === 0) {
      this.activeIndentSegmentId = null;
      return;
    }
    const segments = computeIndentSegments(source, indentSize, true);
    const seg = segments.find((s) => s.level === level && s.start <= this.cursorLine && s.end >= this.cursorLine);
    this.activeIndentSegmentId = seg ? seg.id : null;
  }

  private async notifyFsChanged() {
    this.treeDirty = true;
    if (this.activeActivity !== "explorer") return;
    try {
      await this.reloadTree(true);
      this.treeDirty = false;
    } catch (err) {
      console.warn("notifyFsChanged reload failed", err);
    }
  }

  private async ensureTreeFresh() {
    if (!this.treeDirty) return;
    try {
      await this.reloadTree(true);
      this.treeDirty = false;
    } catch (err) {
      console.warn("ensureTreeFresh reload failed", err);
    }
  }

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

  private openDocumentation() {
    const supported = new Set(SUPPORTED_LOCALES.map((item) => item.code));
    const stored = getPersistedLocale();
    const navLang = (navigator.language || "en").slice(0, 2).toLowerCase() as SupportedLocaleCode;
    const lang = supported.has(stored) ? stored : supported.has(navLang) ? navLang : "en";
    const docsUrl = new URL("./docs/", window.location.href);
    docsUrl.searchParams.set("page", "index");
    docsUrl.searchParams.set("lang", lang);
    window.open(docsUrl.toString(), "_blank", "noopener,noreferrer");
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
        this.openSaveAsModal();
      } else if (action === "Settings") {
        this.openSettingsModal();
      } else if (action === "Import…") {
        this.openUploadModal();
      } else if (action === "Export…") {
        if (!this.activePath) {
          this.showToast(t("toast.editor.open_file_first"), "info");
          return;
        }
        this.triggerPathDownload(this.activePath);
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
        this.scheduleSaveSession();
        if (!next) {
          this.compareEnabled = false;
          this.diffHunks = [];
          this.diffSummary = null;
        } else {
          requestAnimationFrame(() => this.syncBaseOverlay());
        }
      } else if (action === "Compare…") {
        if (!this.splitViewEnabled) {
          this.showToast(t("toast.view.enable_split_first"), "info");
          return;
        }
        if (!this.activePath) {
          this.showToast(t("toast.view.open_file_to_compare"), "info");
          return;
        }
        this.compareEnabled = !this.compareEnabled;
        if (!this.compareEnabled) {
          this.diffHunks = [];
          this.diffSummary = null;
        } else {
          this.scheduleDiff();
        }
      } else if (action === "Menù strumenti") {
        const next = !this.toolbarVisible;
        this.toolbarVisible = next;
        void this.persistUserConfig({ toolbar_visible: next });
      } else if (action === "Indent guides") {
        const next = !this.showIndentGuides;
        this.showIndentGuides = next;
        void this.persistUserConfig({ show_indent_guides: next });
      }
    } else if (menu === "help") {
      if (action === "About") {
        this.openAboutModal();
      } else if (action === "Docs") {
        this.openDocumentation();
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
    if (path !== this.activePath) {
      this.captureActiveView();
    }
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
        this.applyViewForPath(path);
      });
      this.scheduleDiff();
    } else {
      this.content = "";
      this.lineCount = 1;
      this.cursorLine = 1;
      this.cursorCol = 1;
      this.loadFile(path);
      this.pendingViewApply[path] = this.tabs.find((t) => t.path === path)?.view || {};
      requestAnimationFrame(() => this.applyViewForPath(path));
    }
    this.scheduleSaveSession();
  }

  private renderMenu(labelKey: string, name: string, items: { icon: string; action: string; labelKey: string }[]) {
    const open = this.openMenu === name;
    return html`
      <div class="menuItem menu-item ${open ? "open" : ""}" @click=${(e: Event) => this.toggleMenu(e, name)}>
        <span>${t(labelKey)}</span>
          <div class="menuPopup" ?hidden=${!open} @click=${(e: Event) => e.stopPropagation()}>
            ${items.map(
              (it) => html`<div class="menuItemRow" @click=${() => this.handleMenuAction(name, it.action)}>
              <span class="menuIcon"><app-icon name=${it.icon} size="14" aria-hidden="true"></app-icon></span>
              <span>${t(it.labelKey)}</span>
            </div>`
            )}
          </div>
      </div>
    `;
  }

  private syncScroll(e: Event) {
    const source = e.target as HTMLElement;
    const top = source.scrollTop;
    const left = source.scrollLeft;
    this.syncEditorOverlay(top, left);
  }

  private syncBaseScroll(e: Event) {
    const top = (e.target as HTMLElement).scrollTop;
    const left = (e.target as HTMLElement).scrollLeft;
    if (this.baseCodeRef) {
      this.baseCodeRef.scrollTop = top;
      this.baseCodeRef.scrollLeft = left;
    }
    if (this.baseGutterRef) this.baseGutterRef.style.transform = `translateY(-${top}px)`;
  }

  // Keep overlay + gutter aligned with the transparent textarea scroll position.
  private syncEditorOverlay(top?: number, left?: number) {
    const sourceTop = top ?? this.editorRef?.scrollTop ?? 0;
    const sourceLeft = left ?? this.editorRef?.scrollLeft ?? 0;
    if (this.codeRef) {
      this.codeRef.scrollTop = sourceTop;
      this.codeRef.scrollLeft = sourceLeft;
    }
    if (this.gutterRef) this.gutterRef.style.transform = `translateY(-${sourceTop}px)`;
  }

  private isNarrowLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  private resetSessionStateInMemory() {
    this.tabs = [];
    this.activePath = null;
    this.content = "";
    this.fileCache = {};
    this.savedBaseByPath = {};
    this.openSnapshotByPath = {};
    this.savedBaseText = "";
    this.openSnapshotText = "";
    this.restoredBufferCount = 0;
    this.clearBufferTimer("");
    this.bufferSaveTimers.clear();
    this.dirtySessionToastShown = false;
    this.lastSessionSnapshot = null;
    this.showUploadModal = false;
    this.uploadFile = null;
  }

  private normalizeDir(path: string | null | undefined): string {
    if (!path || path === "/") return "/";
    const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
    return trimmed || "/";
  }

  private getDirectoryOptions(): { path: string; writable: boolean }[] {
    const dirs = new Map<string, boolean>();
    dirs.set("/", true);
    const addDir = (path: string, writable: boolean | undefined | null) => {
      const norm = this.normalizeDir(path);
      dirs.set(norm, writable !== false);
    };
    const scan = (p: string) => {
      const items = this.treeData[p] || [];
      items.forEach((item: TreeItem) => {
        if (item.type === "dir") {
          addDir(item.path, item.writable);
          if (this.treeData[item.path]) {
            scan(item.path);
          }
        }
      });
    };
    scan("");
    return Array.from(dirs.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([path, writable]) => ({ path, writable }));
  }

  private isDirWritable(path: string): boolean {
    const norm = this.normalizeDir(path);
    if (norm === "/" || norm === "") return true;
    const allDirs = this.getDirectoryOptions();
    const entry = allDirs.find((d) => this.normalizeDir(d.path) === norm);
    return entry ? entry.writable : true;
  }

  private setActiveSelection(path: string | null, isDir: boolean) {
    this.activePath = path;
    this.activeIsDir = isDir;
    const dir = isDir
      ? this.normalizeDir(path)
      : this.normalizeDir(path && path.includes("/") ? path.split("/").slice(0, -1).join("/") : "/");
    this.activeDir = dir;
    // Debug: track active directory selection
    console.debug("[tree] active selection", { path, isDir, activeDir: dir });
  }

  private scheduleSaveSession() {
    if (this.restoringSession) return;
    if (this.sessionSaveTimer !== null) {
      clearTimeout(this.sessionSaveTimer);
    }
    this.sessionSaveTimer = window.setTimeout(() => {
      this.sessionSaveTimer = null;
      void this.saveSession();
    }, 450);
  }

  private buildSessionSnapshot(): string {
    const minimal = {
      tabs: this.tabs.map((t) => ({ path: t.path, dirty: !!t.dirty })),
      active: this.activePath ?? null,
      split: !!this.splitViewEnabled,
    };
    return JSON.stringify(minimal);
  }

  private async saveSession() {
    const payload = {
      tabs: this.tabs.map((t) => ({
        path: t.path,
        dirty: !!t.dirty,
        buffer_id: t.bufferId || null,
        buffer_size: t.bufferSize ?? null,
        lastEditAt: t.lastEditAt ?? null,
        view: this.safeView(t.view),
      })),
      active: this.activePath ?? null,
      split: !!this.splitViewEnabled,
    };
    const snapshot = this.buildSessionSnapshot();
    if (snapshot === this.lastSessionSnapshot) return;
    try {
      const res = await apiPutSession(this.apiBase, payload);
      if (!res.ok) {
        throw new Error(`session save ${res.status}`);
      }
      this.lastSessionSnapshot = snapshot;
    } catch (err) {
      console.warn("saveSession failed", err);
    }
  }

  private addRestoredTab(
    path: string,
    content: string,
    dirty = false,
    savedBase?: string,
    bufferId?: string,
    bufferSize?: number,
    lastEditAt?: number,
    view?: { scrollTop?: number; selStart?: number; selEnd?: number }
  ) {
    const name = path.split("/").pop() || path;
    const existing = this.tabs.find((t) => t.path === path);
    const nextTab = existing
      ? { ...existing, dirty, bufferId, bufferSize, lastEditAt, view }
      : { path, name, dirty, bufferId, bufferSize, lastEditAt, view };
    this.tabs = existing
      ? this.tabs.map((t) => (t.path === path ? nextTab : t))
      : [...this.tabs, nextTab];
    this.fileCache[path] = content;
    this.savedBaseByPath[path] = savedBase !== undefined ? savedBase : content;
    this.openSnapshotByPath[path] = savedBase !== undefined ? savedBase : content;
  }

  private activateRestoredTab(path: string) {
    const cached = this.fileCache[path] ?? "";
    this.setActiveSelection(path, false);
    this.activePath = path;
    this.content = cached;
    this.lineCount = Math.max(1, cached.split("\n").length);
    this.cursorLine = 1;
    this.cursorCol = 1;
    this.openSnapshotText = cached;
    this.savedBaseText = cached;
    this.diffHunks = [];
    this.diffSummary = null;
    requestAnimationFrame(() => {
      this.syncEditorOverlay();
      this.syncBaseOverlay();
    });
    this.scheduleDiff();
  }

  private async restoreSession() {
    if (this.restoringSession) return;
    this.restoringSession = true;
    let restoreSucceeded = false;
    try {
      const res = await apiGetSession(this.apiBase);
      if (!res.ok) {
        throw new Error(`session load ${res.status}`);
      }
      const data = await res.json();
      const hasContent =
        (Array.isArray(data?.tabs) && data.tabs.length > 0) ||
        (typeof data?.active === "string" && data.active.length > 0) ||
        typeof data?.split === "boolean";
      type StoredTabEntry = {
        path: string;
        dirty: boolean;
        buffer_id?: string;
        bufferId?: string;
        buffer_size?: number;
        bufferSize?: number;
        lastEditAt?: number;
        last_edit_at?: number | string;
      };
      const rawTabs = Array.isArray(data?.tabs) ? data.tabs : [];
      const tabs = rawTabs
        .map((t: any) => {
          if (typeof t === "string") return { path: t, dirty: false };
          if (t && typeof t.path === "string") return { path: t.path, dirty: !!t.dirty };
          return null;
        })
        .filter((t: any) => t !== null) as StoredTabEntry[];
      const active = typeof data?.active === "string" ? data.active : null;
      const split = typeof data?.split === "boolean" ? data.split : false;
      const restored: string[] = [];
      let hadDirty = false;
      this.restoredBufferCount = 0;
      for (const entry of tabs) {
        const path = entry.path;
        const wasDirty = !!entry.dirty;
        const bufferId = typeof (entry as any).buffer_id === "string" ? (entry as any).buffer_id : (entry as any).bufferId;
        const bufferSize = typeof (entry as any).buffer_size === "number" ? (entry as any).buffer_size : (entry as any).bufferSize;
        try {
          const fileRes = await apiGetFile(this.apiBase, path);
          if (!fileRes.ok) {
            console.warn("restoreSession: file not found, skip", path, fileRes.status);
            continue;
          }
          const payload = await fileRes.json();
          const diskContent = typeof payload?.content === "string" ? payload.content : "";
          let effectiveContent = diskContent;
          let usedBufferId: string | undefined;
          let usedBufferSize: number | undefined = bufferSize;
          if (wasDirty && bufferId) {
            try {
              const bufRes = await apiGetSessionBuffer(this.apiBase, bufferId);
              if (bufRes.ok) {
                const bufPayload = await bufRes.json();
                const bufContent = typeof bufPayload?.content === "string" ? bufPayload.content : "";
                effectiveContent = bufContent;
                usedBufferId = bufferId;
                usedBufferSize = new TextEncoder().encode(bufContent).length;
                this.restoredBufferCount += 1;
              } else {
                console.warn("restoreSession: buffer not found for", path, bufferId, bufRes.status);
              }
            } catch (bufErr) {
              console.warn("restoreSession: errore buffer", path, bufErr);
            }
          }
          const restoredLastEdit =
            typeof entry.lastEditAt === "number"
              ? entry.lastEditAt
              : entry.last_edit_at
                ? Number(entry.last_edit_at)
                : undefined;
          this.addRestoredTab(path, effectiveContent, wasDirty, diskContent, usedBufferId, usedBufferSize, restoredLastEdit);
          restored.push(path);
          if (wasDirty) hadDirty = true;
        } catch (err) {
          console.warn("restoreSession: errore su file", path, err);
        }
      }
      restoreSucceeded = hasContent;
      if (split) {
        this.splitViewEnabled = true;
      }
      const targetActive = restored.find((p) => p === active) ?? restored[0] ?? null;
      if (targetActive) {
        this.activateRestoredTab(targetActive);
      }
      if (data?.corrupted) {
        this.showToast(t("toast.session.restored_defaults_corrupted"), "error");
      }
      if (hadDirty && !this.dirtySessionToastShown) {
        this.showToast(t("toast.session.unsaved_reopened_from_disk"));
        this.dirtySessionToastShown = true;
      }
      if (this.restoredBufferCount > 0) {
        this.showToast(t("toast.session.restored_unsaved_files", { count: this.restoredBufferCount }));
      }
    } catch (err) {
      console.warn("restoreSession failed", err);
      this.showToast(t("toast.session.restored_defaults_error"), "error");
    } finally {
      this.restoringSession = false;
      if (restoreSucceeded) {
        this.scheduleSaveSession();
      }
    }
  }

  private setActivity(name: "explorer" | "search" | "entity" | "snippet" | "system" | "backup" | "utility") {
    this.activeActivity = name;
    if (name === "explorer") {
      void this.ensureTreeFresh();
    }
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

  private async resetSession() {
    if (this.utilityGenerating) return;
    this.showResetSessionModal = false;
    try {
      const res = await apiResetSession(this.apiBase);
      if (!res.ok) {
        throw new Error(`reset ${res.status}`);
      }
      this.resetSessionStateInMemory();
      this.status = t("status.session_reset");
      this.showToast(t("toast.session.reset_done"));
      await this.notifyFsChanged();
      this.reloadTree(true);
    } catch (err) {
      this.showToast(t("toast.session.reset_error"), "error");
    }
  }

  private renderSidebarContent() {
    if (this.activeActivity === "explorer") {
      return html`<div class="tree">
        <div class="treeHeader file-explorer-header">
          <div class="explorer-actions">
            <button
              class="explorer-btn new-file-btn"
              type="button"
              title=${t("explorer.action.new_file")}
              aria-label=${t("explorer.action.new_file")}
              @click=${() => (this.newItemKind = "file")}
            >
              <app-icon name="file-plus" size="14"></app-icon>
            </button>
            <button
              class="explorer-btn new-folder-btn"
              type="button"
              title=${t("explorer.action.new_folder")}
              aria-label=${t("explorer.action.new_folder")}
              @click=${() => (this.newItemKind = "folder")}
            >
              <app-icon name="folder-plus" size="14"></app-icon>
            </button>
            <button
              class="explorer-btn upload-btn-header"
              type="button"
              title=${t("explorer.action.upload")}
              aria-label=${t("explorer.action.upload")}
              @click=${() => this.openUploadModal()}
            >
              <app-icon name="upload" size="14"></app-icon>
            </button>
          </div>
        </div>
        <div
          class="treeScrollable"
          @contextmenu=${(e: Event) => this.handleTreeBlankContextMenu(e as MouseEvent)}
          @dragover=${(e: DragEvent) => this.handleTreeRootDragOver(e)}
          @drop=${(e: DragEvent) => this.handleTreeRootDrop(e)}
          @dragleave=${() => {
            if (this.dropTargetPath === "/") this.dropTargetPath = null;
          }}
        >
          ${this.renderTree("")}
        </div>
      </div>`;
    }
    if (this.activeActivity === "search") {
      const summary = this.searchSummary;
      return html`<div class="sidebarContent searchPane">
        <div class="searchRow">
          <input
            type="text"
            class="searchInput"
            data-search-field="search"
            placeholder=${t("actions.search")}
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
            data-search-field="replace"
            placeholder=${t("actions.replace")}
            .value=${this.searchReplace}
            @input=${(e: Event) => (this.searchReplace = (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="searchControls">
          <label style="display:flex; align-items:center; gap:6px; font-size:var(--font-size-sm);">
            <input type="checkbox" .checked=${this.searchCaseSensitive} @change=${(e: Event) => (this.searchCaseSensitive = (e.target as HTMLInputElement).checked)} />
            ${t("search.labels.case_sensitive")}
          </label>
          <div style="flex:1;"></div>
          <button class="btn" ?disabled=${this.searchLoading} @click=${() => this.performSearch()}>${this.searchLoading ? t("search.status.searching") : t("search.action.find")}</button>
          <button class="btn primary" ?disabled=${this.searchLoading || this.searchResults.length === 0} @click=${() => this.replaceAll()}>
            ${this.searchLoading ? t("search.action.working") : t("search.action.replace_all")}
          </button>
        </div>
        ${summary
          ? html`<div class="searchSummary">
              ${t("search.summary.hits_in_files", {
                hits: summary.matches_total ?? 0,
                files_with_matches: summary.files_with_matches ?? 0,
                files_scanned: summary.files_scanned ?? 0,
              })}${this.searchTruncated ? ` ${t("search.summary.truncated_suffix")}` : ""}
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
              <app-icon name="save" size="16" aria-hidden="true"></app-icon>
              <span>${downloading ? t("backup.local_loading") : t("backup.local")}</span>
            </div>
            <div class="systemCardDesc">${t("backup.local_desc")}</div>
          </button>
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.backupLoading}
            @click=${() => this.runBackup("saveas")}
          >
            <div class="systemCardTitle">
              <app-icon name="folder-open" size="16" aria-hidden="true"></app-icon>
              <span>${saving ? t("backup.network_loading") : t("backup.network")}</span>
            </div>
            <div class="systemCardDesc">${t("backup.network_desc")}</div>
          </button>
          <button class="systemCard" type="button" ?disabled=${this.backupLoading} @click=${() => this.openGdriveModal()}>
            <div class="systemCardTitle">
              <app-icon name="cloud" size="16" aria-hidden="true"></app-icon>
              <span>${t("backup.cloud")}</span>
            </div>
            <div class="systemCardDesc">${t("backup.cloud_coming_soon_desc")}</div>
          </button>
        </div>
      </div>`;
    }
    if (this.activeActivity === "snippet") {
      const term = this.snippetSearchText.toLowerCase();
      const field = this.snippetSearchField;
      const normalized = this.snippets.map((s) => ({
        ...s,
        name: String(s?.name ?? ""),
        description: String(s?.description ?? ""),
        content: String(s?.content ?? ""),
      }));
      const filtered = normalized.filter((s) => {
        const hay = field === "description" ? s.description : s.name;
        return hay.toLowerCase().includes(term);
      });
      return html`<div class="sidebarContent" style="display:grid; gap:8px;">
        <button class="btn primary" style="justify-self:flex-start; padding:6px 10px;" @click=${() => this.openSnippetModal()}>
          ${t("snippets.action.add")}
        </button>
        <div style="display:flex; gap:8px; align-items:center;">
          <input
            type="text"
            placeholder=${t("snippets.search.placeholder")}
            .value=${this.snippetSearchText}
            @input=${(e: Event) => (this.snippetSearchText = (e.target as HTMLInputElement).value)}
            style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--border-color); background: var(--input-bg); color: var(--text-color);"
          />
          <select
            .value=${this.snippetSearchField}
            @change=${(e: Event) => (this.snippetSearchField = (e.target as HTMLSelectElement).value as "title" | "description")}
            style="padding:8px; border-radius:8px; border:1px solid var(--border-color); background: var(--input-bg); color: var(--text-color);"
          >
            <option value="title">${t("snippets.field.title")}</option>
            <option value="description">${t("snippets.field.description")}</option>
          </select>
        </div>
        <div class="snippetGrid">
          ${filtered.map(
            (s) => html`<div class="snippetCard">
              <div class="snippetHeader">
                <div class="snippetTitle">${s.name}</div>
                <div class="snippetActions">
                  <button class="statusToggle" title=${t("snippets.action.modify")} style="padding:2px 6px; border-color:var(--border-color);" @click=${(e: Event) => { e.stopPropagation(); this.openSnippetModal(s); }}>
                    <app-icon name="edit" size="14" aria-hidden="true"></app-icon>
                  </button>
                  <button class="statusToggle" title=${t("btn.cancel")} style="padding:2px 6px; border-color:var(--border-color);" @click=${(e: Event) => { e.stopPropagation(); this.deleteSnippet(s); }}>
                    <app-icon name="x" size="20" aria-hidden="true"></app-icon>
                  </button>
                  <button class="statusToggle" title=${t("entities.action.insert")} style="padding:2px 6px; border-color:var(--border-color);" @click=${(e: Event) => { e.stopPropagation(); this.insertSnippet(s); }}>
                    <app-icon name="plus" size="14" aria-hidden="true"></app-icon>
                  </button>
                </div>
              </div>
              <div class="snippetDesc">${s.description.slice(0, 200)}</div>
            </div>`
          )}
        </div>
      </div>`;
    }
    if (this.activeActivity === "utility") {
      return html`<div class="sidebarContent systemPane">
        <div class="systemGrid">
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.utilityGenerating}
            @click=${() => this.generateDebugLog()}
          >
            <div class="systemCardTitle">
              <app-icon name="wrench" size="16" aria-hidden="true"></app-icon>
              <span>${this.utilityGenerating ? t("utility.generating") : t("utility.generate_debug_log")}</span>
            </div>
            <div class="systemCardDesc">${t("utility.generate_debug_log_desc")}</div>
          </button>
          <button
            class="systemCard"
            type="button"
            @click=${() => (this.showResetSessionModal = true)}
          >
            <div class="systemCardTitle">
              <app-icon name="refresh" size="16" aria-hidden="true"></app-icon>
              <span>${t("session.reset.title")}</span>
            </div>
            <div class="systemCardDesc">${t("session.reset.desc")}</div>
          </button>
        </div>
      </div>`;
    }
    if (this.activeActivity === "system") {
      const actions = [
        {
          id: "reload_yaml",
          label: t("system.actions.reload_yaml.label"),
          desc: t("system.actions.reload_yaml.desc"),
          icon: "file",
          confirm: false,
        },
        {
          id: "restart_core",
          label: t("system.actions.restart_core.label"),
          desc: t("system.actions.restart_core.desc"),
          icon: "refresh",
          confirm: true,
        },
        {
          id: "restart_supervisor",
          label: t("system.actions.restart_supervisor.label"),
          desc: t("system.actions.restart_supervisor.desc"),
          icon: "puzzle",
          confirm: true,
        },
        {
          id: "reboot_host",
          label: t("system.actions.reboot_host.label"),
          desc: t("system.actions.reboot_host.desc"),
          icon: "monitor",
          confirm: true,
        },
        {
          id: "shutdown_host",
          label: t("system.actions.shutdown_host.label"),
          desc: t("system.actions.shutdown_host.desc"),
          icon: "power",
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
                <app-icon name=${action.icon} size="16" aria-hidden="true"></app-icon>
                <span>${pending ? t("status.in_progress") : action.label}</span>
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
    this.status = t("status.saving");
    try {
      const res = await apiSaveFile(this.apiBase, this.activePath, this.content);
      if (!res.ok) {
        throw new Error(`save ${res.status}`);
      }
      this.fileCache[this.activePath] = this.content;
      this.savedBaseByPath[this.activePath] = this.content;
      this.savedBaseText = this.content;
      this.clearBufferTimer(this.activePath);
    this.tabs = this.tabs.map((t) =>
      t.path === this.activePath
        ? { ...t, dirty: false, bufferId: undefined, bufferSize: undefined, lastEditAt: undefined }
        : t
    );
    this.captureActiveView();
    this.scheduleDiff();
    requestAnimationFrame(() => this.syncBaseOverlay());
    await this.notifyFsChanged();
    this.scheduleSaveSession();
      this.status = t("status.saved");
      setTimeout(() => (this.status = t("status.ready")), 800);
    } catch (e) {
      this.status = t("toast.file.save_error");
      this.showToast(this.status, "error");
      if (import.meta.env.DEV) console.warn("save failed", e);
      setTimeout(() => (this.status = t("status.ready")), 1200);
    }
  }

  render() {
    const activeTab = this.tabs.find((t) => t.path === this.activePath) ?? null;
    const diffMaps = this.getDiffMaps();

    return html`
      <div class="editor-app">
      <div class="shell">
          <div class="titlebar editor-header">
          <div class="menus editor-menu">
            ${this.renderMenu("menu.file", "file", [
              { icon: "file", action: "New file", labelKey: "actions.new_file" },
              { icon: "folder", action: "New folder", labelKey: "actions.new_folder" },
              { icon: "save", action: "Save", labelKey: "actions.save" },
              { icon: "save-all", action: "Save as…", labelKey: "actions.save_as" },
              { icon: "settings", action: "Settings", labelKey: "settings.title" },
              { icon: "upload", action: "Import…", labelKey: "actions.import" },
              { icon: "download", action: "Export…", labelKey: "actions.export" },
            ])}
            ${this.renderMenu("menu.edit", "edit", [
              { icon: "undo", action: "Undo", labelKey: "actions.undo" },
              { icon: "redo", action: "Redo", labelKey: "actions.redo" },
              { icon: "cut", action: "Cut", labelKey: "actions.cut" },
              { icon: "copy", action: "Copy", labelKey: "actions.copy" },
              { icon: "paste", action: "Paste", labelKey: "actions.paste" },
            ])}
            ${this.renderMenu("menu.view", "view", [
              { icon: this.toolbarVisible ? "check-square" : "square", action: "Menù strumenti", labelKey: "view.toolbar_toggle" },
              { icon: this.showIndentGuides ? "check-square" : "square", action: "Indent guides", labelKey: "view.indent_guides" },
              { icon: "refresh", action: "Reload tree", labelKey: "tree.action.reload" },
              { icon: "columns", action: "Split view", labelKey: "view.split" },
              { icon: "git-branch", action: "Compare…", labelKey: "view.compare" },
            ])}
            ${this.renderMenu("menu.help", "help", [
              { icon: "file", action: "Docs", labelKey: "help.docs" },
              { icon: "alert-circle", action: "About", labelKey: "about.title" },
            ])}
          </div>
          ${this.toolbarVisible
            ? html`<div class="toolbar top-actions">
                <button class="toolBtn action-btn secondary" title=${t("actions.save")} aria-label=${t("actions.save")} ?disabled=${!this.activePath} @click=${() => this.save()}>
                  <app-icon name="save" size="16"></app-icon>
                  <span>${t("actions.save")}</span>
                </button>
                <button class="toolBtn action-btn primary" title=${t("actions.save_all")} aria-label=${t("actions.save_all")} ?disabled=${!this.activePath} @click=${() => this.save()}>
                  <app-icon name="save-all" size="16"></app-icon>
                  <span>${t("actions.save_all")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${t("actions.undo")} aria-label=${t("actions.undo")} @click=${() => this.handleUndoRedo("undo")}>
                  <app-icon name="undo" size="16" aria-hidden="true"></app-icon><span>${t("actions.undo")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${t("actions.redo")} aria-label=${t("actions.redo")} @click=${() => this.handleUndoRedo("redo")}>
                  <app-icon name="redo" size="16" aria-hidden="true"></app-icon><span>${t("actions.redo")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${t("actions.search")} aria-label=${t("actions.search")} @click=${() => this.openSearchTab("search")}>
                  <app-icon name="search" size="16" aria-hidden="true"></app-icon><span>${t("actions.search")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${t("actions.replace")} aria-label=${t("actions.replace")} @click=${() => this.openSearchTab("replace")}>
                  <app-icon name="palette" size="16" aria-hidden="true"></app-icon><span>${t("actions.replace")}</span>
                </button>
                <button
                  class="toolBtn action-btn ghost"
                  title=${t("actions.indent_file")}
                  aria-label=${t("actions.indent_file")}
                  ?disabled=${!this.activePath || this.indenting}
                  @click=${() => this.indentFile()}
                >
                  <app-icon name="indent" size="16"></app-icon>
                  <span>${t("actions.indent_file")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${t("view.split")} aria-label=${t("view.split")} @click=${() => this.handleMenuAction("view", "Split view")}>
                  <app-icon name="columns" size="16" aria-hidden="true"></app-icon><span>${t("view.split_short")}</span>
                </button>
                <button
                  class="toolBtn action-btn ghost"
                  title=${t("view.compare")}
                  aria-label=${t("view.compare")}
                  ?disabled=${!this.splitViewEnabled || !this.activePath}
                  @click=${() => this.handleMenuAction("view", "Compare…")}
                >
                  <app-icon name="git-branch" size="16" aria-hidden="true"></app-icon><span>${t("view.compare")}</span>
                </button>
              </div>`
            : nothing}
        </div>

        <div class="main editor-layout" ${ref((el) => (this.mainRef = el instanceof HTMLDivElement ? el : null))}>
          <div class="activity activity-bar">
            <div class="activityGroup">
              <div class="act activity-bar-btn ${this.activeActivity === "explorer" ? "active" : ""}" title=${t("activity.explorer")} @click=${() => this.setActivity("explorer")}>
                <app-icon name="folder-open" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity === "search" ? "active" : ""}" title=${t("actions.search")} @click=${() => this.setActivity("search")}>
                <app-icon name="search" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity === "entity" ? "active" : ""}" title=${t("activity.entity")} @click=${() => this.setActivity("entity")}>
                <app-icon name="git-branch" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity === "snippet" ? "active" : ""}" title=${t("activity.snippet")} @click=${() => this.setActivity("snippet")}>
                <app-icon name="palette" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity === "backup" ? "active" : ""}" title=${t("activity.backup")} @click=${() => this.setActivity("backup")}>
                <app-icon name="sun" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity === "utility" ? "active" : ""}" title=${t("activity.utility")} @click=${() => this.setActivity("utility")}>
                <app-icon name="moon" size="24"></app-icon>
              </div>
            </div>
            <div class="activityGroup bottom">
              <div class="act activity-bar-btn ${this.activeActivity === "system" ? "active" : ""}" title=${t("activity.system")} @click=${() => this.setActivity("system")}>
                <app-icon name="settings" size="24"></app-icon>
              </div>
            </div>
          </div>

          <div class="sidebarBackdrop ${this.sidebarOpen ? "open" : ""}" @click=${() => (this.sidebarOpen = false)}></div>

          <div class="sidebar ${this.sidebarOpen ? "open" : ""}" ${ref((el) => (this.sidebarRef = el instanceof HTMLDivElement ? el : null))}>
            <div class="sidebarHeader">
              <div class="explorerTitle">
                ${this.activeActivity === "explorer"
                  ? t("activity.explorer")
                  : this.activeActivity === "search"
                    ? t("actions.search")
                    : this.activeActivity === "entity"
                      ? t("activity.entity")
                      : this.activeActivity === "snippet"
                        ? t("activity.snippet")
                        : this.activeActivity === "backup"
                          ? t("activity.backup")
                          : this.activeActivity === "utility"
                            ? t("activity.utility")
                            : t("activity.system")}
              </div>
              <button class="sidebarClose" title=${t("actions.close")} @click=${() => (this.sidebarOpen = false)}>
                <app-icon name="x" size="20" aria-hidden="true"></app-icon>
              </button>
            </div>
            ${this.renderSidebarContent()}
            <div class="sidebarResizer ${this.sidebarResizing ? "active" : ""}" @mousedown=${this.startSidebarResize}></div>
          </div>

          <div class="editor main-content">
            <div class="tabs editor-tabs">
              ${this.tabs.length === 0
                ? html`<div class="tab editor-tab active">${t("tabs.welcome")}</div>`
                : this.tabs.map(
                    (tab) => html`
                      <div class="tab editor-tab ${tab.path === this.activePath ? "active" : ""}" title=${tab.name} @click=${() => this.switchTab(tab.path)}>
                        <span class="editor-tab-name" title=${tab.name}>${tab.name}</span>
                        ${tab.dirty ? html`<span class="dot" title=${t("tabs.unsaved")}></span>` : nothing}
                        <button
                          class="tabClose"
                          type="button"
                          title=${t("actions.close")}
                          @click=${(e: Event) => this.handleCloseTab(e, tab.path)}
                        >
                          <app-icon name="x" size="20" aria-hidden="true"></app-icon>
                        </button>
                      </div>
                    `
                  )}
            </div>

            <div class="content">
              <div class="crumbs">
                <div>${activeTab ? `/config/${activeTab.path}` : t("editor.empty_open_from_explorer")}</div>
                ${this.toolbarVisible
                  ? nothing
                  : html`<div class="top-actions" style="display:flex; gap:8px;">
                      <button class="btn action-btn secondary" ?disabled=${!this.activePath} @click=${this.save}>
                        <app-icon name="save" size="16"></app-icon>
                        <span>${t("actions.save")}</span>
                      </button>
                      <button class="btn primary action-btn primary" ?disabled=${!this.activePath} @click=${this.save}>
                        <app-icon name="save-all" size="16"></app-icon>
                        <span>${t("actions.save_all")}</span>
                      </button>
                      <button class="btn action-btn ghost" ?disabled=${!this.activePath || this.indenting} @click=${() => this.indentFile()}>
                        <app-icon name="indent" size="16"></app-icon>
                        ${this.indenting ? t("status.yaml_formatting") : `${t("actions.indent_file")}…`}
                      </button>
                    </div>`}
              </div>

              ${this.splitViewEnabled
                ? html`<div class="splitWrap">
                    <div class="splitPane">
                      <div class="editorWrap">
                        <div class="gutter" ${ref((el) => (this.gutterRef = el instanceof HTMLDivElement ? el : null))}>${renderLineNumbers(this.lineCount)}</div>
                    <div class="codeWrap">
                      <div
                        class="code ${this.showIndentGuides ? "showGuides" : ""}"
                        ${ref((el) => (this.codeRef = el instanceof HTMLDivElement ? el : null))}
                      >
                        ${renderHighlighted(this.content, {
                          diffMap: diffMaps.left,
                          showGuides: this.showIndentGuides,
                          indentSize: 2,
                          skipCommentGuides: true,
                          activeSegmentId: this.activeIndentSegmentId,
                        })}
                      </div>
                      <textarea
                        ${ref((el) => (this.editorRef = el instanceof HTMLTextAreaElement ? el : null))}
                        .value=${this.content}
                        placeholder=${t("editor.placeholder.select_file")}
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
                        <div class="gutter" ${ref((el) => (this.baseGutterRef = el instanceof HTMLDivElement ? el : null))}>${renderLineNumbersFor(this.savedBaseText)}</div>
                    <div class="codeWrap">
                      <div class="code" ${ref((el) => (this.baseCodeRef = el instanceof HTMLDivElement ? el : null))}>${renderHighlighted(this.savedBaseText, { diffMap: diffMaps.right })}</div>
                      <pre class="basePre" ${ref((el) => (this.basePreRef = el instanceof HTMLPreElement ? el : null))} @scroll=${this.syncBaseScroll}>${this.savedBaseText}</pre>
                    </div>
                      </div>
                    </div>
                  </div>`
                : html`<div class="editorWrap">
                    <div class="gutter" ${ref((el) => (this.gutterRef = el instanceof HTMLDivElement ? el : null))}>${renderLineNumbers(this.lineCount)}</div>
                    <div class="codeWrap">
                      <div
                        class="code ${this.showIndentGuides ? "showGuides" : ""}"
                        ${ref((el) => (this.codeRef = el instanceof HTMLDivElement ? el : null))}
                      >
                        ${renderHighlighted(this.content, {
                          showGuides: this.showIndentGuides,
                          indentSize: 2,
                          skipCommentGuides: true,
                          activeSegmentId: this.activeIndentSegmentId,
                        })}
                      </div>
                      <textarea
                        ${ref((el) => (this.editorRef = el instanceof HTMLTextAreaElement ? el : null))}
                        .value=${this.content}
                        placeholder=${t("editor.placeholder.select_file")}
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
              <div class="contextMenuItem" @click=${() => this.handleCopyCut("cut")}><app-icon name="cut" size="16" aria-hidden="true"></app-icon> ${t("actions.cut")}</div>
              <div class="contextMenuItem" @click=${() => this.handleCopyCut("copy")}><app-icon name="copy" size="16" aria-hidden="true"></app-icon> ${t("actions.copy")}</div>
              <div class="contextMenuItem" @click=${() => this.handlePaste()}><app-icon name="paste" size="16" aria-hidden="true"></app-icon> ${t("actions.paste")}</div>
              <div class="contextMenuItem" @click=${() => this.reindentAll()}><app-icon name="indent" size="16" aria-hidden="true"></app-icon> ${t("actions.auto_indent")}</div>
              <div class="contextMenuItem" @click=${() => this.handleCompareFromContext()}><app-icon name="git-branch" size="16" aria-hidden="true"></app-icon> ${t("view.compare")}</div>
            </div>`
          : nothing}

        ${this.treeMenuOpen
          ? html`<div
              class="contextMenu treeContextMenu"
              style="top:${this.treeMenuY}px; left:${this.treeMenuX}px;"
              @click=${(e: Event) => e.stopPropagation()}
            >
              ${this.treeMenuType === "dir"
                ? html`<div class="contextMenuItem" @click=${() => this.createFromContext("file")}>
                      <app-icon name="file-plus" size="16" aria-hidden="true"></app-icon> ${t("explorer.context.new_file")} ${this.treeMenuFromBlank ? "" : t("labels.here")}
                    </div>
                    <div class="contextMenuItem" @click=${() => this.createFromContext("folder")}>
                      <app-icon name="folder-plus" size="16" aria-hidden="true"></app-icon> ${t("explorer.context.new_folder")} ${this.treeMenuFromBlank ? "" : t("labels.here")}
                    </div>`
                : nothing}
              ${!this.treeMenuFromBlank
                ? html`
                    <div class="contextMenuItem" @click=${() => this.copyTreeItem()}><app-icon name="copy" size="16" aria-hidden="true"></app-icon> ${t("actions.copy")}</div>
                    <div
                      class="contextMenuItem ${this.treeClipboard ? "" : "disabled"}"
                      @click=${() => this.pasteTreeItem()}
                    >
                      <app-icon name="paste" size="16" aria-hidden="true"></app-icon> ${t("actions.paste")}
                    </div>
                    <div class="contextMenuItem" @click=${() => this.confirmTreeDelete()}><app-icon name="trash" size="16" aria-hidden="true"></app-icon> ${t("btn.delete")}</div>
                  `
                : nothing}
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
                    ${s.type === "entity" ? html`<app-icon name="git-branch" size="14" aria-hidden="true"></app-icon>` : nothing}
                    <span>${s.type === "mdi" ? `mdi:${s.value}` : s.value}</span>
                  </span>
                  ${s.type === "mdi"
                    ? html`<span class="suggestItemIcon"><app-icon name="settings" size="14" aria-hidden="true"></app-icon></span>`
                    : nothing}
                </div>`
              )}
            </div>`
          : nothing}

        ${this.showTreeDeleteModal
          ? html`<div class="modalBackdrop" @click=${() => this.cancelTreeDelete()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                <h3>${t("modal.delete_confirm.title")}</h3>
                <div class="muted" style="font-size: var(--font-size-sm);">
                  ${t("modal.delete_confirm.message_prefix")} ${this.deleteTargetType === "dir" ? t("labels.folder") : t("labels.file")}:
                  <strong>${this.deleteTargetPath}</strong>?
                </div>
                <div class="actions">
                  <button class="btn" @click=${() => this.cancelTreeDelete()}>${t("btn.cancel")}</button>
                  <button class="btn danger" @click=${() => this.executeTreeDelete()}>${t("btn.delete")}</button>
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
                    <button class="btn" @click=${() => this.cancelNewItem()}>${t("btn.cancel")}</button>
                    <button class="btn primary" @click=${() => this.createNewItem()}>${t("btn.create")}</button>
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
                    <h3>${t("modal.about.title")}</h3>
                  </div>
                  <div class="aboutBody">
                    <div class="aboutRow">
                      <div class="aboutLabel">${t("modal.about.developer")}</div>
                      <div class="aboutValue">Juri Zanella</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${t("modal.about.github")}</div>
                      <div class="aboutValue">TheWhiteWolf1985</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${t("modal.about.repository")}</div>
                      <div class="aboutValue">
                        <a href="https://github.com/TheWhiteWolf1985/File-editor-plus" target="_blank" rel="noopener">
                          https://github.com/TheWhiteWolf1985/File-editor-plus
                        </a>
                      </div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${t("status.version")}</div>
                      <div class="aboutValue">${this.appVersion}</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${t("modal.about.license")}</div>
                      <div class="aboutValue">MIT</div>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="btn" @click=${() => this.closeAboutModal()}>${t("btn.close")}</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        ${this.showSettingsModal
          ? html`
              <div class="modalBackdrop" @click=${() => this.cancelSettingsModal()}>
                <div class="modal settingsModal" @click=${(e: Event) => e.stopPropagation()}>
                  <h3>${t("settings.title")}</h3>
                  <div class="settingsTabs">
                    <button
                      class="settingsTab ${this.settingsTab === "localization" ? "active" : ""}"
                      type="button"
                      @click=${() => (this.settingsTab = "localization")}
                    >
                      ${t("settings.tabs.localization")}
                    </button>
                    <button
                      class="settingsTab ${this.settingsTab === "appearance" ? "active" : ""}"
                      type="button"
                      @click=${() => (this.settingsTab = "appearance")}
                    >
                      ${t("settings.tabs.appearance")}
                    </button>
                  </div>
                  ${this.settingsTab === "appearance"
                    ? html`
                        <div class="settingsBody">
                          <div class="settingsRow">
                            <div>
                              <div class="settingsLabel">${t("settings.appearance.font_size")}</div>
                              <div class="settingsHint">${t("settings.appearance.font_size_hint")}</div>
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
                          <div class="settingsHint">${t("settings.localization.hint")}</div>
                          <div class="localeGrid" role="radiogroup" aria-label=${t("settings.localization.select_aria")}>
                            ${SUPPORTED_LOCALES.map(
                              (locale) => html`
                                <button
                                  class="localeTile ${this.selectedLocale === locale.code ? "selected" : ""}"
                                  type="button"
                                  role="radio"
                                  aria-checked=${this.selectedLocale === locale.code ? "true" : "false"}
                                  @click=${() => {
                                    void this.selectLocale(locale.code);
                                  }}
                                >
                                  <span class="localeBadge" aria-hidden="true">${locale.badge}</span>
                                  <span class="localeName">${locale.label}</span>
                                </button>
                              `
                            )}
                          </div>
                        </div>
                      `}
                  <div class="actions">
                    <button class="btn" @click=${() => this.cancelSettingsModal()}>${t("btn.cancel")}</button>
                    <button class="btn primary" @click=${() => this.applySettingsModal()}>${t("btn.apply")}</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        ${this.showSnippetModal
          ? html`
              <div class="modalBackdrop" @click=${() => this.closeSnippetModal()}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:480px;">
                  <h3>${t("modal.snippet.new_title")}</h3>
                  <label>
                    ${t("snippets.form.title_max_100")}
                    <input
                      type="text"
                      .value=${this.snippetName}
                      maxlength="100"
                      @input=${(e: Event) => (this.snippetName = (e.target as HTMLInputElement).value)}
                      required
                    />
                  </label>
                  <label>
                    ${t("snippets.form.description_max_250")}
                    <input
                      type="text"
                      .value=${this.snippetDescription}
                      maxlength="250"
                      @input=${(e: Event) => (this.snippetDescription = (e.target as HTMLInputElement).value)}
                      required
                    />
                  </label>
                  <label>
                    ${t("snippets.form.content")}
                    <textarea
                      style="min-height:160px; background: var(--input-bg); color: var(--text-color); border:1px solid var(--border-color); border-radius:8px; padding:8px;"
                      .value=${this.snippetContent}
                      @input=${(e: Event) => (this.snippetContent = (e.target as HTMLTextAreaElement).value)}
                      required
                    ></textarea>
                  </label>
                  <div class="actions">
                    <button class="btn" ?disabled=${this.snippetSaving} @click=${() => this.closeSnippetModal()}>${t("btn.cancel")}</button>
                    <button class="btn primary" ?disabled=${this.snippetSaving} @click=${() => this.saveSnippet()}>${t("btn.save")}</button>
                  </div>
                </div>
              </div>
            `
          : nothing}

        ${this.showUnsavedModal
          ? html`<div class="modalBackdrop" @click=${() => this.cancelUnsavedModal()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:480px;">
                <h3>${t("modal.unsaved.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${t("modal.unsaved.message", { path: this.activePath ?? t("modal.unsaved.current_file") })}
                </p>
                <div class="actions">
                  <button class="btn" @click=${() => this.cancelUnsavedModal()}>${t("btn.cancel")}</button>
                  <button class="btn" @click=${() => this.confirmUnsavedDiscard()}>${t("modal.unsaved.discard")}</button>
                  <button class="btn primary" @click=${() => this.confirmUnsavedSave()}>${t("btn.save")}</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.showUploadModal
          ? html`<div class="modalBackdrop" @click=${() => this.closeUploadModal()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:520px;">
                <h3>${t("modal.upload.title")}</h3>
                <div class="formRow" style="margin-top:12px; display:grid; gap:6px;">
                  <label style="font-size:var(--font-size-sm); color:var(--muted-color);">${t("labels.file")}</label>
                  <input type="file" multiple @change=${this.handleUploadFileChange} />
                </div>
                ${this.uploadFiles && this.uploadFiles.length
                  ? html`<div style="max-height:160px; overflow:auto; margin-top:6px; border:1px solid var(--border-color); border-radius:6px; padding:6px; display:grid; gap:4px;">
                      ${this.uploadFiles.map(
                        (f) =>
                          html`<div style="display:flex; justify-content:space-between; gap:8px;">
                            <span style="overflow:hidden; text-overflow:ellipsis;">${f.name}</span>
                            <span style="color:var(--muted-color); white-space:nowrap;">${(f.size / 1024).toFixed(
                              f.size < 10240 ? 2 : 1
                            )} KB</span>
                          </div>`
                      )}
                    </div>`
                  : nothing}
                <div class="formRow" style="margin-top:12px; display:grid; gap:6px;">
                  <label style="font-size:var(--font-size-sm); color:var(--muted-color);">${t("modal.upload.destination_folder")}</label>
                  <select
                    .value=${this.uploadTargetDir}
                    @change=${(e: Event) => (this.uploadTargetDir = this.normalizeDir((e.target as HTMLSelectElement).value))}
                  >
                    ${this.getDirectoryOptions().map(
                      (dir) =>
                        html`<option value=${dir.path} ?disabled=${!dir.writable}>
                          ${dir.path === "/" ? "/config" : `/config/${dir.path}`} ${dir.writable ? "" : " (readonly)"}
                        </option>`
                    )}
                  </select>
                </div>
                <div class="actions">
                  <button class="btn" @click=${() => this.closeUploadModal()} ?disabled=${this.uploadInProgress}>${t("btn.cancel")}</button>
                  <button
                    class="btn primary"
                    @click=${() => this.submitUpload()}
                    ?disabled=${this.uploadInProgress || !this.uploadFiles || this.uploadFiles.length === 0}
                  >
                    ${this.uploadInProgress
                      ? this.uploadProgress
                        ? t("modal.upload.progress", { done: this.uploadProgress.done, total: this.uploadProgress.total })
                        : t("modal.upload.uploading")
                      : t("explorer.action.upload")}
                  </button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.showGdriveModal
          ? html`<div class="modalBackdrop" @click=${() => this.closeGdriveModal()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:720px;">
                <h3>Google Drive Backup</h3>
                ${this.gdriveLoading
                  ? html`<div style="margin-top:10px; color:var(--muted-color);">${t("status.loading")}</div>`
                  : nothing}
                ${(() => {
                  const st = this.gdriveStatus || {};
                  const configured = !!st.configured;
                  const connected = !!st.connected;
                  const flow = st.device_flow || null;
                  const sched = this.gdriveSchedule || {};
                  const mode = String(sched.mode || "daily");
                  const atTime = String(sched.at_time || sched.time || "03:00");
                  const hourInterval = Number(sched.hour_interval ?? 1);
                  const weekday = String(sched.weekday || "mon");
                  const monthday = Number(sched.monthday ?? 1);
                  const retentionCount = Number(sched.retention_count ?? sched.retention ?? 0);
                  return html`
                    <div style="margin-top:10px; display:grid; gap:10px;">
                      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                        <div>
                          <div style="font-weight:600;">Stato</div>
                          <div style="color:var(--muted-color);">
                            ${!configured
                              ? "Non configurato (manca gdrive_client_id nelle opzioni add-on)"
                              : connected
                                ? "Connesso"
                                : "Non connesso"}
                          </div>
                        </div>
                        <div style="display:flex; gap:8px; align-items:center;">
                          ${connected
                            ? html`<button class="btn" ?disabled=${this.gdriveLoading} @click=${() => this.disconnectGdrive()}>Disconnetti</button>`
                            : html`<button class="btn primary" ?disabled=${this.gdriveLoading} @click=${() => this.startGdriveOAuthFlow()}>
                                Connetti
                              </button>`}
                        </div>
                      </div>

                      ${!connected && flow
                        ? html`<div style="border:1px solid var(--border-color); border-radius:10px; padding:10px; background:var(--panel-bg); display:grid; gap:8px;">
                            <div style="font-weight:600;">Device flow</div>
                            <div style="color:var(--muted-color);">
                              Apri <span style="font-family:monospace;">${flow.verification_url}</span> e inserisci il codice:
                              <span style="font-family:monospace; font-weight:700;">${flow.user_code}</span>
                            </div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                              <button
                                class="btn"
                                ?disabled=${this.gdriveLoading}
                                @click=${async () => {
                                  try {
                                    await navigator.clipboard.writeText(String(flow.user_code || ""));
                                    this.showToast("Codice copiato");
                                  } catch {
                                    this.showToast("Copia non disponibile", "error");
                                  }
                                }}
                              >
                                Copia codice
                              </button>
                              <button class="btn" ?disabled=${this.gdriveLoading} @click=${() => this.cancelGdriveDeviceFlow()}>Annulla</button>
                            </div>
                            <div style="font-size:var(--font-size-sm); color:var(--muted-color);">Stato: ${String(flow.status || "pending")}</div>
                          </div>`
                        : nothing}

                      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                        <div>
                          <div style="font-weight:600;">Backup manuale</div>
                          <div style="color:var(--muted-color);">Crea uno zip di /config e lo carica su Google Drive.</div>
                        </div>
                        <button class="btn primary" ?disabled=${this.gdriveLoading || !connected} @click=${() => this.runGdriveBackupNow()}>
                          Backup ora
                        </button>
                      </div>

                      <div style="border:1px solid var(--border-color); border-radius:10px; padding:10px; display:grid; gap:10px;">
                        <div style="font-weight:600;">Schedulazione</div>
                        <label style="display:flex; align-items:center; gap:8px;">
                          <input
                            type="checkbox"
                            .checked=${!!sched.enabled}
                            ?disabled=${this.gdriveSavingSchedule}
                            @change=${(e: Event) => {
                              const checked = (e.target as HTMLInputElement).checked;
                              this.gdriveSchedule = { ...(sched || {}), enabled: checked };
                            }}
                          />
                          Abilita backup automatico
                        </label>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                          <label style="display:grid; gap:6px;">
                            <span style="font-size:var(--font-size-sm); color:var(--muted-color);">Modalita'</span>
                            <select
                              .value=${mode}
                              ?disabled=${this.gdriveSavingSchedule}
                              @change=${(e: Event) => {
                                const v = String((e.target as HTMLSelectElement).value || "daily");
                                const next: any = { ...(sched || {}), mode: v };
                                if (v === "hourly") {
                                  if (next.hour_interval == null) next.hour_interval = 1;
                                } else {
                                  if (!next.at_time && next.time) next.at_time = next.time;
                                  if (!next.at_time) next.at_time = atTime;
                                  if (v === "weekly" && !next.weekday) next.weekday = "mon";
                                  if (v === "monthly" && !next.monthday) next.monthday = 1;
                                }
                                this.gdriveSchedule = next;
                              }}
                            >
                              <option value="hourly">Oraria</option>
                              <option value="daily">Giornaliera</option>
                              <option value="weekly">Settimanale</option>
                              <option value="monthly">Mensile</option>
                            </select>
                          </label>

                          ${mode === "hourly"
                            ? html`<label style="display:grid; gap:6px;">
                                <span style="font-size:var(--font-size-sm); color:var(--muted-color);">Intervallo ore</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="24"
                                  .value=${String(Number.isFinite(hourInterval) ? hourInterval : 1)}
                                  ?disabled=${this.gdriveSavingSchedule}
                                  @input=${(e: Event) => {
                                    const v = Number((e.target as HTMLInputElement).value || 1);
                                    this.gdriveSchedule = { ...(sched || {}), mode: "hourly", hour_interval: v };
                                  }}
                                />
                              </label>`
                            : html`
                                ${mode === "weekly"
                                  ? html`<label style="display:grid; gap:6px;">
                                      <span style="font-size:var(--font-size-sm); color:var(--muted-color);">Giorno</span>
                                      <select
                                        .value=${weekday}
                                        ?disabled=${this.gdriveSavingSchedule}
                                        @change=${(e: Event) => {
                                          const v = String((e.target as HTMLSelectElement).value || "mon");
                                          this.gdriveSchedule = { ...(sched || {}), mode: "weekly", weekday: v };
                                        }}
                                      >
                                        <option value="mon">Lun</option>
                                        <option value="tue">Mar</option>
                                        <option value="wed">Mer</option>
                                        <option value="thu">Gio</option>
                                        <option value="fri">Ven</option>
                                        <option value="sat">Sab</option>
                                        <option value="sun">Dom</option>
                                      </select>
                                    </label>`
                                  : nothing}
                                ${mode === "monthly"
                                  ? html`<label style="display:grid; gap:6px;">
                                      <span style="font-size:var(--font-size-sm); color:var(--muted-color);">Giorno mese</span>
                                      <input
                                        type="number"
                                        min="1"
                                        max="28"
                                        .value=${String(Number.isFinite(monthday) ? monthday : 1)}
                                        ?disabled=${this.gdriveSavingSchedule}
                                        @input=${(e: Event) => {
                                          const v = Number((e.target as HTMLInputElement).value || 1);
                                          this.gdriveSchedule = { ...(sched || {}), mode: "monthly", monthday: v };
                                        }}
                                      />
                                    </label>`
                                  : nothing}
                                <label style="display:grid; gap:6px;">
                                  <span style="font-size:var(--font-size-sm); color:var(--muted-color);">Orario</span>
                                  <input
                                    type="time"
                                    .value=${atTime}
                                    ?disabled=${this.gdriveSavingSchedule}
                                    @input=${(e: Event) => {
                                      const v = (e.target as HTMLInputElement).value;
                                      this.gdriveSchedule = { ...(sched || {}), at_time: v };
                                    }}
                                  />
                                </label>
                              `}
                          <label style="display:grid; gap:6px;">
                            <span style="font-size:var(--font-size-sm); color:var(--muted-color);">Retention (auto)</span>
                            <input
                              type="number"
                              min="0"
                              max="200"
                              .value=${String(Number.isFinite(retentionCount) ? retentionCount : 0)}
                              ?disabled=${this.gdriveSavingSchedule}
                              @input=${(e: Event) => {
                                const v = Number((e.target as HTMLInputElement).value || 0);
                                this.gdriveSchedule = { ...(sched || {}), retention_count: v };
                              }}
                            />
                          </label>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                          <div style="font-size:var(--font-size-sm); color:var(--muted-color);">
                            Next run: ${sched.next_run ? String(sched.next_run) : "N/A"}
                          </div>
                          <button class="btn" ?disabled=${this.gdriveSavingSchedule} @click=${() => this.saveGdriveSchedule()}>
                            ${this.gdriveSavingSchedule ? "Salvataggio…" : "Salva"}
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                })()}
                <div class="actions">
                  <button class="btn" @click=${() => this.closeGdriveModal()}>Chiudi</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.showSaveAsModal
          ? html`<div class="modalBackdrop" @click=${() => this.closeSaveAsModal()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:520px;">
                <h3>Save as…</h3>
                <div class="formRow" style="margin-top:12px; display:grid; gap:6px;">
                  <label style="font-size:var(--font-size-sm); color:var(--muted-color);">Cartella</label>
                  <select
                    .value=${this.saveAsTargetDir}
                    @change=${(e: Event) => (this.saveAsTargetDir = this.normalizeDir((e.target as HTMLSelectElement).value))}
                    ?disabled=${this.saveAsInProgress}
                  >
                    ${this.getDirectoryOptions().map(
                      (dir) =>
                        html`<option value=${dir.path} ?disabled=${!dir.writable}>
                          ${dir.path === "/" ? "/config" : `/config/${dir.path}`} ${dir.writable ? "" : " (readonly)"}
                        </option>`
                    )}
                  </select>
                </div>
                <div class="formRow" style="margin-top:12px; display:grid; gap:6px;">
                  <label style="font-size:var(--font-size-sm); color:var(--muted-color);">Nome file</label>
                  <input
                    type="text"
                    .value=${this.saveAsFilename}
                    @input=${(e: Event) => (this.saveAsFilename = (e.target as HTMLInputElement).value)}
                    ?disabled=${this.saveAsInProgress}
                  />
                </div>
                <div class="actions">
                  <button class="btn" @click=${() => this.closeSaveAsModal()} ?disabled=${this.saveAsInProgress}>${t("btn.cancel")}</button>
                  <button class="btn primary" @click=${() => this.submitSaveAs()} ?disabled=${this.saveAsInProgress}>
                    ${this.saveAsInProgress ? t("status.saving") : t("btn.save")}
                  </button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.saveAsConflictOpen && this.saveAsConflictPath
          ? html`<div class="modalBackdrop" @click=${() => this.resolveSaveAsConflict("cancel")}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:480px;">
                <h3>Conflitto</h3>
                <p style="margin-top:8px; color:var(--muted-color);">File già esistente, vuoi sovrascrivere?</p>
                <p style="margin-top:6px; color:var(--muted-color); font-size:var(--font-size-sm);">${this.saveAsConflictPath}</p>
                <div class="actions">
                  <button class="btn" @click=${() => this.resolveSaveAsConflict("cancel")}>Cancel</button>
                  <button class="btn" @click=${() => this.resolveSaveAsConflict("suffix")}>No</button>
                  <button class="btn primary" @click=${() => this.resolveSaveAsConflict("overwrite")}>Sì</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.moveConfirmOpen && this.pendingMove
          ? html`<div class="modalBackdrop" @click=${() => this.cancelMoveConfirm()}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:460px;">
                <h3>${t("modal.move_confirm.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${t("modal.move_confirm.message", {
                    source: this.pendingMove.src.split("/").pop() || this.pendingMove.src,
                    target: this.pendingMove.dstDir || "/"
                  })}
                </p>
                <div class="actions">
                  <button class="btn" @click=${() => this.cancelMoveConfirm()}>${t("btn.cancel")}</button>
                  <button class="btn primary" @click=${() => this.confirmMove()}>${t("actions.move")}</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.conflictDialogOpen && this.conflictData
          ? html`<div class="modalBackdrop" @click=${() => { if (!this.uploadInProgress) this.resolveConflict("skip"); }}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:480px;">
                <h3>${t("modal.conflict.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${t("modal.conflict.message", { name: this.conflictData.name, target: this.conflictData.target })}
                </p>
                <div class="actions">
                  <button class="btn" @click=${() => this.resolveConflict("skip")}>${t("btn.cancel")}</button>
                  <button class="btn" @click=${() => this.resolveConflict("autorename")}>${t("actions.rename")}</button>
                  <button class="btn primary" @click=${() => this.resolveConflict("overwrite")}>${t("actions.overwrite")}</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.showResetSessionModal
          ? html`<div class="modalBackdrop" @click=${() => (this.showResetSessionModal = false)}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()} style="max-width:460px;">
                <h3>${t("session.reset.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${t("session.reset.confirm_message")}
                </p>
                <div class="actions">
                  <button class="btn" @click=${() => (this.showResetSessionModal = false)}>${t("btn.cancel")}</button>
                  <button class="btn primary" @click=${() => this.resetSession()}>${t("btn.reset")}</button>
                </div>
              </div>
            </div>`
          : nothing}

        <div class="statusbar status-bar">
          <div class="status-bar-left">
            <div class="status-item">
              <app-icon name="wifi" size="14" aria-hidden="true"></app-icon>
              <span>${this.status}</span>
            </div>
            <div class="version status-item">v${this.appVersion === "unknown" ? "?.?.?" : this.appVersion}</div>
          </div>
          <div class="right status-bar-right">
            <button class="statusToggle status-item" @click=${() => (this.autoIndentEnabled = !this.autoIndentEnabled)}>
              ${t("status.auto_indent")}: ${this.autoIndentEnabled ? t("labels.on") : t("labels.off")}
            </button>
            <button class="statusToggle status-item" @click=${() => this.cycleTheme()}>
              ${t("status.theme")}: ${t(`status.theme_${this.themeMode}`)}
            </button>
            <span class="status-item">${t("status.line_short")} ${this.cursorLine}</span>
            <span class="status-item">${t("status.column_short")} ${this.cursorCol}</span>
            <span class="status-item">${t("status.encoding_utf8")}</span>
            <span class="status-item">${t("status.eol_lf")}</span>
            <span class="status-item">${t("status.runtime_lit")}</span>
          </div>
        </div>
        <div class="overlay-root" ${ref((el) => (this.overlayRootRef = el instanceof HTMLDivElement ? el : null))}></div>
      </div>
      </div>
    `;
  }
}
