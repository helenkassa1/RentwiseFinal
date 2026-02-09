/** Type stub for optional pdfjs-dist (format-preserving PDF extraction). Install pdfjs-dist to use. */
declare module "pdfjs-dist" {
  export function getDocument(params: { data: Uint8Array; useSystemFonts?: boolean }): { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: (opts: object) => Promise<{ items: unknown[] }> }> }> };
}
declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export function getDocument(params: { data: Uint8Array; useSystemFonts?: boolean }): { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: (opts: object) => Promise<{ items: unknown[] }> }> }> };
}
