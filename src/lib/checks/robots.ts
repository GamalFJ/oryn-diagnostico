import { SIGNAL_CONFIG } from "../constants";
import type { SignalResult } from "../types";
import { fetchWithTimeout } from "../fetchWithTimeout";

function cfg(id: string) {
  const c = SIGNAL_CONFIG.find((s) => s.id === id);
  if (!c) throw new Error(`Unknown signal id: ${id}`);
  return c;
}

interface RobotsResult {
  robotsSignal: SignalResult;
  sitemapUrls: string[];
}

export async function checkRobots(url: URL): Promise<RobotsResult> {
  const c = cfg("robots");
  const robotsUrl = new URL("/robots.txt", url.origin).toString();

  try {
    const res = await fetchWithTimeout(robotsUrl, {}, 6000);
    if (!res.ok) {
      return {
        robotsSignal: { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "No encontrado" },
        sitemapUrls: [],
      };
    }
    const text = await res.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim());

    const sitemapUrls = lines
      .filter((l) => /^sitemap:/i.test(l))
      .map((l) => l.split(/:\s*/i).slice(1).join(":").trim())
      .filter(Boolean);

    let currentAgentIsWildcard = false;
    let blocksRoot = false;
    for (const line of lines) {
      if (/^user-agent:/i.test(line)) {
        currentAgentIsWildcard = line.split(":")[1]?.trim() === "*";
      } else if (currentAgentIsWildcard && /^disallow:/i.test(line)) {
        const path = line.split(":").slice(1).join(":").trim();
        if (path === "/") blocksRoot = true;
      }
    }

    return {
      robotsSignal: {
        id: c.id,
        label: c.label,
        weight: c.weight,
        source: c.source,
        status: blocksRoot ? "warn" : "pass",
        value: blocksRoot ? "Con bloqueos" : "Sin bloqueos",
      },
      sitemapUrls,
    };
  } catch {
    return {
      robotsSignal: { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "No encontrado" },
      sitemapUrls: [],
    };
  }
}

export async function checkSitemap(url: URL, sitemapUrlsFromRobots: string[]): Promise<SignalResult> {
  const c = cfg("sitemap");
  const candidates = sitemapUrlsFromRobots.length > 0
    ? sitemapUrlsFromRobots
    : [new URL("/sitemap.xml", url.origin).toString()];

  for (const candidate of candidates) {
    try {
      const res = await fetchWithTimeout(candidate, {}, 6000);
      if (res.ok) {
        return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "pass", value: "Encontrado" };
      }
    } catch {
      // try next candidate
    }
  }

  return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "No encontrado" };
}
