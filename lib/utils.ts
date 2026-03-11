import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function energyColor(energy: number): string {
  if (energy <= 3) return "text-blue-400";
  if (energy <= 5) return "text-cyan-500";
  if (energy <= 7) return "text-cyan-600";
  if (energy <= 9) return "text-orange-500";
  return "text-red-500";
}

export function gemScoreColor(score: number): string {
  if (score >= 90) return "text-cyan-600";
  if (score >= 75) return "text-cyan-500";
  if (score >= 60) return "text-amber-500";
  return "text-slate-400";
}

export function confidenceLabel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}
