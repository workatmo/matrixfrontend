export function truncateForMeta(value: string, maxChars: number): string {
  const s = String(value ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  if (maxChars <= 1) return s.slice(0, maxChars);
  return `${s.slice(0, maxChars - 1).trimEnd()}…`;
}

