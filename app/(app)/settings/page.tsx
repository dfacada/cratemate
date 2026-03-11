import { Settings, User, Bell, Palette, Database, Key, Globe } from "lucide-react";

const sections = [
  {
    icon: User,
    title: "Profile",
    desc: "Your DJ name, bio, and avatar",
    fields: [
      { label: "DJ Name", type: "text", placeholder: "e.g. DJ Shadow" },
      { label: "Email", type: "email", placeholder: "you@email.com" },
      { label: "Bio", type: "textarea", placeholder: "A few words about your sound..." },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "When to get alerted about radar hits and new releases",
    toggles: [
      { label: "Underground Radar alerts", defaultOn: true },
      { label: "New releases from saved artists", defaultOn: true },
      { label: "Weekly digest email", defaultOn: false },
      { label: "Label drop notifications", defaultOn: false },
    ],
  },
  {
    icon: Database,
    title: "Integrations",
    desc: "Connect your music accounts",
    integrations: [
      { name: "Spotify", status: "disconnected" },
      { name: "SoundCloud", status: "disconnected" },
      { name: "Discogs", status: "disconnected" },
      { name: "Beatport", status: "disconnected" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#111114]">Settings</h1>
        <p className="mt-1 text-sm text-[#72727E]">Manage your CrateMate account and preferences</p>
      </div>

      {sections.map(({ icon: Icon, title, desc, fields, toggles, integrations }) => (
        <div key={title} className="rounded-xl border border-black/9 bg-[#D4D4DA] overflow-hidden">
          <div className="flex items-center gap-3 border-b border-black/7 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Icon className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111114]">{title}</h2>
              <p className="text-xs text-[#9595A0]">{desc}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {fields?.map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-xs font-medium text-[#4A4A58]">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={f.placeholder}
                    className="w-full resize-none rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm text-[#2E2E38] placeholder-[#B8B8C2] outline-none focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/15"
                  />
                ) : (
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="h-9 w-full rounded-lg border border-black/10 bg-black/5 px-3 text-sm text-[#2E2E38] placeholder-[#B8B8C2] outline-none focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/15"
                  />
                )}
              </div>
            ))}

            {toggles?.map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-[#2E2E38]">{t.label}</span>
                <div
                  className={`relative h-5 w-9 rounded-full transition-colors ${t.defaultOn ? "bg-orange-500" : "bg-black/15"}`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${t.defaultOn ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
            ))}

            {integrations?.map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-lg border border-black/8 bg-black/4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#2E2E38]">{i.name}</p>
                  <p className="text-xs text-[#9595A0]">Not connected</p>
                </div>
                <button className="rounded-md bg-orange-500/15 px-3 py-1.5 text-xs font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/25">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button className="rounded-lg bg-orange-500/20 px-5 py-2 text-sm font-medium text-orange-700 ring-1 ring-orange-500/30 transition hover:bg-orange-500/30">
          Save Changes
        </button>
      </div>
    </div>
  );
}
