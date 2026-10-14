import { describe, expect, test } from "bun:test";
import { csvCell, toCsv } from "@/lib/csv";
import { searchPattern } from "@/lib/search";
import { dayKey, formatClock, formatDuration } from "@/lib/format";

describe("csv", () => {
  test("quotes commas, quotes and new lines", () => {
    expect(csvCell('Ali, "Raza"')).toBe('"Ali, ""Raza"""');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  test("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("-1")).toBe("'-1");
  });

  test("builds header and rows", () => {
    expect(toCsv(["a", "b"], [[1, null]])).toBe("a,b\n1,");
  });
});

describe("searchPattern", () => {
  test("escapes regex characters and ignores case", () => {
    const re = searchPattern("c++ (basics)");
    expect(re.test("C++ (Basics) course")).toBe(true);
    expect(re.test("c basics")).toBe(false);
  });

  test("returns null for blank input", () => {
    expect(searchPattern("   ")).toBeNull();
  });
});

describe("format", () => {
  test("dayKey uses Pakistan time", () => {
    expect(dayKey(new Date("2026-10-14T20:30:00Z"))).toBe("2026-10-15");
    expect(dayKey(new Date("2026-10-14T18:59:00Z"))).toBe("2026-10-14");
  });

  test("formatClock and formatDuration", () => {
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(3725)).toBe("1:02:05");
    expect(formatDuration(5400)).toBe("1h 30m");
    expect(formatDuration(600)).toBe("10 min");
  });
});
