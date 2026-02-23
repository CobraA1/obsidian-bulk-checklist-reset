import { describe, it, expect } from "vitest";
import {
  isIncluded,
  matchesRule,
  normalizeVaultPath,
  parseRules,
} from "./bulkPathRules";

describe("bulkPathRules", () => {
  describe("parseRules", () => {
    it("parses multiline rules and ignores empty lines", () => {
      expect(parseRules("Projects/Work\n\nDaily/2026-02-23.md\n  ")).toEqual([
        "Projects/Work",
        "Daily/2026-02-23.md",
      ]);
    });
  });

  describe("normalizeVaultPath", () => {
    it("normalizes Windows separators and leading path prefixes", () => {
      expect(normalizeVaultPath(".\\Projects\\Work\\")).toBe("Projects/Work");
      expect(normalizeVaultPath("/Daily/2026-02-23.md")).toBe(
        "Daily/2026-02-23.md"
      );
    });
  });

  describe("matchesRule", () => {
    it("matches exact file rules", () => {
      expect(
        matchesRule("Projects/Work/today.md", "Projects/Work/today.md")
      ).toBe(true);
    });

    it("matches folder rules as a prefix", () => {
      expect(matchesRule("Projects/Work/today.md", "Projects/Work")).toBe(
        true
      );
    });

    it("does not match similar prefix names", () => {
      expect(matchesRule("Projects/Worklog/today.md", "Projects/Work")).toBe(
        false
      );
    });
  });

  describe("isIncluded", () => {
    it("requires at least one include", () => {
      expect(isIncluded("Projects/Work/today.md", [], [])).toBe(false);
    });

    it("includes files that match include rules", () => {
      expect(
        isIncluded(
          "Projects/Work/today.md",
          ["Projects/Work", "Daily/2026-02-23.md"],
          []
        )
      ).toBe(true);
    });

    it("applies exclusion precedence over inclusion", () => {
      expect(
        isIncluded(
          "Projects/Work/Archive/today.md",
          ["Projects/Work"],
          ["Projects/Work/Archive"]
        )
      ).toBe(false);
    });
  });
});
