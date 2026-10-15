import { expect, test } from "bun:test";
import { countryCode, countryName } from "@/lib/countries";

test("maps country names, aliases and codes to ISO codes", () => {
  expect(countryCode("Pakistan")).toBe("PK");
  expect(countryCode(" united kingdom ")).toBe("GB");
  expect(countryCode("UK")).toBe("GB");
  expect(countryCode("France")).toBe("FR");
  expect(countryCode("italy")).toBe("IT");
  expect(countryCode("USA")).toBe("US");
  expect(countryCode("de")).toBe("DE");
  expect(countryCode("Atlantis")).toBe(null);
  expect(countryCode("")).toBe(null);
  expect(countryName("AE")).toBe("United Arab Emirates");
});
