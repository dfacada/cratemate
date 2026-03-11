import { Artist, ArtistCatalogEntry } from "@/types/artist";

export const mockArtists: Artist[] = [
  {
    id: "a001",
    name: "DJ Koze",
    origin: "Hamburg, Germany",
    activeFrom: 1995,
    labels: ["Pampa Records", "Innervisions", "Kompakt"],
    genres: ["Deep House", "Electronica", "Leftfield"],
    bio: "DJ Koze is one of Germany's most celebrated producers, known for his sprawling, genre-defying work and his ability to find beauty in the unexpected. Runs Pampa Records.",
    monthlyListeners: 310000,
    trackCount: 142,
    gemTracks: 27,
    residentAdvisorUrl: "https://ra.co/dj/djkoze",
  },
  {
    id: "a002",
    name: "Bicep",
    origin: "Belfast / London",
    activeFrom: 2009,
    labels: ["Feel My Bicep", "Ninja Tune"],
    genres: ["House", "Techno", "Rave"],
    bio: "Matt McBriar and Andy Ferguson met in Belfast before relocating to London. Ran the Feel My Bicep blog before becoming one of the most beloved acts in modern club music.",
    monthlyListeners: 2800000,
    trackCount: 68,
    gemTracks: 16,
    residentAdvisorUrl: "https://ra.co/dj/bicep",
  },
  {
    id: "a003",
    name: "Âme",
    origin: "Berlin, Germany",
    activeFrom: 2003,
    labels: ["Innervisions", "Souvenir"],
    genres: ["Deep House", "Melodic Techno", "Minimal"],
    bio: "Kristian Beyer and Frank Wiedemann form Âme, the duo at the heart of the Innervisions label. Their productions are longform, hypnotic, and emotionally dense.",
    monthlyListeners: 480000,
    trackCount: 95,
    gemTracks: 22,
    residentAdvisorUrl: "https://ra.co/dj/ame",
  },
  {
    id: "a004",
    name: "Dixon",
    origin: "Frankfurt, Germany",
    activeFrom: 1996,
    labels: ["Innervisions", "Boysnoize Records"],
    genres: ["Deep House", "Techno", "Minimal"],
    bio: "Steffen Berkhahn aka Dixon co-founded Innervisions and has held the top spot in the RA DJ poll multiple times. His trademark sound blends warmth, tension, and technical precision.",
    monthlyListeners: 390000,
    trackCount: 78,
    gemTracks: 19,
    residentAdvisorUrl: "https://ra.co/dj/dixon",
  },
];

