import { toPng } from "html-to-image";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

async function captureCardPng(node: HTMLElement): Promise<string> {
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }
  return toPng(node, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    pixelRatio: 1,
    cacheBust: true,
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) array[i] = bytes.charCodeAt(i);
  return new File([array], filename, { type: mime });
}

export async function exportCardAsImage(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await captureCardPng(node);
  const file = dataUrlToFile(dataUrl, filename);

  if (typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator) {
    const shareData = { files: [file] };
    if (navigator.canShare?.(shareData)) {
      try {
        await navigator.share({ ...shareData, title: "Diagnóstico Oryn Presence" });
        return;
      } catch {
        // user cancelled share sheet, or share failed - fall back to download
      }
    }
  }

  downloadDataUrl(dataUrl, filename);
}

export async function exportCardAsPdf(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await captureCardPng(node);
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const aspect = CARD_HEIGHT / CARD_WIDTH;
  let imgWidth = pageWidth - 72;
  let imgHeight = imgWidth * aspect;
  if (imgHeight > pageHeight - 72) {
    imgHeight = pageHeight - 72;
    imgWidth = imgHeight / aspect;
  }

  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
  pdf.save(filename);
}
