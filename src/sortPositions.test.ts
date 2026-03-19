import { describe, it, expect } from "vitest";
import { sortPositions } from "./sortPositions";

describe("sortPositions", () => {
  describe("When anchor is before head (forward selection)", () => {
    it("returns anchor as from and head as to on different lines", () => {
      const sel = { anchor: { line: 0, ch: 0 }, head: { line: 1, ch: 5 } };
      expect(sortPositions(sel)).toEqual({ from: { line: 0, ch: 0 }, to: { line: 1, ch: 5 } });
    });

    it("returns anchor as from and head as to on the same line", () => {
      const sel = { anchor: { line: 2, ch: 3 }, head: { line: 2, ch: 8 } };
      expect(sortPositions(sel)).toEqual({ from: { line: 2, ch: 3 }, to: { line: 2, ch: 8 } });
    });
  });

  describe("When head is before anchor (backward selection)", () => {
    it("returns head as from and anchor as to on different lines", () => {
      const sel = { anchor: { line: 1, ch: 5 }, head: { line: 0, ch: 0 } };
      expect(sortPositions(sel)).toEqual({ from: { line: 0, ch: 0 }, to: { line: 1, ch: 5 } });
    });

    it("returns head as from and anchor as to on the same line", () => {
      const sel = { anchor: { line: 2, ch: 8 }, head: { line: 2, ch: 3 } };
      expect(sortPositions(sel)).toEqual({ from: { line: 2, ch: 3 }, to: { line: 2, ch: 8 } });
    });
  });

  describe("When anchor and head are at the same position (collapsed selection)", () => {
    it("returns the same position for from and to", () => {
      const sel = { anchor: { line: 1, ch: 4 }, head: { line: 1, ch: 4 } };
      expect(sortPositions(sel)).toEqual({ from: { line: 1, ch: 4 }, to: { line: 1, ch: 4 } });
    });
  });
});