export const mockCatalogEntries: ArtistCatalogEntry[] = [
  // DJ Koze — verified releases
  { id: "ce001", artistId: "a001", year: 2008, title: "Nices Wolkchen", label: "Kompakt", catalogNumber: "KOMPAKT 145", gemScore: 78, bpm: 121, isRemix: false, isCollaboration: false, energy: 6 },
  { id: "ce002", artistId: "a001", year: 2013, title: "Pick Up (feat. José González)", label: "Pampa Records", catalogNumber: "PAMPA011", gemScore: 92, bpm: 103, isRemix: false, isCollaboration: true, energy: 5 },
  { id: "ce003", artistId: "a001", year: 2015, title: "XTC", label: "Pampa Records", catalogNumber: "PAMPA017", gemScore: 97, bpm: 117, isRemix: false, isCollaboration: false, energy: 6 },
  { id: "ce004", artistId: "a001", year: 2018, title: "Seeing Aliens", label: "Pampa Records", catalogNumber: "PAMPA040", gemScore: 88, bpm: 114, isRemix: false, isCollaboration: false, energy: 5 },
  { id: "ce005", artistId: "a001", year: 2018, title: "Colors of Autumn Rain", label: "Pampa Records", catalogNumber: "PAMPA040", gemScore: 85, bpm: 110, isRemix: false, isCollaboration: false, energy: 4 },
  { id: "ce006", artistId: "a001", year: 2018, title: "Illumination (feat. Sophia Kennedy)", label: "Pampa Records", catalogNumber: "PAMPA040", gemScore: 90, bpm: 122, isRemix: false, isCollaboration: true, energy: 7 },
  { id: "ce007", artistId: "a001", year: 2019, title: "Careless With Your Love (Rampa Remix)", label: "Pampa Records", gemScore: 82, bpm: 120, isRemix: true, isCollaboration: false, energy: 7 },

  // Bicep — verified releases
  { id: "ce010", artistId: "a002", year: 2013, title: "Just", label: "Feel My Bicep", catalogNumber: "FMB001", gemScore: 86, bpm: 128, isRemix: false, isCollaboration: false, energy: 7 },
  { id: "ce011", artistId: "a002", year: 2015, title: "Aura", label: "Feel My Bicep", catalogNumber: "FMB002", gemScore: 89, bpm: 130, isRemix: false, isCollaboration: false, energy: 8 },
  { id: "ce012", artistId: "a002", year: 2017, title: "Glue", label: "Feel My Bicep", catalogNumber: "FMB004", gemScore: 96, bpm: 130, isRemix: false, isCollaboration: false, energy: 8 },
  { id: "ce013", artistId: "a002", year: 2017, title: "Opal", label: "Ninja Tune", catalogNumber: "ZEN244", gemScore: 88, bpm: 126, isRemix: false, isCollaboration: false, energy: 7 },
  { id: "ce014", artistId: "a002", year: 2017, title: "Vale", label: "Ninja Tune", catalogNumber: "ZEN244", gemScore: 84, bpm: 128, isRemix: false, isCollaboration: false, energy: 8 },
  { id: "ce015", artistId: "a002", year: 2020, title: "Apricots", label: "Ninja Tune", catalogNumber: "ZEN271", gemScore: 91, bpm: 132, isRemix: false, isCollaboration: false, energy: 9 },
  { id: "ce016", artistId: "a002", year: 2020, title: "Cazenove", label: "Ninja Tune", catalogNumber: "ZEN271", gemScore: 87, bpm: 130, isRemix: false, isCollaboration: false, energy: 8 },

  // Âme — verified releases
  { id: "ce020", artistId: "a003", year: 2005, title: "Rej", label: "Innervisions", catalogNumber: "IV-001", gemScore: 98, bpm: 124, isRemix: false, isCollaboration: false, energy: 8 },
  { id: "ce021", artistId: "a003", year: 2007, title: "Fiori", label: "Innervisions", catalogNumber: "IV-006", gemScore: 90, bpm: 126, isRemix: false, isCollaboration: false, energy: 8 },
  { id: "ce022", artistId: "a003", year: 2008, title: "Rej (Dixon Remix)", label: "Innervisions", catalogNumber: "IV-001R", gemScore: 95, bpm: 125, isRemix: true, isCollaboration: false, energy: 8 },
  { id: "ce023", artistId: "a003", year: 2012, title: "Yam Who (Âme Remix)", label: "Freerange", gemScore: 79, bpm: 122, isRemix: true, isCollaboration: false, energy: 7 },
  { id: "ce024", artistId: "a003", year: 2015, title: "Rej (Radio Slave Remix)", label: "Innervisions", gemScore: 84, bpm: 127, isRemix: true, isCollaboration: false, energy: 9 },

  // Dixon — verified releases
  { id: "ce030", artistId: "a004", year: 2003, title: "Pencil Pimp", label: "Innervisions", catalogNumber: "IV-004", gemScore: 82, bpm: 128, isRemix: false, isCollaboration: false, energy: 8 },
  { id: "ce031", artistId: "a004", year: 2013, title: "Polymorphic Swing", label: "Innervisions", catalogNumber: "IV-016", gemScore: 93, bpm: 119, isRemix: false, isCollaboration: false, energy: 6 },
  { id: "ce032", artistId: "a004", year: 2013, title: "Untitled", label: "Innervisions", catalogNumber: "IV-016", gemScore: 86, bpm: 122, isRemix: false, isCollaboration: false, energy: 7 },
  { id: "ce033", artistId: "a004", year: 2016, title: "Recondite (Dixon Remix)", label: "Innervisions", gemScore: 80, bpm: 120, isRemix: true, isCollaboration: false, energy: 6 },
];
