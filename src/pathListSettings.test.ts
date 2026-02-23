import { describe, it, expect } from "vitest";
import { addPathRule, hasPathRule, removePathRule } from "./pathListSettings";

describe("pathListSettings", () => {
  it("adds a normalized path rule", () => {
    expect(addPathRule("", ".\\Projects\\Work\\")).toBe("Projects/Work");
  });

  it("does not add duplicates", () => {
    expect(addPathRule("Projects/Work", "Projects/Work")).toBe("Projects/Work");
  });

  it("checks membership using normalized paths", () => {
    expect(hasPathRule("Projects/Work\nDaily/2026-02-23.md", "/Projects/Work/")).toBe(true);
  });

  it("removes a specific rule", () => {
    expect(removePathRule("Projects/Work\nDaily/2026-02-23.md", "Projects/Work")).toBe(
      "Daily/2026-02-23.md"
    );
  });
});
