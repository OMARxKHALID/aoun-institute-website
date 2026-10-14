export const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (header, rows) => [header.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
