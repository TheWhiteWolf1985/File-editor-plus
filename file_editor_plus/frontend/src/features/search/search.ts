import { html, nothing } from "lit";
import type { SearchMatch, SearchResult } from "../../types/api";
import { apiSearch, apiSearchReplaceApply, apiSearchReplacePreview } from "../../services/api";

export async function performSearch(this: any) {
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
    const res = await apiSearch(this.apiBase, payload);
    const data = await res.json();
    if (!res.ok || data?.ok !== true) {
      throw new Error(data?.detail || `search ${res.status}`);
    }
    this.searchResults = Array.isArray(data.results) ? (data.results as SearchResult[]) : [];
    this.searchSummary = data.summary ?? null;
    this.searchTruncated = !!data.truncated;
  } catch (e) {
    this.showToast("Errore ricerca", "error");
  } finally {
    this.searchLoading = false;
  }
}

export async function replaceAll(this: any) {
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
    const files = this.searchResults.map((r: SearchResult) => ({ path: r.path, mtime: r.mtime }));
    const payload = {
      query,
      replace: this.searchReplace,
      case_sensitive: this.searchCaseSensitive,
      scope: "files",
      files,
    };
    const previewRes = await apiSearchReplacePreview(this.apiBase, payload);
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

    const applyRes = await apiSearchReplaceApply(this.apiBase, payload);
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

export function openSearchMatch(this: any, res: SearchResult, match: SearchMatch) {
  this.pendingJump = { path: res.path, line: match.line, col: match.column };
  this.openFile(res.path);
}

export function renderSearchResults(this: any) {
  if (this.searchLoading && this.searchResults.length === 0) {
    return html`<div class="searchStatus">Ricerca in corso...</div>`;
  }
  if (this.searchResults.length === 0) {
    return html`<div class="searchStatus muted">Nessun risultato</div>`;
  }
  return html`<div class="searchResults">
    ${this.searchResults.map(
      (r: SearchResult) => html`<div class="searchFile">
        <div class="searchFileHeader">
          <div class="path">${r.path}</div>
          <div class="hits">${r.matches_count} hit</div>
        </div>
        <div class="searchMatches">
          ${r.matches.map(
            (m: SearchMatch) => html`<div class="searchMatch" @click=${() => this.openSearchMatch(r, m)}>
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
