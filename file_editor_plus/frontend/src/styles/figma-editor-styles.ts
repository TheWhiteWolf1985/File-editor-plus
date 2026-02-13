import { css } from "lit";

export const figmaEditorStyles = css`
/* Monaco Editor Glass UI Theme */

/* CSS Variables for theming (Shadow DOM scoped) */
:host {
  /* Teal/Cyan Accent */
  --accent-primary: #14b8a6;
  --accent-hover: #0d9488;
  --accent-active: #0f766e;
  --accent-light: #5eead4;
  --accent-subtle: rgba(20, 184, 166, 0.1);
  --file-blue: #3b82f6;
  --folder-orange: #f97316;

  /* Dark Theme Colors */
  --dark-bg-primary: #0a0a0a;
  --dark-bg-secondary: #141414;
  --dark-bg-tertiary: #1a1a1a;
  --dark-border: rgba(255, 255, 255, 0.08);
  --dark-text-primary: #e5e7eb;
  --dark-text-secondary: #9ca3af;
  --dark-text-tertiary: #6b7280;

  /* Light Theme Colors */
  --light-bg-primary: #f8f9fa;
  --light-bg-secondary: #f3f4f6;
  --light-bg-tertiary: #fafafa;
  --light-border: rgba(0, 0, 0, 0.08);
  --light-border-strong: rgba(0, 0, 0, 0.18);
  --light-text-primary: #1f2937;
  --light-text-secondary: #4b5563;
  --light-text-tertiary: #9ca3af;

  /* Glass Effects */
  --glass-blur: 24px;
  --glass-noise: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Dark Theme */
:host([data-theme="dark"]) {
  color-scheme: dark;
}

/* Light Theme */
:host([data-theme="light"]) {
  color-scheme: light;
}

/* Reset and Base */
* {
  box-sizing: border-box;
}

:host {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
}

:host([data-theme="dark"]) {
  background: var(--dark-bg-primary);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) {
  background: var(--light-bg-primary);
  color: var(--light-text-primary);
}

/* Main App Layout */
.editor-app {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* Activity Bar */
.activity-bar {
  width: 68px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

:host([data-theme="dark"]) .activity-bar {
  background: var(--dark-bg-secondary);
  border-right: 1px solid var(--dark-border);
}

:host([data-theme="light"]) .activity-bar {
  background: var(--light-bg-secondary);
  border-right: 1px solid var(--light-border-strong);
}

.activity-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.4;
}

.activity-bar-items,
.activity-bar-bottom {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
}

.activity-bar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

:host([data-theme="dark"]) .activity-bar-btn {
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .activity-bar-btn {
  color: var(--light-text-secondary);
}

:host([data-theme="dark"]) .activity-bar-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .activity-bar-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--light-text-primary);
}

.activity-bar-btn.active {
  color: var(--accent-primary);
}

:host([data-theme="dark"]) .activity-bar-btn.active {
  background: rgba(20, 184, 166, 0.12);
}

:host([data-theme="light"]) .activity-bar-btn.active {
  background: rgba(20, 184, 166, 0.08);
}

.activity-bar-btn.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--accent-primary);
  border-radius: 2px;
}

.activity-bar-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Sidebar */
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

:host([data-theme="dark"]) .sidebar {
  background: var(--dark-bg-tertiary);
  border-right: 1px solid var(--dark-border);
}

:host([data-theme="light"]) .sidebar {
  background: var(--light-bg-tertiary);
  border-right: 1px solid var(--light-border-strong);
}

.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.3;
  z-index: 1;
}

/* File Explorer */
.file-explorer {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.file-explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-md);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.file-explorer-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

:host([data-theme="dark"]) .file-explorer-title {
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .file-explorer-title {
  color: var(--light-text-secondary);
}

.explorer-actions {
  display: flex;
  gap: var(--space-sm);
}

.explorer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.explorer-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* New File Button - Blue */
.new-file-btn {
  color: #3b82f6;
}

:host([data-theme="dark"]) .new-file-btn {
  background: rgba(59, 130, 246, 0.12);
}

:host([data-theme="light"]) .new-file-btn {
  background: rgba(59, 130, 246, 0.08);
}

.new-file-btn:hover {
  background: rgba(59, 130, 246, 0.18);
  transform: translateY(-1px);
}

/* New Folder Button - Orange */
.new-folder-btn {
  color: #f97316;
}

:host([data-theme="dark"]) .new-folder-btn {
  background: rgba(249, 115, 22, 0.12);
}

:host([data-theme="light"]) .new-folder-btn {
  background: rgba(249, 115, 22, 0.08);
}

.new-folder-btn:hover {
  background: rgba(249, 115, 22, 0.18);
  transform: translateY(-1px);
}

/* Upload Button - Teal */
.upload-btn-header {
  color: var(--accent-primary);
}

:host([data-theme="dark"]) .upload-btn-header {
  background: rgba(20, 184, 166, 0.12);
}

:host([data-theme="light"]) .upload-btn-header {
  background: rgba(20, 184, 166, 0.08);
}

.upload-btn-header:hover {
  background: rgba(20, 184, 166, 0.18);
  transform: translateY(-1px);
}

/* Remove old upload-btn styles */
.upload-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 8px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--accent-primary);
}

:host([data-theme="dark"]) .upload-btn {
  background: rgba(20, 184, 166, 0.12);
}

:host([data-theme="light"]) .upload-btn {
  background: rgba(20, 184, 166, 0.08);
}

.upload-btn:hover {
  background: rgba(20, 184, 166, 0.18);
  transform: translateY(-1px);
}

.upload-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* File Tree */
.file-tree {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: var(--space-md);
}

.file-tree::-webkit-scrollbar {
  width: 8px;
}

:host([data-theme="dark"]) .file-tree::-webkit-scrollbar-track {
  background: transparent;
}

:host([data-theme="light"]) .file-tree::-webkit-scrollbar-track {
  background: transparent;
}

:host([data-theme="dark"]) .file-tree::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

:host([data-theme="light"]) .file-tree::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

:host([data-theme="dark"]) .file-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

:host([data-theme="light"]) .file-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.file-tree-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px var(--space-sm);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
  font-size: 14px;
  min-height: 28px;
}

:host([data-theme="dark"]) .file-tree-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

:host([data-theme="light"]) .file-tree-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.file-tree-item.selected {
  background: var(--accent-subtle);
}

:host([data-theme="dark"]) .file-tree-item.selected {
  background: rgba(20, 184, 166, 0.15);
}

:host([data-theme="light"]) .file-tree-item.selected {
  background: rgba(20, 184, 166, 0.1);
}

.file-tree-item .chevron {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.file-tree-item app-icon.tree-icon--folder { color: #f97316; }
.file-tree-item app-icon.tree-icon--file { color: #3b82f6; }
.file-tree-item app-icon.tree-icon--chevron { color: #14b8a6; }

.file-tree-item .tree-label {
  color: inherit;
}

.file-tree-item.selected .tree-label {
  color: var(--accent-primary);
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

:host([data-theme="dark"]) .main-content {
  background: var(--dark-bg-primary);
}

:host([data-theme="light"]) .main-content {
  background: var(--light-bg-primary);
}

.main-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.2;
  z-index: 0;
}

.main-content > * {
  position: relative;
  z-index: 1;
}

/* Editor Header */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-lg);
  min-height: 44px;
  position: relative;
  z-index: 10;
}

:host([data-theme="dark"]) .editor-header {
  background: rgba(20, 20, 20, 0.7);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--dark-border);
}

:host([data-theme="light"]) .editor-header {
  background: rgba(248, 249, 250, 0.7);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--light-border-strong);
}

.editor-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.2;
}

.editor-menu {
  display: flex;
  justify-content: flex-start;
  margin-right: auto;
  gap: var(--space-lg);
  position: relative;
  z-index: 1;
}

.menu-item {
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  font-weight: 500;
}

:host([data-theme="dark"]) .menu-item {
  color: #d1d5db;
}

:host([data-theme="light"]) .menu-item {
  color: var(--light-text-secondary);
}

:host([data-theme="dark"]) .menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
}

:host([data-theme="light"]) .menu-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--light-text-primary);
}

/* Top Actions */
.top-actions {
  display: flex;
  gap: var(--space-sm);
  position: relative;
  z-index: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 32px;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.15;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:not(:disabled):active {
  transform: translateY(1px);
}

.action-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Primary Button */
.action-btn.primary {
  background: var(--accent-primary);
  color: white;
}

.action-btn.primary:not(:disabled):hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  transform: translateY(-1px);
}

/* Secondary Button */
:host([data-theme="dark"]) .action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .action-btn.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: var(--light-text-primary);
}

:host([data-theme="dark"]) .action-btn.secondary:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.12);
}

:host([data-theme="light"]) .action-btn.secondary:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.08);
}

/* Ghost Button */
:host([data-theme="dark"]) .action-btn.ghost {
  background: transparent;
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .action-btn.ghost {
  background: transparent;
  color: var(--light-text-secondary);
}

:host([data-theme="dark"]) .action-btn.ghost:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .action-btn.ghost:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--light-text-primary);
}

/* Editor Container */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.editor-tab {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  height: 32px;
  padding: 0 var(--space-md);
  gap: var(--space-sm);
  min-height: 32px;
  line-height: 1;
  box-sizing: border-box;
}

.editor-tabs,
.tabs {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  height: 36px;
  flex: 0 0 36px;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-gutter: stable;
  white-space: nowrap;
}

:host([data-theme="dark"]) .editor-tab {
  background: var(--dark-bg-tertiary);
  border-bottom: 1px solid var(--dark-border);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .editor-tab {
  background: var(--light-bg-tertiary);
  border-bottom: 1px solid var(--light-border-strong);
  color: var(--light-text-primary);
}

.editor-tab-name {
  display: block;
  font-size: 14px;
  min-width: 0;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

/* Editor Empty State */
.editor-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-empty-content {
  text-align: center;
  padding: var(--space-xl);
}

.editor-empty-icon {
  margin: 0 auto var(--space-lg);
}

:host([data-theme="dark"]) .editor-empty-icon {
  color: var(--dark-text-tertiary);
}

:host([data-theme="light"]) .editor-empty-icon {
  color: var(--light-text-tertiary);
}

.editor-empty-content h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 var(--space-sm);
}

:host([data-theme="dark"]) .editor-empty-content h2 {
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .editor-empty-content h2 {
  color: var(--light-text-primary);
}

.editor-empty-content p {
  font-size: 14px;
  margin: 0;
}

:host([data-theme="dark"]) .editor-empty-content p {
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .editor-empty-content p {
  color: var(--light-text-secondary);
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  min-height: 30px;
  font-size: 14px;
  line-height: 1.2;
  flex: 0 0 auto;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

:host([data-theme="dark"]) .status-bar {
  background: rgba(20, 184, 166, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid rgba(20, 184, 166, 0.22);
  color: var(--accent-light);
}

:host([data-theme="light"]) .status-bar {
  background: rgba(20, 184, 166, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid rgba(20, 184, 166, 0.16);
  color: var(--accent-active);
}

.status-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.2;
}

.status-bar-left,
.status-bar-right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: relative;
  z-index: 1;
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 1px 6px;
  font-size: inherit;
  line-height: 1.2;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.status-item.clickable {
  cursor: pointer;
}

:host([data-theme="dark"]) .status-item.clickable:hover {
  background: rgba(20, 184, 166, 0.15);
}

:host([data-theme="light"]) .status-item.clickable:hover {
  background: rgba(13, 148, 136, 0.12);
}

/* Monaco Editor Custom Styling */
.monaco-editor .margin {
  backdrop-filter: blur(8px);
}

:host([data-theme="dark"]) .monaco-editor {
  --vscode-editor-background: #1a1a1a;
}

:host([data-theme="light"]) .monaco-editor {
  --vscode-editor-background: #fafafa;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible improvements */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* High contrast adjustments */
@media (prefers-contrast: high) {
  :host([data-theme="dark"]) .activity-bar,
  :host([data-theme="dark"]) .sidebar,
  :host([data-theme="dark"]) .editor-header {
    border-color: rgba(255, 255, 255, 0.2);
  }

  :host([data-theme="light"]) .activity-bar,
  :host([data-theme="light"]) .sidebar,
  :host([data-theme="light"]) .editor-header {
    border-color: rgba(0, 0, 0, 0.2);
  }
}
`;
