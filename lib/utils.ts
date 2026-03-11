import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function energyColor(energy: number): string {
  if (energy <= 3) return "#3B82F6";
  if (energy <= 5) return "#D45A00";
  if (energy <= 7) return "#B84800";
  if (energy <= 9) return "#EF4444";
  return "#DC2626";
}

export function gemScoreColor(score: number): string {
  if (score >= 90) return "#D45A00";
  if (score >= 75) return "#B84800";
  if (score >= 60) return "#D97706";
  return "#7A7A84";
}

export function confidenceLabel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}
