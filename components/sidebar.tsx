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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-black/10 bg-[#CACACF]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-black/10 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/20 ring-1 ring-orange-500/30">
          <Disc3 className="h-4 w-4 text-orange-600" />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-[#111114]">
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
                    ? "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/25"
                    : "text-[#72727E] hover:bg-black/6 hover:text-[#111114]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-orange-600" : "text-[#9595A0] group-hover:text-[#4A4A58]"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mx-4 my-4 border-t border-black/8" />

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
                    ? "bg-orange-500/15 text-orange-700"
                    : "text-[#9595A0] hover:bg-black/5 hover:text-[#2E2E38]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-black/8 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#B8B8C2]">
          v0.1 beta
        </p>
      </div>
    </aside>
  );
}
