import type { Snippet } from "../../types/api";
import { apiCreateSnippet, apiDeleteSnippet, apiGetSnippets, apiUpdateSnippet } from "../../services/api";
import { t } from "../../i18n";

export async function loadSnippets(this: any) {
  try {
    const res = await apiGetSnippets(this.apiBase);
    if (!res.ok) throw new Error(`snippets ${res.status}`);
    const data = await res.json();
    const rawItems = Array.isArray(data?.items) ? data.items : [];
    const items: Snippet[] = rawItems
      .filter((item: any) => item && typeof item === "object")
      .map((item: any) => ({
        id: String(item.id ?? `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`),
        name: String(item.name ?? ""),
        description: String(item.description ?? ""),
        content: String(item.content ?? ""),
      }))
      .filter((item: Snippet) => item.name.length > 0 || item.description.length > 0 || item.content.length > 0);
    this.snippets = items.length > 0 ? items : this.snippetMocks;
  } catch (e) {
    this.snippets = this.snippetMocks;
    this.showToast(t("snippets.toast.offline_mock"), "error");
  }
}

export function openSnippetModal(this: any, existing?: Snippet) {
  this.showSnippetModal = true;
  if (existing) {
    this.snippetEditingId = existing.id;
    this.snippetName = String(existing.name ?? "");
    this.snippetDescription = String(existing.description ?? "");
    this.snippetContent = String(existing.content ?? "");
  } else {
    this.snippetEditingId = null;
    this.snippetName = "";
    this.snippetDescription = "";
    this.snippetContent = "";
  }
}

export function closeSnippetModal(this: any) {
  if (this.snippetSaving) return;
  this.showSnippetModal = false;
  this.snippetEditingId = null;
}

export async function saveSnippet(this: any) {
  if (this.snippetSaving) return;
  const name = this.snippetName.trim();
  const description = this.snippetDescription.trim();
  const content = this.snippetContent;
  if (!name || !description || !content) {
    this.showToast(t("snippets.validation.fill_all"), "error");
    return;
  }
  if (name.length > 100) {
    this.showToast(t("snippets.validation.title_too_long"), "error");
    return;
  }
  if (description.length > 250) {
    this.showToast(t("snippets.validation.description_too_long"), "error");
    return;
  }
  this.snippetSaving = true;
  try {
    const payload = { name, description, content };
    if (this.snippetEditingId) {
      const res = await apiUpdateSnippet(this.apiBase, this.snippetEditingId, payload);
      if (!res.ok) throw new Error(`update snippet ${res.status}`);
      const data = await res.json();
      const item = data?.item as Snippet | undefined;
      if (item && item.id) {
        this.snippets = this.snippets.map((s: Snippet) => (s.id === item.id ? item : s));
      }
      this.showToast(t("snippets.toast.updated"));
    } else {
      const res = await apiCreateSnippet(this.apiBase, payload);
      if (!res.ok) throw new Error(`save snippet ${res.status}`);
      const data = await res.json();
      const item = data?.item as Snippet | undefined;
      if (item && item.id) {
        this.snippets = [...this.snippets, item];
      } else {
        this.snippets = [...this.snippets, { id: `tmp-${Date.now()}`, name, description, content }];
      }
      this.showToast(t("snippets.toast.saved"));
    }
    this.showSnippetModal = false;
    this.snippetEditingId = null;
  } catch (e) {
    this.showToast(t("snippets.toast.save_error"), "error");
  } finally {
    this.snippetSaving = false;
  }
}

export function insertSnippet(this: any, snippet: Snippet) {
  if (!this.editorRef || !this.activePath) {
    this.showToast(t("errors.entities.open_file_first"), "error");
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
  this.showToast(t("snippets.toast.inserted", { name: snippet.name }));
}

export async function deleteSnippet(this: any, snippet: Snippet) {
  const id = snippet.id;
  if (!id) {
    this.showToast(t("snippets.error.missing_id"), "error");
    return;
  }
  try {
    const res = await apiDeleteSnippet(this.apiBase, id);
    if (!res.ok) throw new Error(`delete snippet ${res.status}`);
    this.snippets = this.snippets.filter((s: Snippet) => s.id !== id);
    this.showToast(t("snippets.toast.deleted"));
  } catch (e) {
    this.showToast(t("snippets.toast.delete_error"), "error");
  }
}
