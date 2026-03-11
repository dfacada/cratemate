import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function energyColor(energy: number): string {
  if (energy <= 3) return "text-blue-400";
  if (energy <= 5) return "text-teal-400";
  if (energy <= 7) return "text-yellow-400";
  if (energy <= 9) return "text-orange-400";
  return "text-red-400";
}

export function gemScoreColor(score: number): string {
  if (score >= 90) return "text-teal-300";
  if (score >= 75) return "text-teal-400";
  if (score >= 60) return "text-yellow-400";
  return "text-zinc-400";
}

export function confidenceLabel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}
