import ArtistMiner from "@/components/artist-miner";
import { mockArtists } from "@/data/mockArtists";
import { Users, MapPin, Disc3 } from "lucide-react";

export default function ArtistsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Artists</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse and mine artist catalogs oldest → newest
        </p>
      </div>

      {/* Artist grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {mockArtists.map((artist) => (
          <div
            key={artist.id}
            className="group rounded-xl border border-white/8 bg-[#15151B] p-4 transition hover:border-white/15 hover:bg-white/2"
          >
            {/* Avatar placeholder */}
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-teal-700/10 ring-1 ring-teal-500/20">
              <span className="font-display text-xs font-bold text-teal-400">
                {artist.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <h3 className="font-display text-sm font-semibold text-white">{artist.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
              <MapPin className="h-3 w-3" />
              <span>{artist.origin}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-zinc-500">
                <Disc3 className="h-3 w-3" />
                <span>{artist.trackCount} tracks</span>
              </div>
              <span className="text-teal-400">{artist.gemTracks} gems</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {artist.genres.slice(0, 2).map((g) => (
                <span key={g} className="rounded-full bg-white/6 px-2 py-0.5 text-[9px] text-zinc-500">
                  {g}
                </span>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {artist.labels.slice(0, 2).map((l) => (
                <span key={l} className="rounded-full bg-teal-500/8 px-2 py-0.5 text-[9px] text-teal-600">
                  {l}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Miner */}
      <div className="rounded-xl border border-white/8 bg-[#15151B] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-teal-400" />
          Artist Catalog Miner
        </h2>
        <ArtistMiner />
      </div>
    </div>
  );
}
