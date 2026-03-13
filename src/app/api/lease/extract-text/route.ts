/**
 * POST /api/lease/extract-text
 * Extracts text from uploaded lease (PDF or Word) for AI review.
 * PRD §4.2 Lease Agreement Reviewer — document processing.
 */

import { NextResponse } from "next/server";
import { extractTextFromPdfWithFormat } from "@/lib/pdf-extract";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Upload a PDF or Word document." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    const type = file.type?.toLowerCase() ?? "";
    const name = (file.name || "").toLowerCase();
    const isPdf =
      type === "application/pdf" ||
      name.endsWith(".pdf");
    const isWord =
      type.includes("wordprocessingml") ||
      type === "application/msword" ||
      name.endsWith(".docx") ||
      name.endsWith(".doc");

    if (!isPdf && !isWord) {
      return NextResponse.json(
        { error: "Unsupported format. Use PDF or Word (.doc, .docx)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text: string;

    if (isPdf) {
      text = await extractTextFromPdfWithFormat(buffer);
    } else {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value ?? "";
    }

    const trimmed = (text || "").trim();
    if (trimmed.length < 10) {
      return NextResponse.json(
        { error: "Could not extract enough text from the document. Try pasting the lease text directly." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: trimmed });
  } catch (err) {
    console.error("Lease extract-text error:", err);
    return NextResponse.json(
      { error: "Failed to extract text. Please try again or paste the lease text." },
      { status: 500 }
    );
  }
}
