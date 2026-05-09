"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Map,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  HelpCircle,
} from "lucide-react";

export default function PartnerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  return (
    <div className="space-y-6 pb-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-headline text-2xl font-bold tracking-tight flex flex-wrap items-center gap-3">
              Профиль Партнер
            </h1>
          </div>
        </div>
      </div>

      {/* Main Profile Banner */}
      <Card className="overflow-hidden border border-border shadow-sm">
        <CardContent className="relative pt-0 sm:pt-0">
          <p>Страница находится в разработке</p>
        </CardContent>
      </Card>
    </div>
  );
}
