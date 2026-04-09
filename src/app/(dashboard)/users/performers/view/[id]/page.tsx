"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest } from "@/utils/api-client";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  ArrowLeft,
  User,
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
} from "lucide-react";

// Types corresponding to the mapped backend response
interface AdminPerformerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  accountType: string;
  companyName?: string;
  inn?: string;
  description: string;
  profilePicture: string;
  backgroundPicture: string;
  roles: string[];
  priceRange: number[];
  moderationStatus: string;
  status: string;
  createdAt: string;
  gallery: any[];
  certificates: any[];
  recommendationLetters: any[];
  bookings: any[];
  events: any[];
}

export default function PerformerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: performer,
    isLoading,
    isError,
  } = useQuery<AdminPerformerDetails>({
    queryKey: ["admin", "performer", id],
    queryFn: async () => {
      return await apiRequest({
        method: "get",
        url: `/api/admin/performers/${id}`, // Match your backend route here
      });
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ru-RU").format(amount) + " ₽";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-3">
            Детали исполнителя
            <Badge
              variant={
                performer.status === "active" ? "default" : "destructive"
              }
              className="ml-2"
            >
              {performer.status === "active" ? "Активен" : "Заблокирован"}
            </Badge>
            <Badge
              variant={
                performer.moderationStatus === "approved"
                  ? "default"
                  : "secondary"
              }
            >
              {performer.moderationStatus === "approved"
                ? "Модерация пройдена"
                : "Ожидает модерации"}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">ID: {performer.id}</p>
        </div>
      </div>

      {/* Main Profile Banner */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-48 bg-muted relative">
          {performer.backgroundPicture ? (
            <img
              src={performer.backgroundPicture}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5" />
          )}
        </div>
        <CardContent className="relative pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:-mt-12 mb-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={performer.profilePicture} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {performer.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-bold">{performer.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />{" "}
                  {performer.city || "Город не указан"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {performer.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />{" "}
                  {performer.phone || "Телефон не указан"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">О себе</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {performer.description || "Описание отсутствует."}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Специализации</h3>
                <div className="flex flex-wrap gap-2">
                  {performer.roles.length > 0 ? (
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

            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Тип аккаунта
                </span>
                <p className="font-medium">
                  {performer.accountType === "individual"
                    ? "Физ. лицо"
                    : performer.accountType === "agency"
                      ? "Агентство"
                      : performer.accountType}
                </p>
              </div>
              {performer.companyName && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">
                    Компания
                  </span>
                  <p className="font-medium">
                    {performer.companyName} (ИНН: {performer.inn})
                  </p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Бюджет
                </span>
                <p className="font-medium text-primary">
                  {performer.priceRange?.length
                    ? `от ${formatCurrency(performer.priceRange[0])}`
                    : "По договоренности"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Регистрация
                </span>
                <p className="font-medium">
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
            {performer.gallery.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="py-3">
            <FileText className="h-4 w-4 mr-2" /> Документы (
            {performer.certificates.length +
              performer.recommendationLetters.length}
            )
          </TabsTrigger>
          <TabsTrigger value="bookings" className="py-3">
            <CalendarCheck className="h-4 w-4 mr-2" /> Брони (
            {performer.bookings.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="py-3">
            <Map className="h-4 w-4 mr-2" /> События ({performer.events.length})
          </TabsTrigger>
        </TabsList>

        {/* GALLERY TAB */}
        <TabsContent value="portfolio" className="space-y-4">
          {performer.gallery.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed">
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
                      {item.moderationStatus === "approved"
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
            {performer.certificates.length === 0 ? (
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
            {performer.recommendationLetters.length === 0 ? (
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
              {performer.bookings.length === 0 ? (
                <div className="text-center py-12">
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
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {booking.status === "confirmed"
                              ? "Подтверждено"
                              : booking.status === "pending"
                                ? "Ожидает"
                                : "Отменено"}
                          </Badge>
                          <span className="text-sm font-semibold flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />{" "}
                            {format(new Date(booking.date), "dd MMMM yyyy", {
                              locale: ru,
                            })}
                          </span>
                        </div>
                        <p className="font-medium text-base mt-2">
                          Заказчик: {booking.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.customerEmail} • {booking.customerPhone}
                        </p>
                        <p className="text-sm mt-2 text-muted-foreground bg-muted p-2 rounded-md">
                          Детали: {booking.details}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">
                          Стоимость заказа
                        </span>
                        <span className="text-lg font-bold text-primary">
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
              {performer.events.length === 0 ? (
                <div className="text-center py-12">
                  <Map className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Исполнитель еще не создавал собственных событий.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {performer.events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 flex flex-col md:flex-row gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="h-20 w-32 shrink-0 rounded-md overflow-hidden bg-muted">
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              event.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {event.status === "published"
                              ? "Опубликовано"
                              : "Черновик"}
                          </Badge>
                          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />{" "}
                            {format(new Date(event.date), "dd.MM.yyyy HH:mm")}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight mb-1">
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> {event.city}
                        </p>
                      </div>
                      <div className="md:text-right shrink-0">
                        <span className="text-xs text-muted-foreground block">
                          Билет
                        </span>
                        <span className="text-lg font-bold text-primary">
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
