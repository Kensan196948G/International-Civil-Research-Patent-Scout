// 引用・被引用ネットワーク（Crossref / OpenAlex）
import type { SourceDocument } from "@icrps/contracts";
import { fetchJson } from "./connectors.js";
import type { WorkerEnv } from "./env.js";

export interface CitationReference {
  doi: string;
  title?: string;
}

export interface CitedByItem {
  doi?: string;
  title?: string;
  openalexId?: string;
}

export interface CitationInfo {
  doi: string | null;
  citedByCount: number | null;
  referenceCount: number | null;
  references: CitationReference[];
  citedBy: CitedByItem[];
  fetchedAt: string;
}

export function mapCrossrefWork(data: unknown): {
  citedByCount: number | null;
  referenceCount: number | null;
  references: CitationReference[];
} {
  const message = (data as { message?: Record<string, unknown> })?.message;
  const citedByCount =
    typeof message?.["is-referenced-by-count"] === "number" ? Number(message["is-referenced-by-count"]) : null;
  const refs = Array.isArray(message?.reference) ? (message.reference as Array<Record<string, unknown>>) : [];
  const references: CitationReference[] = [];
  for (const rec of refs.slice(0, 20)) {
    const doi = typeof rec.DOI === "string" ? rec.DOI : undefined;
    if (!doi) continue;
    references.push({
      doi,
      title: typeof rec["article-title"] === "string" ? rec["article-title"] : undefined
    });
  }
  return { citedByCount, referenceCount: refs.length, references };
}

export function mapOpenAlexWork(data: unknown): { openalexId?: string; citedByCount: number | null } {
  const rec = data as Record<string, unknown>;
  return {
    openalexId: typeof rec.id === "string" ? rec.id : undefined,
    citedByCount: typeof rec.cited_by_count === "number" ? Number(rec.cited_by_count) : null
  };
}

export function mapOpenAlexWorks(data: unknown): CitedByItem[] {
  const results = Array.isArray((data as { results?: unknown })?.results)
    ? (data as { results: Array<Record<string, unknown>> }).results
    : [];
  return results.slice(0, 20).map((rec) => ({
    doi: typeof rec.doi === "string" ? rec.doi.replace(/^https:\/\/doi\.org\//, "") : undefined,
    title: typeof rec.title === "string" ? rec.title : undefined,
    openalexId: typeof rec.id === "string" ? rec.id : undefined
  }));
}

export async function getCitationInfo(document: SourceDocument, env: WorkerEnv): Promise<CitationInfo> {
  const doi = document.doi;
  const empty: CitationInfo = {
    doi,
    citedByCount: null,
    referenceCount: null,
    references: [],
    citedBy: [],
    fetchedAt: new Date().toISOString()
  };
  if (!doi) return empty;
  const crossrefBase = env.CROSSREF_API_URL.replace(/\/+$/, "");
  const openalexBase = env.OPENALEX_API_URL.replace(/\/+$/, "");
  try {
    const [crossrefData, openalexData] = await Promise.allSettled([
      fetchJson(`${crossrefBase}/works/${encodeURIComponent(doi)}`, env, {
        "User-Agent": "CivilResearchPatentScout/0.1 (mailto:research@example.local)"
      }),
      fetchJson(`${openalexBase}/works/doi:${encodeURIComponent(doi)}`, env)
    ]);
    const crossref = crossrefData.status === "fulfilled" ? mapCrossrefWork(crossrefData.value) : null;
    const openalex = openalexData.status === "fulfilled" ? mapOpenAlexWork(openalexData.value) : null;
    let citedBy: CitedByItem[] = [];
    if (openalex?.openalexId) {
      const citedData = await fetchJson(
        `${openalexBase}/works?filter=cites:${encodeURIComponent(openalex.openalexId)}&per-page=20&select=id,doi,title,publication_date`,
        env
      ).catch(() => null);
      if (citedData) citedBy = mapOpenAlexWorks(citedData);
    }
    return {
      doi,
      citedByCount: openalex?.citedByCount ?? crossref?.citedByCount ?? null,
      referenceCount: crossref?.referenceCount ?? null,
      references: crossref?.references ?? [],
      citedBy,
      fetchedAt: new Date().toISOString()
    };
  } catch {
    return empty;
  }
}
