export function normalizeUrl(input: string): { url: URL; original: string } {
  let trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  const url = new URL(trimmed);
  return { url, original: input.trim() };
}

export function businessNameFromDomain(hostname: string): string {
  const withoutWww = hostname.replace(/^www\./, "");
  const parts = withoutWww.split(".");
  const core = parts.length > 2 ? parts.slice(0, -2).join(" ") : parts[0];
  return core
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function displayHost(url: URL): string {
  return url.hostname.replace(/^www\./, "");
}
