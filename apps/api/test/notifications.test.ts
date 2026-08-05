import { describe, expect, it } from "vitest";
import type { Db } from "../src/db";
import {
  createNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount
} from "../src/repositories";

function fakeDb(store: { notifications: Array<Record<string, unknown>>; seq: { n: number } }): Db {
  return async (query, params = []) => {
    if (query.includes("INSERT INTO notifications")) {
      store.seq.n += 1;
      const row = {
        id: `n-${store.seq.n}`,
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
      store.notifications.push(row);
      return [row];
    }
    if (query.includes("SELECT count(") && query.includes("WHERE user_id = $1 AND read_at IS NULL")) {
      return [{ c: store.notifications.filter((n) => n.user_id === params[0] && n.read_at === null).length }];
    }
    if (query.includes("UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2")) {
      const hit = store.notifications.find((n) => n.id === params[0] && n.user_id === params[1]);
      if (hit) {
        hit.read_at = "2026-08-02T00:00:00Z";
        return [hit];
      }
      return [];
    }
    if (query.includes("UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL")) {
      const hits = store.notifications.filter((n) => n.user_id === params[0] && n.read_at === null);
      hits.forEach((n) => {
        n.read_at = "2026-08-02T00:00:00Z";
      });
      return hits;
    }
    if (query.includes("ORDER BY created_at DESC LIMIT $2")) {
      return store.notifications
        .filter((n) => n.user_id === params[0])
        .sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }
    return [];
  };
}

describe("notifications repository", () => {
  it("counts, lists, and marks notifications as read", async () => {
    const store = { notifications: [] as Array<Record<string, unknown>>, seq: { n: 0 } };
    const db = fakeDb(store);
    await createNotification(db, { userId: "u1", watchTopicId: "w1", title: "新着1" });
    await createNotification(db, { userId: "u1", watchTopicId: "w1", title: "新着2" });
    expect(await unreadNotificationCount(db, "u1")).toBe(2);
    expect((await listNotifications(db, "u1")).map((n) => n.title)).toEqual(["新着2", "新着1"]);
    expect(await markNotificationRead(db, "u1", "n-1")).toBe(true);
    expect(await unreadNotificationCount(db, "u1")).toBe(1);
    expect(await markAllNotificationsRead(db, "u1")).toBe(1);
    expect(await unreadNotificationCount(db, "u1")).toBe(0);
  });
});
