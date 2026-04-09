"use client";

import * as React from "react";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- Application Providers ---
import { SocketProvider } from "./SocketProvider";
import { NotificationProvider } from "./NotificationProvider";
import AdminFcmProvider from "./AdminFcmProvider";
import { Toaster } from "@/components/ui/toaster";

// 1. Create a clean fallback UI for React Suspense
const GlobalAdminLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Загрузка панели...
      </p>
    </div>
  </div>
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {/* 🚨 2. Wrap everything inside NotificationProvider */}
          <NotificationProvider>
            {/* Background Push Notification Listener */}
            <AdminFcmProvider />

            {/* 3. Suspense with fallback to prevent hydration crashes */}
            <Suspense fallback={<GlobalAdminLoader />}>{children}</Suspense>

            {/* Toast notifications UI (Must be inside NotificationProvider so it can trigger toasts) */}
            <Toaster />
          </NotificationProvider>
        </SocketProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
