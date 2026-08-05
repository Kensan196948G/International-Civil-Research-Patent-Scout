// 検索エンジン抽象化
// - MEILISEARCH_HOST 設定時は Meilisearch を使用（未設定・失敗時は PostgreSQL trigram へフォールバック）
import type { SourceDocument } from "@icrps/contracts";
import { fetchJson } from "./connectors.js";
import type { Db } from "./db.js";
import type { WorkerEnv } from "./env.js";
import { listAllDocuments, searchDocumentsByText } from "./repositories.js";

export function meilisearchConfigured(env: WorkerEnv): boolean {
  return !!env.MEILISEARCH_HOST;
}

function meiliHeaders(env: WorkerEnv): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.MEILISEARCH_API_KEY) headers.Authorization = `Bearer ${env.MEILISEARCH_API_KEY}`;
  return headers;
}

function toMeiliDoc(document: SourceDocument): Record<string, unknown> {
  return { ...document };
}

export function mapMeilisearchHits(data: unknown): SourceDocument[] {
  const hits = Array.isArray((data as { hits?: unknown })?.hits)
    ? (data as { hits: Array<Record<string, unknown>> }).hits
    : [];
  return hits.map((h) => ({
    id: String(h.id ?? ""),
    sourceType: String(h.sourceType ?? "web") as SourceDocument["sourceType"],
    title: String(h.title ?? ""),
    originalTitle: h.originalTitle == null ? null : String(h.originalTitle),
    abstract: h.abstract == null ? null : String(h.abstract),
    bodyText: h.bodyText == null ? null : String(h.bodyText),
    url: h.url == null ? null : String(h.url),
    doi: h.doi == null ? null : String(h.doi),
    patentNumber: h.patentNumber == null ? null : String(h.patentNumber),
    publicationNumber: h.publicationNumber == null ? null : String(h.publicationNumber),
    patentStatus: h.patentStatus == null ? null : String(h.patentStatus),
    classifications: Array.isArray(h.classifications) ? h.classifications.map(String) : null,
    authors: Array.isArray(h.authors) ? h.authors.map(String) : null,
    inventors: Array.isArray(h.inventors) ? h.inventors.map(String) : null,
    applicants: Array.isArray(h.applicants) ? h.applicants.map(String) : null,
    country: h.country == null ? null : String(h.country),
    publicationDate: h.publicationDate == null ? null : String(h.publicationDate),
    sourceName: h.sourceName == null ? null : String(h.sourceName),
    licenseNote: h.licenseNote == null ? null : String(h.licenseNote),
    contentHash: h.contentHash == null ? null : String(h.contentHash),
    createdAt: String(h.createdAt ?? ""),
    updatedAt: String(h.updatedAt ?? "")
  }));
}

export async function searchMeilisearch(env: WorkerEnv, query: string, limit = 20): Promise<SourceDocument[]> {
  const base = env.MEILISEARCH_HOST!.replace(/\/+$/, "");
  const data = await fetchJson(
    `${base}/indexes/source_documents/search`,
    env,
    meiliHeaders(env),
    1,
    { method: "POST", body: JSON.stringify({ q: query, limit }) }
  );
  return mapMeilisearchHits(data);
}

export async function reindexMeilisearch(db: Db, env: WorkerEnv): Promise<{ indexed: number; batches: number }> {
  if (!meilisearchConfigured(env)) return { indexed: 0, batches: 0 };
  const base = env.MEILISEARCH_HOST!.replace(/\/+$/, "");
  let offset = 0;
  let indexed = 0;
  let batches = 0;
  for (;;) {
    const documents = await listAllDocuments(db, offset, 1000);
    if (documents.length === 0) break;
    await fetchJson(
      `${base}/indexes/source_documents/documents`,
      env,
      meiliHeaders(env),
      1,
      { method: "POST", body: JSON.stringify(documents.map(toMeiliDoc)) }
    );
    indexed += documents.length;
    batches += 1;
    offset += documents.length;
    if (documents.length < 1000) break;
  }
  return { indexed, batches };
}

export async function searchDocuments(env: WorkerEnv, db: Db, query: string, limit = 20): Promise<SourceDocument[]> {
  if (meilisearchConfigured(env)) {
    try {
      return await searchMeilisearch(env, query, limit);
    } catch {
      // Meilisearch 障害時は trigram へフォールバック
    }
  }
  return searchDocumentsByText(db, query, limit);
}
