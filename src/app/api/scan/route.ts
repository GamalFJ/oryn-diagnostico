import { NextRequest } from "next/server";
import { runScanStreaming } from "@/lib/scan";
import { checkRateLimit } from "@/lib/rateLimit";
import type { ScanRequestBody, ScanStreamEvent } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return Response.json(
      { error: "Demasiados escaneos. Intenta de nuevo más tarde." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } }
    );
  }

  let body: ScanRequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  if (!body.url || typeof body.url !== "string" || body.url.trim().length === 0) {
    return Response.json({ error: "Se requiere una URL." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ScanStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        const summary = await runScanStreaming(body.url, body.businessName, (signal) => {
          send({ type: "signal", signal });
        });
        send({ type: "done", ...summary });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "No se pudo escanear el sitio." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
