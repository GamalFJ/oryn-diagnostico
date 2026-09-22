import { SIGNAL_CONFIG } from "../constants";
import type { SignalResult, SignalStatus } from "../types";
import { fetchWithTimeout } from "../fetchWithTimeout";

function cfg(id: string) {
  const c = SIGNAL_CONFIG.find((s) => s.id === id);
  if (!c) throw new Error(`Unknown signal id: ${id}`);
  return c;
}

interface PsiAudit {
  score: number | null;
  numericValue?: number;
  displayValue?: string;
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: { performance?: { score: number | null } };
    audits?: Record<string, PsiAudit>;
  };
}

interface PsiRunResult {
  performanceScore: number | null;
  viewportOk: boolean;
  loadSeconds: number | null;
}

async function runPageSpeed(url: URL, strategy: "mobile" | "desktop"): Promise<PsiRunResult | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) return null;

  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url.toString());
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.append("category", "seo");

  try {
    const res = await fetchWithTimeout(endpoint.toString(), {}, 25000);
    if (!res.ok) return null;
    const data = (await res.json()) as PsiResponse;

    const performanceScore = data.lighthouseResult?.categories?.performance?.score;
    const viewportAudit = data.lighthouseResult?.audits?.["viewport"];
    const speedIndex = data.lighthouseResult?.audits?.["speed-index"];

    return {
      performanceScore: performanceScore != null ? Math.round(performanceScore * 100) : null,
      viewportOk: viewportAudit?.score === 1,
      loadSeconds: speedIndex?.numericValue != null ? speedIndex.numericValue / 1000 : null,
    };
  } catch {
    return null;
  }
}

function scoreStatus(score: number): SignalStatus {
  // Matches PSI's own color bands (green/orange/red at 90/50) so this never
  // disagrees with what the client sees on Google's own report.
  if (score >= 90) return "pass";
  if (score >= 50) return "warn";
  return "fail";
}

export async function checkMobile(url: URL): Promise<{ mobileFriendly: SignalResult; mobileSpeed: SignalResult }> {
  const fCfg = cfg("mobile_friendly");
  const sCfg = cfg("mobile_speed");
  const result = await runPageSpeed(url, "mobile");

  if (!result || result.performanceScore == null) {
    return {
      mobileFriendly: { id: fCfg.id, label: fCfg.label, weight: fCfg.weight, source: fCfg.source, status: "fail", value: "Sin datos" },
      mobileSpeed: { id: sCfg.id, label: sCfg.label, weight: sCfg.weight, source: sCfg.source, status: "fail", value: "Sin datos" },
    };
  }

  return {
    mobileFriendly: {
      id: fCfg.id,
      label: fCfg.label,
      weight: fCfg.weight,
      source: fCfg.source,
      status: result.viewportOk ? "pass" : "fail",
      value: result.viewportOk ? "Aprobado" : "Necesita ajustes",
    },
    mobileSpeed: {
      id: sCfg.id,
      label: sCfg.label,
      weight: sCfg.weight,
      source: sCfg.source,
      status: scoreStatus(result.performanceScore),
      value: `${result.performanceScore}/100`,
      detail: result.loadSeconds != null ? `Carga en ${result.loadSeconds.toFixed(1)}s` : undefined,
    },
  };
}

export async function checkDesktop(url: URL): Promise<SignalResult> {
  const dCfg = cfg("desktop_speed");
  const result = await runPageSpeed(url, "desktop");

  if (!result || result.performanceScore == null) {
    return { id: dCfg.id, label: dCfg.label, weight: dCfg.weight, source: dCfg.source, status: "fail", value: "Sin datos" };
  }

  return {
    id: dCfg.id,
    label: dCfg.label,
    weight: dCfg.weight,
    source: dCfg.source,
    status: scoreStatus(result.performanceScore),
    value: `${result.performanceScore}/100`,
    detail: result.loadSeconds != null ? `Carga en ${result.loadSeconds.toFixed(1)}s` : undefined,
  };
}
