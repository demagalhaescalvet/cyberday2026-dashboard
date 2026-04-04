import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCLP(n) {
  if (n >= 1e6) return `$${(n/1e6).toFixed(n%1e6===0?0:1)}M`;
  if (n >= 1e3) return `$${Math.round(n/1e3)}K`;
  return `$${n}`;
}

export function formatPrice(n) {
  return `$${n.toLocaleString("es-CL")}`;
}

export function formatPct(n) {
  return `${n>0?"+":""}${n.toFixed(1)}%`;
}
