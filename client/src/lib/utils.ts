import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateSubmitterId(): string {
  // In a real implementation, this would use a more permanent UUID stored in extension storage
  const stored = localStorage.getItem("ghostguard_submitter_id");
  if (stored) return stored;
  
  const id = crypto.randomUUID();
  localStorage.setItem("ghostguard_submitter_id", id);
  return id;
}

export function getRatingLevel(score: number): number {
  if (score >= 0.8) return 5;
  if (score >= 0.6) return 4;
  if (score >= 0.4) return 3;
  if (score >= 0.2) return 2;
  return 1;
}

export function getRatingText(score: number): string {
  if (score >= 0.8) return "Excellent";
  if (score >= 0.6) return "Good";
  if (score >= 0.4) return "Moderate";
  if (score >= 0.2) return "Poor";
  return "Very Poor";
}

export function getRatingColor(score: number): string {
  if (score >= 0.8) return "text-success";
  if (score >= 0.6) return "text-success";
  if (score >= 0.4) return "text-warning";
  if (score >= 0.2) return "text-warning";
  return "text-danger";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
