import { format, parseISO } from "date-fns";
export const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return "Не указан";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it starts with 7 or 8 and has 11 digits (Standard Russian format)
  if (
    cleaned.length === 11 &&
    (cleaned.startsWith("7") || cleaned.startsWith("8"))
  ) {
    // Extract parts: 7 (999) 999-99-99
    // Pattern: +7 XXX XXX XX-XX
    const part1 = cleaned.slice(1, 4);
    const part2 = cleaned.slice(4, 7);
    const part3 = cleaned.slice(7, 9);
    const part4 = cleaned.slice(9, 11);

    return `+7 ${part1} ${part2} ${part3}-${part4}`;
  }

  // If it doesn't match standard Russian length, return original or basic format
  return phone;
};

/**
 * Converts an ISO date string to "dd/MM/yyyy" format.
 * @param dateStr - The ISO date string (e.g. "2026-02-14T08:24:00.992Z")
 * @returns The formatted date string (e.g. "14/02/2026") or an empty string if invalid.
 */
export const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "";

  try {
    // parseISO is recommended over new Date() for ISO strings in date-fns
    return format(parseISO(dateStr), "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
