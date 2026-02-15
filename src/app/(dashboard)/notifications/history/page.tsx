"use client";

import { NotificationHistory } from "@/components/notification-history";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/notifications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sent History</h2>
          <p className="text-muted-foreground">
            View logs of all previous push notifications.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <NotificationHistory />
      </div>
    </div>
  );
}
