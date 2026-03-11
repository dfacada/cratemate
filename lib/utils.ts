import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function energyColor(energy: number): string {
  if (energy <= 3) return "text-blue-600";
  if (energy <= 5) return "text-orange-500";
  if (energy <= 7) return "text-orange-600";
  if (energy <= 9) return "text-red-500";
  return "text-red-700";
}

export function gemScoreColor(score: number): string {
  if (score >= 90) return "text-orange-600";
  if (score >= 75) return "text-orange-500";
  if (score >= 60) return "text-amber-500";
  return "text-[#9595A0]";
}

export function confidenceLabel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}
