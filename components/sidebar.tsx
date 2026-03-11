"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Archive, ListMusic,
  Users, Tag, Radio, History, Settings, Disc3,
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-slate-200 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15 ring-1 ring-cyan-500/30">
          <Disc3 className="h-4 w-4 text-cyan-500" />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-[#0A0F1E]">
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
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-600 ring-1 ring-cyan-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-cyan-500" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mx-4 my-4 border-t border-slate-100" />

        <div className="space-y-0.5 px-2">
          {bottomItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-600"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300">
          v0.1 beta
        </p>
      </div>
    </aside>
  );
}
