"use client";

import { useAnalyticsStats } from "@/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Users, Eye } from "lucide-react";

export default function AnalyticsDashboard() {
  // Используем инкапсулированный хук из сервиса
  const { data, isLoading } = useAnalyticsStats();

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">Аналитика и Безопасность</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">
        Аналитика и Безопасность
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Page Views */}
        <div className="p-6 bg-card border rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-muted-foreground">
              Просмотры страниц
            </h3>
          </div>
          <p className="text-5xl font-black text-foreground">
            {data?.totalVisits.toLocaleString("ru-RU")}
          </p>
        </div>

        {/* Unique Visitors */}
        <div className="p-6 bg-card border rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-muted-foreground">
              Уникальные посетители
            </h3>
          </div>
          <p className="text-5xl font-black text-foreground">
            {data?.uniqueVisitors.toLocaleString("ru-RU")}
          </p>
        </div>

        {/* Trapped Spam/Attacks */}
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-red-800">Отражено атак (Spam)</h3>
          </div>
          <p className="text-5xl font-black text-red-600">
            {data?.spamTrapped.toLocaleString("ru-RU")}
          </p>
        </div>
      </div>
    </div>
  );
}
