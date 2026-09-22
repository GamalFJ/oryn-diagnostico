import { SIGNAL_CONFIG, STATUS_MULTIPLIER, TOTAL_WEIGHT, tierForScore } from "./constants";
import type { ScanSummary, SignalResult } from "./types";
import { normalizeUrl } from "./url";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { runHtmlChecks } from "./checks/html";
import { checkRobots, checkSitemap } from "./checks/robots";
import { checkMobile, checkDesktop } from "./checks/pagespeed";
import { checkGoogleBusinessProfile } from "./checks/places";

const UA = "Mozilla/5.0 (compatible; OrynDiagnostico/1.0; +https://purpleoryn.com)";

async function fetchHomepageHtml(url: URL): Promise<{ html: string | null; finalUrl: URL }> {
  try {
    const res = await fetchWithTimeout(url.toString(), { headers: { "User-Agent": UA } }, 9000);
    if (res.ok) return { html: await res.text(), finalUrl: url };
  } catch {
    // fall through to http retry below
  }

  if (url.protocol === "https:") {
    const httpUrl = new URL(url.toString());
    httpUrl.protocol = "http:";
    try {
      const res = await fetchWithTimeout(httpUrl.toString(), { headers: { "User-Agent": UA } }, 9000);
      if (res.ok) return { html: await res.text(), finalUrl: httpUrl };
    } catch {
      // give up, caller handles null html
    }
  }

  return { html: null, finalUrl: url };
}

function unreachableSignals(): SignalResult[] {
  const ids = ["https", "title_tag", "meta_description", "heading_structure", "alt_text", "internal_links", "schema", "canonical"];
  return ids.map((id) => {
    const c = SIGNAL_CONFIG.find((s) => s.id === id)!;
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail" as const, value: "No se pudo acceder" };
  });
}

/**
 * Runs all 14 signal checks concurrently, invoking `emit` as each one resolves
 * (rather than waiting for the slowest call) so the caller can stream results
 * to the client as they land. Returns the final score summary once everything
 * has settled.
 */
export async function runScanStreaming(
  rawUrl: string,
  businessName: string | undefined,
  emit: (signal: SignalResult) => void
): Promise<ScanSummary> {
  const { url } = normalizeUrl(rawUrl);
  const collected: SignalResult[] = [];
  const record = (s: SignalResult) => {
    collected.push(s);
    emit(s);
  };

  const tasks: Promise<void>[] = [
    (async () => {
      const homepage = await fetchHomepageHtml(url);
      const htmlSignals = homepage.html
        ? runHtmlChecks({ url: homepage.finalUrl, html: homepage.html })
        : unreachableSignals();
      htmlSignals.forEach(record);
    })(),
    (async () => {
      const robotsResult = await checkRobots(url);
      record(robotsResult.robotsSignal);
      const sitemapSignal = await checkSitemap(url, robotsResult.sitemapUrls);
      record(sitemapSignal);
    })(),
    (async () => {
      const mobileResult = await checkMobile(url);
      record(mobileResult.mobileFriendly);
      record(mobileResult.mobileSpeed);
    })(),
    (async () => {
      record(await checkDesktop(url));
    })(),
    (async () => {
      record(await checkGoogleBusinessProfile(url, businessName));
    })(),
  ];

  await Promise.all(tasks);

  for (const c of SIGNAL_CONFIG) {
    if (!collected.find((s) => s.id === c.id)) {
      record({ id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "Sin datos" });
    }
  }

  const earnedPoints = collected.reduce((sum, s) => sum + s.weight * STATUS_MULTIPLIER[s.status], 0);
  const overallScore = Math.round((earnedPoints / TOTAL_WEIGHT) * 100);
  const { tier, label: tierLabel } = tierForScore(overallScore);
  const topFixes = collected
    .filter((s) => s.status === "fail")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((s) => s.id);

  return {
    url: url.hostname.replace(/^www\./, "") + (url.pathname !== "/" ? url.pathname : ""),
    scannedAt: new Date().toISOString(),
    overallScore,
    tier,
    tierLabel,
    topFixes,
  };
}
