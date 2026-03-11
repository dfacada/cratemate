"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Archive,
  ListMusic,
  Users,
  Tag,
  Radio,
  History,
  Settings,
  Disc3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Dig", href: "/new-dig", icon: Search },
  { label: "Crates", href: "/crate", icon: Archive },
  { label: "Sets", href: "/set-builder", icon: ListMusic },
  { label: "Artists", href: "/artists", icon: Users },
  { label: "Labels", href: "/labels", icon: Tag },
  { label: "Underground Radar", href: "/radar", icon: Radio },
];

const bottomItems = [
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-white/5 bg-[#0E0E10]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/20 ring-1 ring-teal-500/40">
          <Disc3 className="h-4 w-4 text-teal-400" />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-white">
          CrateMate
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-0.5 px-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-teal-400" : "text-zinc-600 group-hover:text-zinc-400"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-white/5" />

        {/* Bottom nav items */}
        <div className="space-y-0.5 px-2">
          {bottomItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-teal-500/10 text-teal-400"
                    : "text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-700">
          v0.1 beta
        </p>
      </div>
    </aside>
  );
}
