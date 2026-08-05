import { describe, expect, it } from "vitest";
import { roleAtLeast } from "../src/access";

describe("roleAtLeast", () => {
  it("enforces the viewer < editor < admin hierarchy", () => {
    expect(roleAtLeast("viewer", "viewer")).toBe(true);
    expect(roleAtLeast("viewer", "editor")).toBe(false);
    expect(roleAtLeast("editor", "viewer")).toBe(true);
    expect(roleAtLeast("editor", "editor")).toBe(true);
    expect(roleAtLeast("editor", "admin")).toBe(false);
    expect(roleAtLeast("admin", "admin")).toBe(true);
  });
});
