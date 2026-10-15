const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const ALIASES = {
  uk: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "great britain": "GB",
  britain: "GB",
  usa: "US",
  us: "US",
  america: "US",
  "united states of america": "US",
  uae: "AE",
  "south korea": "KR",
  korea: "KR",
  russia: "RU",
  turkey: "TR",
  "czech republic": "CZ",
  holland: "NL",
  ksa: "SA",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const byName = new Map(
  [...LETTERS]
    .flatMap((a) => [...LETTERS].map((b) => a + b))
    .map((code) => [regionNames.of(code)?.toLowerCase(), code])
    .filter(([name, code]) => name && name !== code.toLowerCase() && Intl.getCanonicalLocales(`und-${code}`)[0] === `und-${code}`)
    .reverse(),
);

const codes = new Set(byName.values());

export const countryCode = (value) => {
  const key = value?.trim().toLowerCase();
  if (!key) return null;
  if (ALIASES[key]) return ALIASES[key];
  if (byName.has(key)) return byName.get(key);
  const upper = key.toUpperCase();
  return upper.length === 2 && codes.has(upper) ? upper : null;
};

export const countryName = (code) => regionNames.of(code);

export const flagUrl = (code) => `https://flagcdn.com/${code.toLowerCase()}.svg`;
