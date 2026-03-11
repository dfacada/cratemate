import { History, Search, Upload, Users, Clock } from "lucide-react";

const historyItems = [
  { type: "dig", icon: Search, label: "New Dig — Pasted Spotify playlist", sub: "12 tracks extracted · DNA analyzed", time: "2 hours ago", color: "text-blue-600", bg: "bg-blue-500/10" },
  { type: "artist", icon: Users, label: "Mined Rampa catalog", sub: "10 tracks · 3 added to crate", time: "5 hours ago", color: "text-orange-600", bg: "bg-orange-500/10" },
  { type: "upload", icon: Upload, label: "Screenshot upload — RA set list", sub: "OCR extracted 8 tracks", time: "Yesterday", color: "text-purple-600", bg: "bg-purple-500/10" },
  { type: "artist", icon: Users, label: "Mined Ivory (IT) catalog", sub: "8 tracks · 5 added to crate", time: "Yesterday", color: "text-orange-600", bg: "bg-orange-500/10" },
  { type: "dig", icon: Search, label: "New Dig — SoundCloud mix", sub: "18 tracks extracted", time: "2 days ago", color: "text-blue-600", bg: "bg-blue-500/10" },
  { type: "artist", icon: Users, label: "Mined Trikk catalog", sub: "6 tracks · 2 added to crate", time: "3 days ago", color: "text-orange-600", bg: "bg-orange-500/10" },
  { type: "upload", icon: Upload, label: "Screenshot upload — Boiler Room tracklist", sub: "OCR extracted 14 tracks · 4 low confidence", time: "4 days ago", color: "text-purple-600", bg: "bg-purple-500/10" },
];

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#111114]">History</h1>
        <p className="mt-1 text-sm text-[#72727E]">Your recent digs, uploads, and catalog mines</p>
      </div>

      <div className="rounded-xl border border-black/9 bg-[#D4D4DA] overflow-hidden">
        <div className="divide-y divide-black/7">
          {historyItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 transition hover:bg-black/4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1E1E26] truncate">{item.label}</p>
                <p className="text-xs text-[#9595A0]">{item.sub}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-[#B8B8C2]">
                <Clock className="h-3 w-3" />
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
