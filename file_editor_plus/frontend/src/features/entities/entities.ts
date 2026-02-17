import { html, nothing } from "lit";
import { HAClient, type HassState } from "../../ha-client";
import { apiMdiSearch } from "../../services/api";
import type { MdiIcon } from "../../types/api";
import type { SuggestItem } from "../../types/editor";
import { t } from "../../i18n";

export function closeSuggestions(this: any, block = false) {
  if (this.suggestOpen) {
    this.suggestOpen = false;
    this.suggestItems = [];
    this.suggestIndex = 0;
  }
  this.suggestContext = null;
  this.suggestPlacement = "above";
  this.suggestMaxHeight = 220;
  if (block) {
    this.suggestBlocked = true;
  }
}

export async function updateSuggestions(this: any) {
  if (this.suggestBlocked) return;
  if (!this.editorRef) {
    this.closeSuggestions();
    return;
  }
  const pos = this.editorRef.selectionStart ?? 0;
  const before = this.content.slice(0, pos);
  const mdiMatch = before.match(/mdi[:.]([a-zA-Z0-9_-]*)$/i);
  if (mdiMatch) {
    const query = mdiMatch[1] || "";
    const icons = await this.fetchMdiSuggestions(query);
    if (!icons.length) {
      this.closeSuggestions();
      return;
    }
    const items = icons.map((icon: MdiIcon) => ({ type: "mdi", value: icon.name, codepoint: icon.codepoint }));
    const coords = this.getSuggestCoords(before);
    if (!coords) return;
    this.openSuggestions(items, "mdi", coords.top, coords.left, coords.placement, coords.maxHeight);
    return;
  }

  const match = before.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_-]*)$/);
  if (!match) {
    this.closeSuggestions();
    return;
  }
  const domain = (match[1] || "").toLowerCase();
  const query = match[2] || "";
  const all = Object.keys(this.entities).sort();
  const items =
    domain === "state" || domain === "states"
      ? all.filter((id: string) => id.includes(query))
      : all.filter((id: string) => id.startsWith(`${domain}.`) && id.includes(query));
  if (items.length === 0) {
    this.closeSuggestions();
    return;
  }
  const suggestItems = items.map((id: string) => ({ type: "entity", value: id }));
  const coords = this.getSuggestCoords(before);
  if (!coords) return;
  this.openSuggestions(suggestItems, "entity", coords.top, coords.left, coords.placement, coords.maxHeight);
}

export function isSameSuggestItem(this: any, a: SuggestItem, b: SuggestItem) {
  if (a.type !== b.type || a.value !== b.value) return false;
  if (a.type === "mdi" && b.type === "mdi") {
    return a.codepoint === b.codepoint;
  }
  return true;
}

export function openSuggestions(
  this: any,
  items: SuggestItem[],
  context: "entity" | "mdi",
  top: number,
  left: number,
  placement: "above" | "below",
  maxHeight: number
) {
  const sameItems =
    this.suggestOpen &&
    this.suggestContext === context &&
    this.suggestItems.length === items.length &&
    this.suggestItems.every((v: SuggestItem, i: number) => this.isSameSuggestItem(v, items[i]));
  this.suggestOpen = true;
  this.suggestContext = context;
  this.suggestItems = items;
  this.suggestIndex = sameItems ? Math.min(this.suggestIndex, items.length - 1) : 0;
  this.suggestTop = top;
  this.suggestLeft = left;
  this.suggestPlacement = placement;
  this.suggestMaxHeight = maxHeight;
  requestAnimationFrame(() => this.scrollSuggestIntoView());
}

export function getSuggestCoords(this: any, before: string) {
  if (!this.editorRef) return null;
  const lines = before.split("\n");
  const line = lines.length;
  const col = lines[lines.length - 1].length;
  const lineHeight = 18; // px approx (13px font * 1.4)
  const taRect = this.editorRef.getBoundingClientRect();
  const hostRect = this.getBoundingClientRect();
  const padding = 12;
  const charWidth = 8;
  const anchorLeft = taRect.left - hostRect.left + padding + col * charWidth;
  const anchorTop =
    taRect.top - hostRect.top + padding + (line - 1) * lineHeight - (this.editorRef.scrollTop || 0) - 2;
  const margin = 8;
  const maxBoxHeight = 220;
  const spaceAbove = Math.max(0, anchorTop - margin);
  const spaceBelow = Math.max(0, hostRect.height - (anchorTop + lineHeight + margin));
  const placement = spaceBelow >= spaceAbove ? "below" : "above";
  const maxHeight = Math.min(maxBoxHeight, placement === "above" ? spaceAbove : spaceBelow);
  const minLeft = margin;
  const defaultWidth = 240;
  const maxLeft = Math.max(minLeft, hostRect.width - defaultWidth);
  const left = Math.min(Math.max(anchorLeft, minLeft), maxLeft);
  const top = placement === "above" ? anchorTop : anchorTop + lineHeight;
  return { top, left, placement, maxHeight };
}

