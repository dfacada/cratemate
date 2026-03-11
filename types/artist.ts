export interface Artist {
  id: string;
  name: string;
  realName?: string;
  origin: string; // city / country
  activeFrom: number; // year
  activeTo?: number; // year or undefined if still active
  labels: string[];
  genres: string[];
  bio: string;
  monthlyListeners?: number;
  followerCount?: number;
  imageUrl?: string;
  soundcloudUrl?: string;
  bandcampUrl?: string;
  residentAdvisorUrl?: string;
  trackCount: number;
  gemTracks: number; // number of high gem-score tracks
}

export interface ArtistCatalogEntry {
  id: string;
  artistId: string;
  year: number;
  title: string;
  label: string;
  catalogNumber?: string;
  isRemix: boolean;
  isCollaboration: boolean;
  gemScore: number;
  bpm?: number;
  key?: string;
  energy?: number;
  beatportUrl?: string;
}
