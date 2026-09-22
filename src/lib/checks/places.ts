import { SIGNAL_CONFIG } from "../constants";
import type { SignalResult } from "../types";
import { fetchWithTimeout } from "../fetchWithTimeout";
import { businessNameFromDomain } from "../url";

function cfg(id: string) {
  const c = SIGNAL_CONFIG.find((s) => s.id === id);
  if (!c) throw new Error(`Unknown signal id: ${id}`);
  return c;
}

interface TextSearchResult {
  place_id: string;
  name: string;
}

interface TextSearchResponse {
  status: string;
  results: TextSearchResult[];
}

interface PlaceReview {
  time: number;
}

interface PlaceDetailsResponse {
  status: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: PlaceReview[];
  };
}

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export async function checkGoogleBusinessProfile(url: URL, businessNameHint?: string): Promise<SignalResult> {
  const c = cfg("gbp");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "Sin datos" };
  }

  const query = businessNameHint?.trim() || businessNameFromDomain(url.hostname);

  try {
    const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("region", "do");
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetchWithTimeout(searchUrl.toString(), {}, 8000);
    const searchData = (await searchRes.json()) as TextSearchResponse;

    const topResult = searchData.results?.[0];
    if (searchData.status !== "OK" || !topResult) {
      return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "No encontrado" };
    }

    const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    detailsUrl.searchParams.set("place_id", topResult.place_id);
    detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");
    detailsUrl.searchParams.set("key", apiKey);

    const detailsRes = await fetchWithTimeout(detailsUrl.toString(), {}, 8000);
    const detailsData = (await detailsRes.json()) as PlaceDetailsResponse;

    const rating = detailsData.result?.rating;
    const reviewCount = detailsData.result?.user_ratings_total ?? 0;
    const reviews = detailsData.result?.reviews ?? [];
    const mostRecentReviewMs = reviews.length > 0 ? Math.max(...reviews.map((r) => r.time * 1000)) : null;
    const monthsAgo = mostRecentReviewMs != null ? Math.round((Date.now() - mostRecentReviewMs) / (30 * 24 * 60 * 60 * 1000)) : null;
    const recentReview = mostRecentReviewMs != null && Date.now() - mostRecentReviewMs <= SIXTY_DAYS_MS;

    if (rating == null) {
      return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "No encontrado" };
    }

    const ratingLabel = `${rating.toFixed(1)}★ · ${reviewCount} reseñas`;
    const detail = monthsAgo != null ? `última hace ${monthsAgo} ${monthsAgo === 1 ? "mes" : "meses"}` : "sin reseñas recientes";

    if (rating >= 4.0 && recentReview) {
      return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "pass", value: ratingLabel, detail };
    }

    if (rating >= 3.5) {
      return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "warn", value: ratingLabel, detail };
    }

    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: ratingLabel, detail };
  } catch {
    return { id: c.id, label: c.label, weight: c.weight, source: c.source, status: "fail", value: "Sin datos" };
  }
}
