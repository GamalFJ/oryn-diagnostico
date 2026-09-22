import * as cheerio from "cheerio";
import { SIGNAL_CONFIG } from "../constants";
import type { SignalResult } from "../types";

function cfg(id: string) {
  const c = SIGNAL_CONFIG.find((s) => s.id === id);
  if (!c) throw new Error(`Unknown signal id: ${id}`);
  return c;
}

export interface HtmlChecksInput {
  url: URL;
  html: string;
}

export function runHtmlChecks({ url, html }: HtmlChecksInput): SignalResult[] {
  const $ = cheerio.load(html);
  const results: SignalResult[] = [];

  results.push(httpsSignal(url));
  results.push(titleSignal($));
  results.push(metaDescriptionSignal($));
  results.push(headingSignal($));
  results.push(altTextSignal($));
  results.push(internalLinksSignal($, url));
  results.push(schemaSignal($));
  results.push(canonicalSignal($, url));

  return results;
}

function httpsSignal(url: URL): SignalResult {
  const c = cfg("https");
  const isHttps = url.protocol === "https:";
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status: isHttps ? "pass" : "fail",
    value: isHttps ? "Activo" : "Solo HTTP",
  };
}

function titleSignal($: cheerio.CheerioAPI): SignalResult {
  const c = cfg("title_tag");
  const title = $("head > title").first().text().trim();
  const len = title.length;
  if (!title) {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "Ausente" };
  }
  const inRange = len >= 30 && len <= 60;
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status: inRange ? "pass" : "warn",
    value: `${len} caracteres`,
    detail: inRange ? undefined : `«${title.slice(0, 60)}»`,
  };
}

function metaDescriptionSignal($: cheerio.CheerioAPI): SignalResult {
  const c = cfg("meta_description");
  const content = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const len = content.length;
  if (!content) {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "Ausente" };
  }
  const inRange = len >= 120 && len <= 158;
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status: inRange ? "pass" : "warn",
    value: `${len} caracteres`,
  };
}

function headingSignal($: cheerio.CheerioAPI): SignalResult {
  const c = cfg("heading_structure");
  const h1Count = $("h1").length;

  const levels = $("h1, h2, h3, h4, h5, h6")
    .map((_, el) => Number(el.tagName.slice(1)))
    .get();

  let skipped = false;
  let prev = 0;
  for (const level of levels) {
    if (prev > 0 && level > prev + 1) skipped = true;
    prev = level;
  }

  if (h1Count === 1 && !skipped) {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "pass", value: "1 H1, sin saltos" };
  }

  const value = h1Count === 0 ? "Sin H1" : h1Count > 1 ? `${h1Count} etiquetas H1` : "Niveles salteados";
  return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value };
}

function altTextSignal($: cheerio.CheerioAPI): SignalResult {
  const c = cfg("alt_text");
  const images = $("img");
  const total = images.length;
  if (total === 0) {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "pass", value: "Sin imágenes" };
  }
  let withAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt && alt.trim().length > 0) withAlt += 1;
  });
  const coverage = withAlt / total;
  const status = coverage === 1 ? "pass" : coverage >= 0.5 ? "warn" : "fail";
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status,
    value: `${withAlt} de ${total}`,
    detail: coverage < 1 ? "sin atributo alt" : undefined,
  };
}

function internalLinksSignal($: cheerio.CheerioAPI, url: URL): SignalResult {
  const c = cfg("internal_links");
  const links = $("a[href]");
  const internal = new Set<string>();
  links.each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const resolved = new URL(href, url.origin);
      if (resolved.hostname === url.hostname) internal.add(resolved.pathname + resolved.search);
    } catch {
      // ignore unparsable hrefs (mailto:, tel:, javascript:, etc.)
    }
  });
  const count = internal.size;
  const status = count >= 5 ? "pass" : count >= 1 ? "warn" : "fail";
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status,
    value: `${count} enlaces`,
  };
}

function schemaSignal($: cheerio.CheerioAPI): SignalResult {
  const c = cfg("schema");
  const ldJson = $('script[type="application/ld+json"]');
  const microdata = $("[itemscope]");
  const found = ldJson.length > 0 || microdata.length > 0;
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status: found ? "pass" : "fail",
    value: found ? "Presente" : "No encontrado",
  };
}

function canonicalSignal($: cheerio.CheerioAPI, url: URL): SignalResult {
  const c = cfg("canonical");
  const href = $('link[rel="canonical"]').attr("href");
  if (!href) {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "Ausente" };
  }
  let selfReferencing = false;
  try {
    const resolved = new URL(href, url.origin);
    selfReferencing = resolved.hostname === url.hostname;
  } catch {
    selfReferencing = false;
  }
  return {
    id: c.id,
    label: c.label,
    weight: c.weight,
    source: c.source,
    status: selfReferencing ? "pass" : "fail",
    value: selfReferencing ? "Presente" : "No coincide con el dominio",
  };
}
