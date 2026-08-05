import { describe, expect, it } from "vitest";
import type { SearchConnectorResult } from "@icrps/contracts";
import type { Db } from "../src/db";
import type { WorkerEnv } from "../src/env";
import { buildWatchQueries, isWatchTopicDue, runWatchTopic, type WatchTopicRunResult } from "../src/watch-runner";

const ENV: WorkerEnv = {
  APP_ENV: "test",
  APP_URL: "http://localhost",
  DATABASE_URL: "postgres://x",
  JWT_SECRET: "test-secret",
  JWT_EXPIRES_IN: "12h",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org",
  ESPACENET_OPS_URL: "https://ops.epo.org/3.2"
};

function fakeDb(): { db: Db; docs: Map<string, Record<string, unknown>>; notifications: Array<Record<string, unknown>> } {
  const docs = new Map<string, Record<string, unknown>>();
  const notifications: Array<Record<string, unknown>> = [];
  let idSeq = 0;
  const db: Db = async (query, params = []) => {
    const q = query;
    if (q.includes("FROM source_documents WHERE doi")) {
      const doi = String(params[0] ?? "");
      const hit = [...docs.values()].find((d) => d.doi === doi);
      return hit ? [hit] : [];
    }
    if (q.includes("FROM source_documents WHERE patent_number")) {
      const n = String(params[0] ?? "");
      const hit = [...docs.values()].find((d) => d.patent_number === n);
      return hit ? [hit] : [];
    }
    if (q.includes("FROM source_documents WHERE content_hash")) {
      const h = String(params[0] ?? "");
      const hit = [...docs.values()].find((d) => d.content_hash === h);
      return hit ? [hit] : [];
    }
    if (q.includes("FROM source_documents WHERE url")) {
      const u = String(params[0] ?? "");
      const hit = [...docs.values()].find((d) => d.url === u);
      return hit ? [hit] : [];
    }
    if (q.includes("INSERT INTO source_documents")) {
      const p = params as unknown[];
      idSeq += 1;
      const row = {
        id: `doc-${idSeq}`,
        source_type: p[0],
        title: p[1],
        original_title: p[2],
        abstract: p[3],
        body_text: null,
        url: p[4],
        doi: p[5],
        patent_number: p[6],
        publication_number: p[7],
        authors: p[8],
        inventors: p[9],
        applicants: p[10],
        country: p[11],
        publication_date: p[12],
        source_name: p[13],
        license_note: p[14],
        content_hash: p[15],
        created_at: "2026-08-01T00:00:00Z",
        updated_at: "2026-08-01T00:00:00Z"
      };
      docs.set(row.id, row);
      return [row];
    }
    if (q.includes("SELECT 1 FROM notifications")) {
      const topicId = String(params[0] ?? "");
      const docId = String(params[1] ?? "");
      return notifications.some((n) => n.watch_topic_id === topicId && n.source_document_id === docId) ? [{}] : [];
    }
    if (q.includes("INSERT INTO notifications")) {
      const row = {
        id: `notif-${notifications.length + 1}`,
        user_id: params[0],
        watch_topic_id: params[1],
        source_document_id: params[2],
        kind: params[3],
        title: params[4],
        body: params[5],
        url: params[6],
        read_at: params[7],
        created_at: "2026-08-01T00:00:00Z"
      };
      notifications.push(row);
      return [row];
    }
    return [];
  };
  return { db, docs, notifications };
}

const topic = {
  id: "topic-1",
  userId: "user-1",
  projectId: null,
  displayName: "低炭素コンクリート",
  terms: "低炭素 / low-carbon / GGBS",
  keyword: "低炭素コンクリート",
  frequency: "daily",
  enabled: true,
  lastCheckedAt: "2026-08-01T00:00:00Z",
  createdAt: "2026-08-01T00:00:00Z"
};

function searchFixture(results: SearchConnectorResult[]) {
  return async () => ({ results, failures: [] });
}

describe("buildWatchQueries", () => {
  it("combines keyword and terms, dedupes and limits to 3", () => {
    const queries = buildWatchQueries({ keyword: "低炭素コンクリート", terms: "低炭素 / low-carbon / GGBS / low-carbon" });
    expect(queries).toEqual(["低炭素コンクリート", "低炭素", "low-carbon"]);
  });
});

describe("isWatchTopicDue", () => {
  it("returns true when never checked", () => {
    expect(isWatchTopicDue({ lastCheckedAt: null, frequency: "weekly" }, Date.now())).toBe(true);
  });

  it("respects daily frequency", () => {
    const now = Date.now();
    const last = new Date(now - 23 * 60 * 60 * 1000).toISOString();
    expect(isWatchTopicDue({ lastCheckedAt: last, frequency: "daily" }, now)).toBe(false);
    const older = new Date(now - 25 * 60 * 60 * 1000).toISOString();
    expect(isWatchTopicDue({ lastCheckedAt: older, frequency: "daily" }, now)).toBe(true);
  });
});

describe("runWatchTopic", () => {
  it("inserts new documents and creates unread notifications for non-baseline runs", async () => {
    const { db, docs, notifications } = fakeDb();
    const result: WatchTopicRunResult = await runWatchTopic(
      db,
      topic,
      ENV,
      searchFixture([
        {
          sourceType: "paper",
          title: "Low carbon concrete in marine environment",
          doi: "10.1000/lowcarbon",
          url: "https://doi.org/10.1000/lowcarbon",
          abstract: "Marine splash zone test data.",
          sourceName: "Crossref"
        },
        {
          sourceType: "patent",
          title: "GGBS concrete composition",
          patentNumber: "JP2026-000001A",
          url: "https://patents.google.com/patent/JP2026-000001A/ja",
          sourceName: "Google Patents"
        }
      ])
    );
    expect(result.inserted).toBe(2);
    expect(result.notified).toBe(2);
    expect(docs.size).toBe(2);
    expect(notifications).toHaveLength(2);
    expect(notifications.every((n) => n.kind === "watch" && n.read_at === null)).toBe(true);
  });

  it("does not re-notify already-known documents", async () => {
    const { db, notifications } = fakeDb();
    const fixture = searchFixture([
      {
        sourceType: "paper",
        title: "Low carbon concrete in marine environment",
        doi: "10.1000/lowcarbon",
        url: "https://doi.org/10.1000/lowcarbon",
        abstract: "Marine splash zone test data.",
        sourceName: "Crossref"
      }
    ]);
    const first = await runWatchTopic(db, topic, ENV, fixture);
    const second = await runWatchTopic(db, topic, ENV, fixture);
    expect(first.notified).toBe(1);
    expect(second.notified).toBe(0);
    expect(notifications).toHaveLength(1);
  });

  it("records baseline matches as read notifications on first run", async () => {
    const { db, notifications } = fakeDb();
    const result = await runWatchTopic(
      db,
      { ...topic, lastCheckedAt: null },
      ENV,
      searchFixture([
        {
          sourceType: "web",
          title: "既存の関連記事",
          url: "https://example.com/existing",
          sourceName: "DuckDuckGo"
        }
      ])
    );
    expect(result.notified).toBe(0);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.kind).toBe("baseline");
    expect(notifications[0]?.read_at).not.toBeNull();
  });
});
