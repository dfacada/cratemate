import { Tag, Disc3, TrendingUp } from "lucide-react";

const LABELS = [
  { name: "Keinemusik", releases: 47, artists: ["Rampa", "&ME", "Adam Port"], genres: ["Melodic", "Deep House"], country: "DE", founded: 2009 },
  { name: "Visionquest", releases: 38, artists: ["Seth Troxler", "Ryan Crosson", "Ivory (IT)"], genres: ["Deep House", "Techno"], country: "US", founded: 2010 },
  { name: "Tsuba", releases: 62, artists: ["Trikk", "Lake People", "tINI"], genres: ["Minimal", "Deep House"], country: "UK", founded: 2004 },
  { name: "Innervisions", releases: 89, artists: ["Dixon", "Âme", "DJ Koze"], genres: ["Deep House", "Electronica"], country: "DE", founded: 2006 },
  { name: "Pampa Records", releases: 31, artists: ["DJ Koze", "Apparat", "Caribou"], genres: ["Deep House", "Electronica"], country: "DE", founded: 2011 },
  { name: "Pets Recordings", releases: 41, artists: ["Trikk", "Ivory (IT)", "Borrowed Identity"], genres: ["Minimal", "Deep House"], country: "UK", founded: 2012 },
  { name: "Hot Natured Records", releases: 22, artists: ["Hot Natured", "Jamie Jones", "Lee Foss"], genres: ["Indie Dance", "Deep House"], country: "UK", founded: 2011 },
  { name: "Crosstown Rebels", releases: 114, artists: ["Damian Lazarus", "Nandu", "Butch"], genres: ["Tech House", "Deep House"], country: "UK", founded: 2003 },
];

export default function LabelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Labels</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Explore labels and discover their rosters
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LABELS.map((label) => (
          <div
            key={label.name}
            className="group rounded-xl border border-white/8 bg-[#15151B] p-4 transition hover:border-white/15 hover:bg-white/2"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 ring-1 ring-teal-500/20">
                <Tag className="h-4 w-4 text-teal-400" />
              </div>
              <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] text-zinc-600">
                {label.country} · {label.founded}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-display text-sm font-semibold text-white">{label.name}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Disc3 className="h-3 w-3" />
                  {label.releases} releases
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {label.artists.length} artists
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {label.genres.map((g) => (
                <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-zinc-600">
                  {g}
                </span>
              ))}
            </div>

            <div className="mt-3 border-t border-white/6 pt-3 text-[10px] text-zinc-600">
              {label.artists.join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
