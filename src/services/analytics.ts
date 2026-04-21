"use client";

import { apiRequest } from "@/utils/api-client";
import { useQuery } from "@tanstack/react-query";

export interface ChartDataPoint {
  date: string;
  views: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface SecurityLog {
  id: string;
  ipAddress: string;
  eventType: string;
  path: string;
  createdAt: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  uniqueVisitors: number;
  spamTrapped: number;
  chartData: ChartDataPoint[];
  topPages: TopPage[];
  recentSpamLogs: SecurityLog[];
}

export const analyticsApi = {
  getStats: async (): Promise<AnalyticsStats> => {
    return await apiRequest({ method: "get", url: "/api/analytics/stats" });
  },
};

export const QUERY_KEYS = {
  stats: ["admin-stats"] as const,
};

export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: analyticsApi.getStats,
  });
};
