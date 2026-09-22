import type { SignalStatus, Tier } from "./types";

export interface SignalConfig {
  id: string;
  label: string;
  weight: number;
  source: string;
}

export const SIGNAL_CONFIG: SignalConfig[] = [
  { id: "https", label: "Conexión segura (HTTPS)", weight: 5, source: "Verificación de protocolo" },
  { id: "mobile_friendly", label: "Diseño compatible con móvil", weight: 8, source: "Google PageSpeed Insights" },
  { id: "mobile_speed", label: "Velocidad en móvil", weight: 12, source: "Google PageSpeed Insights" },
  { id: "desktop_speed", label: "Velocidad en escritorio", weight: 8, source: "Google PageSpeed Insights" },
  { id: "sitemap", label: "Mapa del sitio (sitemap.xml)", weight: 5, source: "Verificación directa" },
  { id: "robots", label: "Archivo robots.txt", weight: 5, source: "Verificación directa" },
  { id: "title_tag", label: "Título de la página", weight: 8, source: "Análisis de HTML" },
  { id: "meta_description", label: "Meta descripción", weight: 8, source: "Análisis de HTML" },
  { id: "heading_structure", label: "Estructura de encabezados", weight: 7, source: "Análisis de HTML" },
  { id: "alt_text", label: "Texto alternativo en imágenes", weight: 6, source: "Análisis de HTML" },
  { id: "internal_links", label: "Enlaces internos", weight: 6, source: "Análisis de HTML" },
  { id: "schema", label: "Datos estructurados (Schema)", weight: 8, source: "Análisis de HTML" },
  { id: "canonical", label: "Etiqueta canónica", weight: 6, source: "Análisis de HTML" },
  { id: "gbp", label: "Perfil de Google", weight: 8, source: "Google Places API" },
];

export const TOTAL_WEIGHT = SIGNAL_CONFIG.reduce((sum, s) => sum + s.weight, 0);

export const STATUS_MULTIPLIER: Record<SignalStatus, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

export const TIER_BANDS: { min: number; tier: Tier; label: string }[] = [
  { min: 80, tier: "excellent", label: "Excelente" },
  { min: 60, tier: "good", label: "Bien encaminado" },
  { min: 40, tier: "needs_attention", label: "Necesita atención" },
  { min: 0, tier: "critical", label: "Crítico" },
];

export function tierForScore(score: number): { tier: Tier; label: string } {
  const band = TIER_BANDS.find((b) => score >= b.min) ?? TIER_BANDS[TIER_BANDS.length - 1];
  return { tier: band.tier, label: band.label };
}

export const STATUS_COLORS: Record<SignalStatus, string> = {
  pass: "#3fcf8e",
  warn: "#eaa63e",
  fail: "#ef5b71",
};

export const TIER_COLORS: Record<Tier, string> = {
  excellent: "#3fcf8e",
  good: "#8368ff",
  needs_attention: "#eaa63e",
  critical: "#ef5b71",
};

export const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
};
