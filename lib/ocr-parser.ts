import { OcrTrack } from "@/types/track";

/**
 * OCR Parser — Stub implementation
 * In production, this would call a vision AI API (e.g., GPT-4o or Google Vision)
 * to extract structured track data from DJ screenshot uploads.
 */

export interface OcrParseResult {
  tracks: OcrTrack[];
  rawText: string;
  processingTimeMs: number;
  confidence: number;
  pageCount: number;
}

export interface OcrParseOptions {
  language?: string;
  enhanceContrast?: boolean;
  correctSpelling?: boolean;
}

/**
 * Parse an image file and extract track data using OCR.
 * Returns a list of OcrTrack items with confidence scores.
 */
export async function parseScreenshot(
  imageFile: File,
  _options: OcrParseOptions = {}
): Promise<OcrParseResult> {
  // Stub: simulate network latency
  await new Promise((r) => setTimeout(r, 1800));

  // In production: send image to OCR endpoint and parse response
  // const formData = new FormData();
  // formData.append("file", imageFile);
  // const res = await fetch("/api/ocr", { method: "POST", body: formData });
  // const data = await res.json();

  const stubTracks: OcrTrack[] = [
    {
      id: "ocr001",
      rawText: "Rampa - Keinemusik [KM007]",
      artist: "Rampa",
      title: "Keinemusik",
      label: "Keinemusik",
      year: 2014,
      confidence: 0.97,
      verified: true,
      catalogNumber: "KM007",
      isRemix: false,
      isCollaboration: false,
    },
    {
      id: "ocr002",
      rawText: "Hot Natured ft Anabel Englund - Amber",
      artist: "Hot Natured",
      title: "Amber",
      label: "Hot Natured Records",
      year: 2012,
      confidence: 0.89,
      verified: false,
      isRemix: false,
      isCollaboration: true,
    },
    {
      id: "ocr003",
      rawText: "Trikk - Body Ta1k [Tsuba046]",
      artist: "Trikk",
      title: "Body Talk",
      label: "Tsuba",
      year: 2016,
      confidence: 0.62,
      verified: false,
      catalogNumber: "TSUBA046",
      isRemix: false,
      isCollaboration: false,
    },
  ];

  return {
    tracks: stubTracks,
    rawText: `Rampa - Keinemusik [KM007]\nHot Natured ft Anabel Englund - Amber\nTrikk - Body Ta1k [Tsuba046]`,
    processingTimeMs: 1800,
    confidence: 0.83,
    pageCount: 1,
  };
}

/**
 * Re-run OCR on a single row with enhanced settings.
 */
export async function reprocessTrack(
  trackId: string,
  rawText: string
): Promise<Partial<OcrTrack>> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    id: trackId,
    confidence: Math.min(1, 0.62 + 0.2),
  };
}
