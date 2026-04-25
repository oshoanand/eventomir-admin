"use client";

import { useAnalyticsStats } from "@/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Users, Eye, Activity, FileText } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsDashboard() {
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
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 w-full mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">
        Аналитика и Безопасность
      </h1>

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-card border rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-muted-foreground">
              Всего просмотров
            </h3>
          </div>
          <p className="text-5xl font-black text-foreground">
            {data?.totalVisits.toLocaleString("ru-RU")}
          </p>
        </div>

        <div className="p-6 bg-card border rounded-3xl shadow-sm">
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

        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-red-800">Отражено атак</h3>
          </div>
          <p className="text-5xl font-black text-red-600">
            {data?.spamTrapped.toLocaleString("ru-RU")}
          </p>
        </div>
      </div>

      {/* 2. TRAFFIC CHART */}
      <div className="bg-card border rounded-3xl shadow-sm p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Трафик (Последние 30 дней)</h2>
        </div>
        <div className="h-[350px] w-full">
          {data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Просмотры"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground font-medium">
              Недостаточно данных для графика
            </div>
          )}
        </div>
      </div>

      {/* 3. SPLIT PANELS (Top Pages & Security) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-card border rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold">Популярные страницы</h2>
          </div>
          <div className="space-y-4">
            {data?.topPages.map((page, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
              >
                <span
                  className="font-medium text-sm truncate pr-4"
                  title={page.path}
                >
                  {page.path}
                </span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm shrink-0">
                  {page.views.toLocaleString("ru-RU")}
                </span>
              </div>
            ))}
            {!data?.topPages.length && (
              <p className="text-muted-foreground text-sm">Нет данных</p>
            )}
          </div>
        </div>

        {/* Recent Spam/Security Logs */}
        <div className="bg-card border rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold">Последние инциденты</h2>
          </div>
          <div className="space-y-4">
            {data?.recentSpamLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-red-50/50 border border-red-100 rounded-xl"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-red-800">
                    IP: {log.ipAddress}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(log.createdAt).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold">
                    {log.eventType}
                  </span>
                  <span
                    className="text-muted-foreground truncate"
                    title={log.path}
                  >
                    {log.path}
                  </span>
                </div>
              </div>
            ))}
            {!data?.recentSpamLogs.length && (
              <p className="text-muted-foreground text-sm">
                Угроз не обнаружено
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
