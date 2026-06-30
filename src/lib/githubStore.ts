const GITHUB_API = "https://api.github.com";

export class GithubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function getConfig(): GithubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!token || !owner || !repo) {
    throw new Error("Faltan variables de entorno: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME");
  }
  return { token, owner, repo, branch: process.env.GITHUB_DATA_BRANCH || "data" };
}

async function githubFetch(path: string, init?: RequestInit) {
  const { token } = getConfig();
  return fetch(`${GITHUB_API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
}

export interface ArchivoLeido {
  content: string;
  sha: string;
}

/** Lee un archivo del repo en la rama de datos. Devuelve `null` si no existe (404). */
export async function leerArchivo(path: string): Promise<ArchivoLeido | null> {
  const { owner, repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GithubApiError(`Error leyendo ${path}: ${await res.text()}`, res.status);
  }
  const json = await res.json();
  return { content: Buffer.from(json.content, "base64").toString("utf-8"), sha: json.sha };
}

/** Elimina un archivo (commit) en la rama de datos. Requiere el `sha` actual del archivo. */
export async function eliminarArchivo(path: string, sha: string, message: string): Promise<void> {
  const { owner, repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch, sha }),
  });
  if (!res.ok) {
    throw new GithubApiError(`Error eliminando ${path}: ${await res.text()}`, res.status);
  }
}

/** Crea o actualiza un archivo (commit) en la rama de datos. Pasar `sha` para actualizar uno existente. */
export async function escribirArchivo(
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const { owner, repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      branch,
      content: Buffer.from(content, "utf-8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new GithubApiError(`Error escribiendo ${path}: ${await res.text()}`, res.status);
  }
}
