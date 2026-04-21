"use client";

import { apiRequest } from "@/utils/api-client";
import { useQuery } from "@tanstack/react-query";

// ==========================================
// 1. ТИПЫ ДАННЫХ
// ==========================================
export interface AnalyticsStats {
  totalVisits: number;
  uniqueVisitors: number;
  spamTrapped: number;
}

// ==========================================
// 2. API МЕТОДЫ (Чистые запросы)
// ==========================================
export const analyticsApi = {
  getStats: async (): Promise<AnalyticsStats> => {
    return await apiRequest({ method: "get", url: "/api/analytics/stats" });
  },
};

// ==========================================
// 3. REACT QUERY ХУКИ
// ==========================================
export const QUERY_KEYS = {
  stats: ["admin-stats"] as const,
};

export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: analyticsApi.getStats,
  });
};
