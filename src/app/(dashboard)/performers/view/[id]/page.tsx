"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest } from "@/utils/api-client";

// Hooks & Types
import { usePerformerDetailsQuery } from "@/services/performer";
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

export default function PerformerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { data: performer, isLoading, isError } = usePerformerDetailsQuery(id);

  const handleStartChat = async () => {
    toast({
      title: "Создание чата...",
      description: "Пожалуйста, подождите. Идет настройка комнаты.",
    });

    try {
      const res = await apiRequest<{ partnerId: string }>({
        method: "POST",
        url: "/api/chats/init", // 🚨 FIX: Updated chat endpoint
        data: { partnerId: id },
      });

      if (res && res.partnerId) {
        router.push(`/chat/${res.partnerId}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось открыть чат с исполнителем",
      });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ru-RU").format(amount) + " ₽";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !performer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-destructive mb-2">Ошибка</h2>
        <p className="text-muted-foreground mb-6">
          Не удалось загрузить данные исполнителя.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Вернуться назад
        </Button>
      </div>
    );
  }

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
              Профиль исполнителя
              {/* 🚨 FIX: Stylish Moderation Badge */}
              {(() => {
                const getStatusConfig = (status: string) => {
                  switch (status?.toUpperCase()) {
                    case "APPROVED":
                      return {
                        label: "Одобрен",
                        className:
                          "bg-emerald-50 text-emerald-700 border-emerald-200",
                        Icon: CheckCircle2,
                      };
                    case "PENDING":
                      return {
                        label: "Ожидает модерации",
                        className:
                          "bg-amber-50 text-amber-700 border-amber-200",
                        Icon: Clock,
                      };
                    case "REJECTED":
                      return {
                        label: "Отклонен",
                        className: "bg-rose-50 text-rose-700 border-rose-200",
                        Icon: XCircle,
                      };
                    case "BLOCKED":
                      return {
                        label: "Заблокирован",
                        className:
                          "bg-slate-100 text-slate-700 border-slate-200",
                        Icon: Ban,
                      };
                    default:
                      return {
                        label: "Неизвестно",
                        className: "bg-gray-50 text-gray-600 border-gray-200",
                        Icon: HelpCircle,
                      };
                  }
                };
                const config = getStatusConfig(performer.moderationStatus);
                const Icon = config.Icon;
                return (
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium transition-colors shadow-sm ${config.className}`}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </Badge>
                );
              })()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              ID: {performer.id}
            </p>
          </div>
        </div>

        <Button onClick={handleStartChat} className="shrink-0 w-full md:w-auto">
          <MessageSquare className="mr-2 h-4 w-4" />
          Написать сообщение
        </Button>
      </div>

      {/* Main Profile Banner */}
      <Card className="overflow-hidden border border-border shadow-sm">
        <div className="h-32 sm:h-48 bg-muted relative">
          {performer.backgroundPicture ? (
            <img
              src={performer.backgroundPicture}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900" />
          )}
        </div>
        <CardContent className="relative pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-10 sm:-mt-16 mb-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg shrink-0 bg-white">
              <AvatarImage src={performer.image || ""} />{" "}
              {/* 🚨 FIX: Used performer.image */}
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                {performer.name?.charAt(0).toUpperCase() || "UN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold truncate">
                {performer.name || "Без имени"}
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary/70" />{" "}
                  {performer.city || "Город не указан"}
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="h-4 w-4 text-primary/70 shrink-0" />{" "}
                  {performer.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-primary/70" />{" "}
                  {performer.phone || "Телефон не указан"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">О себе</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {performer.description || "Описание отсутствует."}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Специализации</h3>
                <div className="flex flex-wrap gap-2">
                  {performer.roles?.length > 0 ? (
                    performer.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Не указаны
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-muted/30 p-5 rounded-xl border h-fit">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Тип аккаунта
                </span>
                <p className="font-medium text-foreground">
                  {performer.accountType === "individual"
                    ? "Физ. лицо"
                    : performer.accountType === "agency"
                      ? "Агентство"
                      : performer.accountType || "Не указан"}
                </p>
              </div>
              {performer.companyName && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">
                    Компания
                  </span>
                  <p className="font-medium text-foreground">
                    {performer.companyName} (ИНН: {performer.inn || "-"})
                  </p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Бюджет
                </span>
                <p className="font-medium text-primary text-lg">
                  {performer.priceRange?.length > 0
                    ? `от ${formatCurrency(performer.priceRange[0])}`
                    : "По договоренности"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Регистрация
                </span>
                <p className="font-medium text-foreground">
                  {format(new Date(performer.createdAt), "dd MMMM yyyy", {
                    locale: ru,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed content */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto mb-6">
          <TabsTrigger value="portfolio" className="py-3">
            <ImageIcon className="h-4 w-4 mr-2" /> Портфолио (
            {performer.gallery?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents" className="py-3">
            <FileText className="h-4 w-4 mr-2" /> Документы (
            {(performer.certificates?.length || 0) +
              (performer.recommendationLetters?.length || 0)}
            )
          </TabsTrigger>
          <TabsTrigger value="bookings" className="py-3">
            <CalendarCheck className="h-4 w-4 mr-2" /> Брони (
            {performer.bookings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="events" className="py-3">
            <Map className="h-4 w-4 mr-2" /> События (
            {performer.events?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* GALLERY TAB */}
        <TabsContent value="portfolio" className="space-y-4">
          {!performer.gallery || performer.gallery.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                В портфолио пока нет работ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {performer.gallery.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-square relative bg-muted">
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-2 right-2 bg-background/80 text-foreground backdrop-blur-sm border-none">
                      {item.moderationStatus === "APPROVED"
                        ? "Одобрено"
                        : "Ожидает"}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Сертификаты
            </h3>
            {!performer.certificates || performer.certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Сертификаты не загружены.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performer.certificates.map((cert) => (
                  <a
                    key={cert.id}
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 border rounded-xl bg-card hover:border-primary transition-colors text-center group"
                  >
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-sm font-medium line-clamp-2">
                      {cert.description || "Документ"}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Рекомендательные
              письма
            </h3>
            {!performer.recommendationLetters ||
            performer.recommendationLetters.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Письма не загружены.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performer.recommendationLetters.map((letter) => (
                  <a
                    key={letter.id}
                    href={letter.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 border rounded-xl bg-card hover:border-primary transition-colors text-center group"
                  >
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-sm font-medium line-clamp-2">
                      {letter.description || "Рекомендация"}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings">
          <Card>
            <ScrollArea className="h-[500px] w-full rounded-xl">
              {!performer.bookings || performer.bookings.length === 0 ? (
                <div className="text-center py-16">
                  <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Бронирований пока нет.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {performer.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              booking.status === "CONFIRMED" ||
                              booking.status === "COMPLETED" ||
                              booking.status === "FULFILLED"
                                ? "default"
                                : booking.status === "PENDING"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              booking.status === "CONFIRMED" ||
                              booking.status === "COMPLETED" ||
                              booking.status === "FULFILLED"
                                ? "bg-green-500"
                                : ""
                            }
                          >
                            {booking.status === "CONFIRMED"
                              ? "Подтверждено"
                              : booking.status === "COMPLETED" ||
                                  booking.status === "FULFILLED"
                                ? "Завершено"
                                : booking.status === "PENDING"
                                  ? "Ожидает"
                                  : "Отменено"}
                          </Badge>
                          <span className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {format(new Date(booking.date), "dd MMMM yyyy", {
                              locale: ru,
                            })}
                          </span>
                        </div>
                        <p className="font-semibold text-base mt-2 truncate">
                          Заказчик:{" "}
                          <span className="text-foreground">
                            {booking.customerName}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {booking.customerEmail} •{" "}
                          {booking.customerPhone || "Нет телефона"}
                        </p>
                        <div className="text-sm mt-3 text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                          <span className="font-semibold block mb-1 text-foreground">
                            Детали:
                          </span>
                          {booking.details || "Детали не указаны"}
                        </div>
                      </div>
                      <div className="md:text-right shrink-0 bg-muted/20 p-4 rounded-xl border">
                        <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold mb-1">
                          Стоимость
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {booking.price
                            ? formatCurrency(booking.price)
                            : "Не указана"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events">
          <Card>
            <ScrollArea className="h-[500px] w-full rounded-xl">
              {!performer.events || performer.events.length === 0 ? (
                <div className="text-center py-16">
                  <Map className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Исполнитель еще не создавал событий.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {performer.events.map((event) => (
                    <div
                      key={event.id}
                      className="p-5 flex flex-col md:flex-row gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="h-24 w-36 shrink-0 rounded-lg overflow-hidden bg-muted">
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              event.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              event.status === "active" ? "bg-green-500" : ""
                            }
                          >
                            {event.status === "active"
                              ? "Опубликовано"
                              : "Черновик"}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {format(new Date(event.date), "dd.MM.yyyy HH:mm")}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight mb-2 truncate">
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5" /> {event.city}
                        </p>
                      </div>
                      <div className="md:text-right shrink-0">
                        <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold mb-1">
                          Билет
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {event.price
                            ? formatCurrency(event.price)
                            : "Бесплатно"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
