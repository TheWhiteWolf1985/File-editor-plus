import type { Snippet } from "../../types/api";
import { apiCreateSnippet, apiDeleteSnippet, apiGetSnippets, apiUpdateSnippet } from "../../services/api";

export async function loadSnippets(this: any) {
  try {
    const res = await apiGetSnippets(this.apiBase);
    if (!res.ok) throw new Error(`snippets ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data?.items) ? (data.items as Snippet[]) : [];
    this.snippets = items.length > 0 ? items : this.snippetMocks;
  } catch (e) {
    this.snippets = this.snippetMocks;
    this.showToast("Snippet offline (mock)", "error");
  }
}

export function openSnippetModal(this: any, existing?: Snippet) {
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
      const res = await apiUpdateSnippet(this.apiBase, this.snippetEditingId, payload);
      if (!res.ok) throw new Error(`update snippet ${res.status}`);
      const data = await res.json();
      const item = data?.item as Snippet | undefined;
      if (item && item.id) {
        this.snippets = this.snippets.map((s: Snippet) => (s.id === item.id ? item : s));
      }
      this.showToast("Snippet aggiornato");
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

export function insertSnippet(this: any, snippet: Snippet) {
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

export async function deleteSnippet(this: any, snippet: Snippet) {
  const id = snippet.id;
  if (!id) {
    this.showToast("ID snippet mancante", "error");
    return;
  }
  try {
    const res = await apiDeleteSnippet(this.apiBase, id);
    if (!res.ok) throw new Error(`delete snippet ${res.status}`);
    this.snippets = this.snippets.filter((s: Snippet) => s.id !== id);
    this.showToast("Snippet eliminato");
  } catch (e) {
    this.showToast("Errore eliminazione snippet", "error");
  }
}
