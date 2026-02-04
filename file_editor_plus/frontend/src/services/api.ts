type JsonBody = Record<string, unknown>;

const jsonHeaders = { "Content-Type": "application/json" };

export const apiGetTree = (apiBase: string, path: string) => {
  const url = `${apiBase}api/tree${path ? `?path=${encodeURIComponent(path)}` : ""}`;
  return fetch(url);
};

export const apiGetFile = (apiBase: string, path: string) => {
  const url = `${apiBase}api/file?path=${encodeURIComponent(path)}`;
  return fetch(url);
};

export const apiSaveFile = (apiBase: string, path: string, content: string) => {
  const url = `${apiBase}api/file?path=${encodeURIComponent(path)}`;
  return fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ content }),
  });
};

export const apiCreateFile = (apiBase: string, path: string, content = "") => {
  const url = `${apiBase}api/file?path=${encodeURIComponent(path)}&create_only=1`;
  return fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ content }),
  });
};

export const apiCreateFolder = (apiBase: string, path: string) => {
  const url = `${apiBase}api/folder?path=${encodeURIComponent(path)}`;
  return fetch(url, { method: "POST" });
};

export type DiffPayload = { base_text: string; modified_text: string; mode: string };
export const apiPostDiff = (apiBase: string, payload: DiffPayload) => {
  const url = `${apiBase}api/diff`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export type TreeCopyPayload = { src: string; dest_dir: string; dest_name: string };
export const apiTreeCopy = (apiBase: string, payload: TreeCopyPayload) => {
  const url = `${apiBase}api/fs/copy`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export type TreeDeletePayload = { path: string };
export const apiTreeDelete = (apiBase: string, payload: TreeDeletePayload) => {
  const url = `${apiBase}api/fs/delete`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export const apiMdiSearch = (apiBase: string, query: string, limit = 50) => {
  const url = `${apiBase}api/mdi/search?query=${encodeURIComponent(query)}&limit=${limit}`;
  return fetch(url);
};

export const apiGetSnippets = (apiBase: string) => {
  const url = `${apiBase}api/snippets`;
  return fetch(url);
};

export type SnippetPayload = { name: string; description: string; content: string };
export const apiCreateSnippet = (apiBase: string, payload: SnippetPayload) => {
  const url = `${apiBase}api/snippets`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export const apiUpdateSnippet = (apiBase: string, id: string, payload: SnippetPayload) => {
  const url = `${apiBase}api/snippets/${encodeURIComponent(id)}`;
  return fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export const apiDeleteSnippet = (apiBase: string, id: string) => {
  const url = `${apiBase}api/snippets/${encodeURIComponent(id)}`;
  return fetch(url, { method: "DELETE" });
};

export type SearchPayload = {
  query: string;
  case_sensitive: boolean;
  max_files: number;
  max_matches_total: number;
  max_matches_per_file: number;
};
export const apiSearch = (apiBase: string, payload: SearchPayload) => {
  const url = `${apiBase}api/search`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export type SearchReplaceFile = { path: string; mtime: number };
export type SearchReplacePayload = {
  query: string;
  replace: string;
  case_sensitive: boolean;
  scope: "files";
  files: SearchReplaceFile[];
};
export const apiSearchReplacePreview = (apiBase: string, payload: SearchReplacePayload) => {
  const url = `${apiBase}api/search/replace/preview`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export const apiSearchReplaceApply = (apiBase: string, payload: SearchReplacePayload) => {
  const url = `${apiBase}api/search/replace/apply`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export type SearchReplaceOnePayload = {
  path: string;
  query: string;
  replace: string;
  case_sensitive?: boolean;
  match_index?: number;
  mtime?: number;
};

export const apiSearchReplaceOne = (apiBase: string, payload: SearchReplaceOnePayload) => {
  const url = `${apiBase}api/search/replace/one`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export const apiPostHaAction = (apiBase: string, action: string) => {
  const url = `${apiBase}api/ha/action`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ action }),
  });
};

export const apiGetBackup = (apiBase: string) => {
  const url = `${apiBase}api/backup`;
  return fetch(url);
};

export const apiFormatYaml = (apiBase: string, text: string) => {
  const url = `${apiBase}api/format/yaml`;
  return fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ text }),
  });
};

export const apiPutUserConfig = (apiBase: string, config: JsonBody) => {
  const url = `${apiBase}api/user-config`;
  return fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ config }),
  });
};

export const apiGetUserConfig = (apiBase: string) => {
  const url = `${apiBase}api/user-config`;
  return fetch(url);
};

export const apiGetSession = (apiBase: string) => {
  const url = `${apiBase}api/session`;
  return fetch(url);
};

export const apiPutSession = (
  apiBase: string,
  session: {
    tabs: Array<
      | string
      | {
          path: string;
          dirty?: boolean;
          buffer_id?: string | null;
          buffer_size?: number | null;
          last_edit_at?: number | string | null;
          lastEditAt?: number | null;
        }
    >;
    active: string | null;
    split: boolean;
  }
) => {
  const url = `${apiBase}api/session`;
  return fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(session),
  });
};

export const apiPutSessionBuffer = (apiBase: string, payload: { path: string; content: string }) => {
  const url = `${apiBase}api/session/buffer`;
  return fetch(url, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
};

export const apiGetSessionBuffer = (apiBase: string, bufferId: string) => {
  const url = `${apiBase}api/session/buffer/${encodeURIComponent(bufferId)}`;
  return fetch(url);
};

export const apiResetSession = (apiBase: string) => {
  const url = `${apiBase}api/session/reset`;
  return fetch(url, { method: "POST" });
};

export const apiGenerateDebugLog = (apiBase: string) => {
  const url = `${apiBase}api/utils/debug-log`;
  return fetch(url, { method: "POST" });
};

export const apiUpload = (apiBase: string, file: File, targetDir: string, mode: "fail" | "overwrite" | "autorename" = "fail") => {
  const url = `${apiBase}api/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("target_dir", targetDir);
  fd.append("mode", mode);
  return fetch(url, {
    method: "POST",
    body: fd,
  });
};

export const apiMovePath = (apiBase: string, src: string, dstDir: string, mode: "fail" | "overwrite" | "autorename" = "fail") => {
  const url = `${apiBase}api/fs/move`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ src, dst_dir: dstDir, mode }),
  });
};
