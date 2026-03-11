import { Track, OcrTrack } from "@/types/track";

export const mockTracks: Track[] = [
  { id: "t001", artist: "Rampa", title: "Koshi", label: "Keinemusik", year: 2016, bpm: 122, key: "8A", energy: 7, duration: "6:42", source: "ocr", gemScore: 88, catalogNumber: "!K7 383" },
  { id: "t002", artist: "Hot Natured", title: "Amber", label: "Hot Natured", year: 2012, bpm: 120, key: "5A", energy: 6, duration: "7:14", source: "ocr", gemScore: 91, catalogNumber: "HN001" },
  { id: "t003", artist: "Hot Natured", title: "Different (Jamie Jones Remix)", label: "Hot Natured Records", year: 2013, bpm: 125, key: "9A", energy: 8, duration: "8:22", source: "artist_mine", gemScore: 85 },
  { id: "t004", artist: "Trikk", title: "Body Talk", label: "Tsuba", year: 2016, bpm: 123, key: "2A", energy: 7, duration: "7:05", source: "ocr", gemScore: 79 },
  { id: "t005", artist: "Ivory (IT)", title: "Modus Vivendi", label: "Visionquest", year: 2017, bpm: 121, key: "4B", energy: 6, duration: "8:11", source: "artist_mine", gemScore: 82 },
  { id: "t006", artist: "Rampa", title: "Serenade", label: "Keinemusik", year: 2019, bpm: 118, key: "3A", energy: 5, duration: "7:33", source: "radar", gemScore: 90 },
  { id: "t007", artist: "&ME", title: "The Rapture Pt. II", label: "Keinemusik", year: 2020, bpm: 124, key: "6A", energy: 8, duration: "9:01", source: "radar", gemScore: 94 },
  { id: "t008", artist: "DJ Koze", title: "XTC", label: "Pampa Records", year: 2018, bpm: 117, key: "11A", energy: 6, duration: "6:55", source: "artist_mine", gemScore: 87 },
];

export const mockOcrTracks: OcrTrack[] = [
  { id: "ocr001", rawText: "Rampa - Koshi [Keinemusik]", artist: "Rampa", title: "Koshi", label: "Keinemusik", year: 2016, confidence: 0.97, verified: true, bpm: 122, key: "8A" },
  { id: "ocr002", rawText: "Hot Natured ft Anabel Englund - Amber", artist: "Hot Natured", title: "Amber", label: "Hot Natured", year: 2012, confidence: 0.91, verified: false, bpm: 120, key: "5A" },
  { id: "ocr003", rawText: "Trikk - Body Ta1k", artist: "Trikk", title: "Body Talk", label: "Tsuba", year: 2016, confidence: 0.62, verified: false, bpm: 123, key: "2A" },
  { id: "ocr004", rawText: "Ivry (IT) - Modus Vivend1", artist: "Ivory (IT)", title: "Modus Vivendi", label: "Visionquest", year: 2017, confidence: 0.44, verified: false, bpm: 121, key: "4B" },
  { id: "ocr005", rawText: "Rampa - Serenade [Keinemusik]", artist: "Rampa", title: "Serenade", label: "Keinemusik", year: 2019, confidence: 0.98, verified: true, bpm: 118, key: "3A" },
];
