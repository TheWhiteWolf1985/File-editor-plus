# UI backup modal snapshot

## Handlers (app-root.ts)
```ts
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
    this.gdriveOauthInfo = null;
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
      this.gdriveOauthInfo = {
        redirect_uri: typeof payload?.redirect_uri === "string" ? payload.redirect_uri : undefined,
        mode: typeof payload?.mode === "string" ? payload.mode : undefined,
      };
      const popup = window.open(String(payload.auth_url), "gdrive_oauth", "width=520,height=720");
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
```

## Render blocks (Backup card + modal)
```ts
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
                  const oauthInfo = this.gdriveOauthInfo || {};
                  const redirectUri = String(oauthInfo.redirect_uri || "");
                  const redirectMode = String(oauthInfo.mode || "");
                  const ingressDetected = window.location.pathname.includes("/api/hassio_ingress/");
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

                      ${redirectUri
                        ? html`<div style="border:1px solid var(--border-color); border-radius:10px; padding:10px; background:var(--panel-bg); display:grid; gap:8px;">
                            <div style="font-weight:600;">Redirect URI da registrare</div>
                            <div style="font-family:monospace; word-break:break-all;">${redirectUri}</div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                              <button
                                class="btn"
                                @click=${async () => {
                                  try {
                                    await navigator.clipboard.writeText(redirectUri);
                                    this.showToast("Redirect URI copiata");
                                  } catch {
                                    this.showToast("Copia non disponibile", "error");
                                  }
                                }}
                              >
                                Copia redirect URI
                              </button>
                              ${redirectMode ? html`<span style="color:var(--muted-color); font-size:var(--font-size-sm);">Mode: ${redirectMode}</span>` : nothing}
                            </div>
                            ${redirectMode === "ingress_port" || ingressDetected
                              ? html`<div style="font-size:var(--font-size-sm); color:var(--warning-color, #f59e0b);">
                                  Stai usando Ingress: registra una redirect URI esterna/stabile (public_base_url o host:porta callback).
                                </div>`
                              : nothing}
                          </div>`
                        : nothing}

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
```