export async function fetchMdiSuggestions(this: any, query: string): Promise<MdiIcon[]> {
  const key = query.toLowerCase();
  const cached = this.mdiSuggestCache.get(key);
  if (cached) return cached;
  const requestId = ++this.mdiSuggestRequestId;
  try {
    const res = await apiMdiSearch(this.apiBase, key, 50);
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

export function applySuggestion(this: any) {
  if (!this.editorRef || !this.suggestOpen || this.suggestItems.length === 0) return;
  const ta = this.editorRef;
  const pos = ta.selectionStart ?? 0;
  const before = this.content.slice(0, pos);
  const current = this.suggestItems[this.suggestIndex];
  if (!current) return;
  if (current.type === "mdi") {
    const match = before.match(/mdi[:.]([a-zA-Z0-9_-]*)$/i);
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
  const match = before.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_-]*)$/);
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

export function scrollSuggestIntoView(this: any) {
  if (!this.suggestOpen) return;
  const items = this.shadowRoot?.querySelectorAll(".suggestItem");
  if (!items || items.length === 0) return;
  const el = items[this.suggestIndex] as HTMLElement | undefined;
  el?.scrollIntoView({ block: "nearest" });
}

export async function initEntities(this: any) {
  try {
    this.haClient = new HAClient(this.apiBase);
    this.haClient.connect((ev: { event: { data: { entity_id: string; new_state: HassState | null } } }) => {
      const id = ev.event.data.entity_id;
      const next = { ...this.entities };
      if (ev.event.data.new_state) {
        next[id] = ev.event.data.new_state;
      } else {
        delete next[id];
      }
      this.syncCollapsedDomains(Object.keys(next).map((k: string) => k.split(".")[0]));
      this.entities = next;
    });
    const states = await this.haClient.getStates();
    const next: Record<string, HassState> = {};
    states.forEach((s: HassState) => {
      next[s.entity_id] = s;
    });
    this.syncCollapsedDomains(states.map((s: HassState) => s.entity_id.split(".")[0]));
    this.entities = next;
    this.entityError = null;
  } catch (e) {
    this.entityError = t("errors.entities.loading");
    this.showToast(t("errors.entities.loading"), "error");
  }
}

export function toggleDomain(this: any, domain: string) {
  const next = new Set(this.collapsedDomains);
  if (next.has(domain)) {
    next.delete(domain);
  } else {
    next.add(domain);
  }
  this.collapsedDomains = next;
}

export function insertEntityId(this: any, entityId: string) {
  if (!this.activePath || !this.editorRef) {
    this.showToast(t("errors.entities.open_file_first"), "error");
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

export function syncCollapsedDomains(this: any, domains: string[]) {
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
  domainSet.forEach((d: string) => {
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

export function renderEntityPane(this: any) {
  const entries = Object.values(this.entities) as HassState[];
  const filtered = entries
    .filter((e: HassState) => {
      const q = this.entityFilter.toLowerCase();
      if (!q) return true;
      return e.entity_id.toLowerCase().includes(q) || (e.attributes?.friendly_name || "").toLowerCase().includes(q);
    })
    .sort((a: HassState, b: HassState) => {
      const da = a.entity_id.split(".")[0];
      const db = b.entity_id.split(".")[0];
      if (da === db) return a.entity_id.localeCompare(b.entity_id);
      return da.localeCompare(db);
    });
  const grouped: Record<string, HassState[]> = {};
  filtered.forEach((e: HassState) => {
    const domain = e.entity_id.split(".")[0];
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push(e);
  });
  const domains = Object.keys(grouped).sort();
  return html`<div class="sidebarContent entityPane">
    <div class="entityHeader">${t("entities.title")}</div>
    <input
      class="entitySearch"
      type="text"
      .value=${this.entityFilter}
      @input=${(e: Event) => (this.entityFilter = (e.target as HTMLInputElement).value)}
      placeholder=${t("entities.search.placeholder")}
    />
    ${this.entityError
      ? html`<div class="entityError">${this.entityError}</div>`
      : html`<div class="entityList">
          ${domains.length === 0
            ? html`<div class="entityEmpty">${t("entities.empty")}</div>`
            : domains.map((domain: string) => {
                const items = grouped[domain];
                const isOpen = !this.collapsedDomains.has(domain);
                return html`<div class="entityGroup">
                  <button class="entityGroupHeader" type="button" @click=${() => this.toggleDomain(domain)}>
                    ${isOpen
                      ? html`<app-icon name="chevron-down" size="14" class="chevron" aria-hidden="true"></app-icon>`
                      : html`<app-icon name="chevron-right" size="14" class="chevron" aria-hidden="true"></app-icon>`}
                    <span class="entityGroupTitle">${domain}</span>
                    <span style="margin-left:auto; opacity:0.75; font-size:var(--font-size-sm);">${items.length}</span>
                  </button>
                  ${isOpen
                    ? html`<div class="entityGroupBody">
                        ${items.map((e: HassState) => {
                          const name = (e.attributes?.friendly_name as string) || e.entity_id;
                          return html`<div class="entityCard">
                            <div class="entityName">${name}</div>
                            <div class="entityId">${e.entity_id}</div>
                            <div class="entityMeta">${domain} • ${t("labels.state")}: ${e.state}</div>
                            <button class="entityInsert" title=${t("entities.action.insert_title")} @click=${(ev: Event) => { ev.stopPropagation(); this.insertEntityId(e.entity_id); }}>
                              <app-icon name="plus" size="14" aria-hidden="true"></app-icon><span>${t("entities.action.insert")}</span>
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
