import type { ScanStreamEvent } from "./types";

export interface ScanClientHandlers {
  onSignal: (event: Extract<ScanStreamEvent, { type: "signal" }>) => void;
  onDone: (event: Extract<ScanStreamEvent, { type: "done" }>) => void;
  onError: (message: string) => void;
}

export async function scanUrl(url: string, handlers: ScanClientHandlers, signal?: AbortSignal): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal,
    });
  } catch {
    handlers.onError("No se pudo conectar con el servidor.");
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    handlers.onError(data?.error ?? `Error ${res.status}`);
    return;
  }

  if (!res.body) {
    handlers.onError("El servidor no devolvió datos.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as ScanStreamEvent;
      if (event.type === "signal") handlers.onSignal(event);
      else if (event.type === "done") handlers.onDone(event);
      else if (event.type === "error") handlers.onError(event.message);
    }
  }

  if (buffer.trim()) {
    const event = JSON.parse(buffer) as ScanStreamEvent;
    if (event.type === "signal") handlers.onSignal(event);
    else if (event.type === "done") handlers.onDone(event);
    else if (event.type === "error") handlers.onError(event.message);
  }
}
