/**
 * Extract text from a PDF buffer while preserving line breaks and paragraph spacing
 * using pdfjs-dist getTextContent + transform (Y position).
 */

export type TextItem = { str: string; transform: number[] };

function getY(item: TextItem): number {
  const t = item.transform;
  // transform is [scaleX, 0, 0, scaleY, x, y]; index 5 is Y in PDF coordinates
  return t && t.length >= 6 ? t[5] : 0;
}

/** Approximate line height for "same line" tolerance (PDF units). */
const LINE_HEIGHT_TOLERANCE = 3;
/** Gap larger than this is treated as paragraph break (double newline). */
const PARAGRAPH_GAP_THRESHOLD = 10;

/**
 * Extract text from PDF with layout preserved: newline when Y changes, double newline for paragraph gaps.
 */
export async function extractTextFromPdfWithFormat(buffer: Buffer): Promise<string> {
  // Use legacy build for Node/Next server (no worker)
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs").catch(() => import("pdfjs-dist"));
  const uint8 = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data: uint8, useSystemFonts: true }).promise;
  const numPages = doc.numPages;
  const pageTexts: string[] = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent({ disableCombineTextItems: true });
    const items = content.items as TextItem[];

    if (items.length === 0) {
      pageTexts.push("");
      continue;
    }

    let lastY = getY(items[0]);
    const lineParts: string[] = [];
    let currentLine: string[] = [];

    for (const item of items) {
      const y = getY(item);
      const str = (item as { str?: string }).str ?? "";

      if (Math.abs(y - lastY) > LINE_HEIGHT_TOLERANCE) {
        if (currentLine.length) {
          lineParts.push(currentLine.join(" ").trim());
          currentLine = [];
        }
        if (lastY - y > PARAGRAPH_GAP_THRESHOLD) {
          lineParts.push(""); // paragraph break
        }
        lastY = y;
      }

      if (str) currentLine.push(str);
    }

    if (currentLine.length) {
      lineParts.push(currentLine.join(" ").trim());
    }

    const pageStr = lineParts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    pageTexts.push(pageStr);
  }

  return pageTexts.join("\n\n").trim();
}
