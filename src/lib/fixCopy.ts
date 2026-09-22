import type { SignalResult } from "./types";

interface FixCopy {
  title: string;
  body: string;
}

const STATIC_COPY: Record<string, FixCopy> = {
  https: {
    title: "Conexión sin cifrar.",
    body: "Los navegadores marcan el sitio como no seguro, y eso ahuyenta visitas antes de que lean una sola línea.",
  },
  mobile_friendly: {
    title: "El sitio no se adapta bien al celular.",
    body: "La mayoría de tus visitantes entra desde el teléfono, y ahí es justo donde falla.",
  },
  mobile_speed: {
    title: "Carga lenta en móvil.",
    body: "La mayoría de visitantes en celular abandona antes de que la página termine de cargar.",
  },
  desktop_speed: {
    title: "Carga lenta en escritorio.",
    body: "Cada segundo de más reduce las probabilidades de que se queden a comprar.",
  },
  sitemap: {
    title: "Sin mapa del sitio (sitemap.xml).",
    body: "A Google le cuesta más encontrar e indexar tus páginas nuevas.",
  },
  robots: {
    title: "El archivo robots.txt está bloqueando el rastreo.",
    body: "Puede que estés impidiendo que Google vea partes importantes del sitio.",
  },
  title_tag: {
    title: "Título de página sin optimizar.",
    body: "Es lo primero que la gente ve en Google, y ahora no dice nada de tu negocio.",
  },
  meta_description: {
    title: "Meta descripción ausente o floja.",
    body: "Es el texto que aparece bajo tu enlace en Google. Cada resultado de búsqueda pierde clics que ya deberían ser tuyos.",
  },
  heading_structure: {
    title: "Estructura de encabezados desordenada.",
    body: "Confunde tanto a los buscadores como a quien lee rápido desde el celular.",
  },
  alt_text: {
    title: "Imágenes sin texto alternativo.",
    body: "Google no puede describir lo que no puede leer, y así se pierde tráfico de búsqueda de imágenes.",
  },
  internal_links: {
    title: "Muy pocos enlaces internos.",
    body: "Sin ellos, Google no entiende cuáles páginas de tu sitio son las importantes.",
  },
  schema: {
    title: "Sin datos estructurados (Schema).",
    body: "El sitio es invisible para resultados enriquecidos y buscadores con IA.",
  },
  canonical: {
    title: "Sin etiqueta canónica.",
    body: "Google puede confundirse sobre cuál versión de la página mostrar en los resultados.",
  },
  gbp: {
    title: "Perfil de Google descuidado.",
    body: "Es lo primero que revisa un cliente antes de visitarte o llamarte.",
  },
};

function secondsFromDetail(detail?: string): string | null {
  const match = detail?.match(/([\d.]+)s/);
  return match ? match[1] : null;
}

export function getFixCopy(signal: SignalResult): FixCopy {
  const base = STATIC_COPY[signal.id] ?? {
    title: signal.label,
    body: "Este punto está afectando el resultado del diagnóstico.",
  };

  if (signal.id === "mobile_speed" || signal.id === "desktop_speed") {
    const seconds = secondsFromDetail(signal.detail);
    if (seconds) {
      const device = signal.id === "mobile_speed" ? "móvil" : "escritorio";
      return { ...base, title: `${seconds} segundos de carga en ${device}.` };
    }
  }

  return base;
}
