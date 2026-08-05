// 特許ファミリー・優先権マップ
// - Espacenet OPS の family エンドポイントで同族特許を取得（キー設定時）
// - 未設定・失敗時は保存文献から類似度の高い特許を「同族候補」として返す
import type { SourceDocument } from "@icrps/contracts";
import { fetchJson, getEspacenetToken } from "./connectors.js";
import type { Db } from "./db.js";
import type { WorkerEnv } from "./env.js";
import { listDocumentCandidates } from "./repositories.js";
import { similarityScore } from "./scoring.js";

export interface PatentFamilyMember {
  patentNumber: string;
  country: string | null;
  kind: string | null;
  publicationDate: string | null;
  title: string | null;
  applicants: string[];
  source: "ops" | "db";
}

export interface PatentFamilyResult {
  mode: "ops" | "db" | "none";
  familyId: string | null;
  members: PatentFamilyMember[];
  note?: string;
}

function value(node: unknown): string | undefined {
  if (typeof node === "string") return node;
  if (node && typeof node === "object") {
    const v = (node as { $?: unknown }).$;
    if (typeof v === "string") return v;
  }
  return undefined;
}

function deepGet(obj: unknown, keys: string[]): unknown {
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
}

function pickTitle(member: Record<string, unknown>): string | null {
  const titles = asArray(deepGet(member, ["invention-title"]));
  const title = titles.map(value).find((v): v is string => !!v);
  if (title) return title;
  const alt = asArray(deepGet(member, ["titles", "title"]));
  return alt.map(value).find((v): v is string => !!v) ?? null;
}

export function mapOpsFamily(data: unknown): { familyId: string | null; members: PatentFamilyMember[] } {
  const family = deepGet(data, ["ops:world-patent-data", "ops:family"]) as Record<string, unknown> | undefined;
  const familyId =
    typeof family?.["@family-id"] === "string" || typeof family?.["@family-id"] === "number"
      ? String(family["@family-id"])
      : null;
  const members = asArray(family?.["ops:family-member"]).flatMap((member): PatentFamilyMember[] => {
    const rec = member as Record<string, unknown>;
    const docId = asArray(deepGet(rec, ["publication-reference", "document-id"])).find(
      (d) => (d as Record<string, unknown>)["@document-id-type"] === "docdb"
    ) as Record<string, unknown> | undefined;
    const country = value(docId?.country) ?? null;
    const docNumber = value(docId?.["doc-number"]) ?? null;
    const kind = value(docId?.kind) ?? null;
    if (!country || !docNumber) return [];
    const applicants = asArray(deepGet(rec, ["parties", "applicants", "applicant"]))
      .map((entry) => value(deepGet(entry as Record<string, unknown>, ["applicant-name", "name"])))
      .filter((v): v is string => !!v);
    return [
      {
        patentNumber: `${country}${docNumber}${kind ?? ""}`,
        country,
        kind,
        publicationDate: value(docId?.date)?.slice(0, 10) ?? null,
        title: pickTitle(rec),
        applicants,
        source: "ops" as const
      }
    ];
  });
  return { familyId, members };
}

export async function getPatentFamily(
  document: SourceDocument,
  db: Db,
  env: WorkerEnv
): Promise<PatentFamilyResult> {
  const patentNumber = document.patentNumber;
  if (!patentNumber) return { mode: "none", familyId: null, members: [] };

  if (env.ESPACENET_OPS_KEY && env.ESPACENET_OPS_SECRET && /^[A-Z]{2}\d+[A-Z0-9]*$/.test(patentNumber)) {
    try {
      const token = await getEspacenetToken(env);
      const base = env.ESPACENET_OPS_URL.replace(/\/+$/, "");
      const cc = patentNumber.slice(0, 2);
      const rest = patentNumber.slice(2);
      const m = /^(\d+)([A-Z]+)?$/.exec(rest);
      const docNumber = m?.[1] ?? rest;
      const kind = m?.[2] ?? "A";
      const data = await fetchJson(
        `${base}/rest-services/family/publication/${cc}/${docNumber}/${kind}`,
        env,
        { Authorization: `Bearer ${token}`, Accept: "application/json" }
      );
      const mapped = mapOpsFamily(data);
      if (mapped.members.length > 0) {
        return { mode: "ops", ...mapped };
      }
    } catch {
      // OPS 失敗時は DB フォールバックへ
    }
  }

  const candidates = await listDocumentCandidates(db, document.id, 300);
  const base = [
    document.title,
    document.originalTitle ?? "",
    document.abstract ?? "",
    ...(document.applicants ?? []),
    ...(document.classifications ?? [])
  ].join(" ");
  const members = candidates
    .filter((c) => c.sourceType === "patent" && c.patentNumber && c.patentNumber !== patentNumber)
    .map((c) => {
      const target = [
        c.title,
        c.originalTitle ?? "",
        c.abstract ?? "",
        ...(c.applicants ?? []),
        ...(c.classifications ?? [])
      ].join(" ");
      const { score } = similarityScore(base, target, {
        applicantsA: document.applicants ?? undefined,
        applicantsB: c.applicants ?? undefined,
        classificationsA: document.classifications ?? undefined,
        classificationsB: c.classifications ?? undefined
      });
      return { c, score };
    })
    .filter((x) => x.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(
      (x): PatentFamilyMember => ({
        patentNumber: x.c.patentNumber!,
        country: x.c.country,
        kind: null,
        publicationDate: x.c.publicationDate,
        title: x.c.title,
        applicants: x.c.applicants ?? [],
        source: "db"
      })
    );
  if (members.length > 0) {
    return {
      mode: "db",
      familyId: null,
      members,
      note: "Espacenet OPS キーが未設定のため、保存文献から類似度の高い特許を同族候補として表示しています。"
    };
  }
  return { mode: "none", familyId: null, members: [] };
}
