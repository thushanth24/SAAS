import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "USD") {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function formatDate(dateString: string | Date) {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateRandomSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getGravatarUrl(email: string, size = 80) {
  const hash = email
    .trim()
    .toLowerCase()
    .split("")
    .reduce((acc, char) => {
      const charCode = char.charCodeAt(0);
      return `${acc}${charCode.toString(16)}`;
    }, "");
  
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
