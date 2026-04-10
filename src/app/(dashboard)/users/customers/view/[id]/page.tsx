"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest } from "@/utils/api-client";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Icons
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Activity,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";

// --- Data Interfaces ---
interface CustomerBooking {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: string;
  performerName: string;
  performerEmail: string;
  price: number;
  details: string;
}

interface PaidRequest {
  id: string;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  amount: number;
  description: string;
}

interface AdminCustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  profilePicture: string;
  moderationStatus: string;
  status: string;
  createdAt: string;
  bookings: CustomerBooking[];
  paidRequests: PaidRequest[];
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    totalPaidRequests: number;
  };
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  // --- Data Fetching ---
  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery<AdminCustomerDetails>({
    queryKey: ["admin", "customer", id],
    queryFn: async () => {
      return await apiRequest({
        method: "get",
        url: `/api/admin/customers/${id}`,
      });
    },
    enabled: !!id,
  });

  // --- Handlers ---
  const handleStartChat = async () => {
    toast({
      title: "Создание чата...",
      description: "Пожалуйста, подождите. Идет настройка комнаты.",
    });

    try {
      const res = await apiRequest<{ id: string }>({
        method: "POST",
        url: "/api/chats",
        data: { participantId: id },
      });

      if (res && res.id) {
        router.push(`/chat/${res.id}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось открыть чат с заказчиком",
      });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ru-RU").format(amount) + " ₽";

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // --- Error State ---
  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-destructive mb-2">Ошибка</h2>
        <p className="text-muted-foreground mb-6">
          Не удалось загрузить данные заказчика.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Вернуться назад
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex flex-wrap items-center gap-3">
              Профиль заказчика
              <Badge
                variant={
                  customer.status === "active" ? "default" : "destructive"
                }
                className={
                  customer.status === "active"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
              >
                {customer.status === "active" ? "Активен" : "Заблокирован"}
              </Badge>
              <Badge
                variant={
                  customer.moderationStatus === "approved"
                    ? "default"
                    : "secondary"
                }
              >
                {customer.moderationStatus === "approved"
                  ? "Модерация пройдена"
                  : customer.moderationStatus === "rejected"
                    ? "Отклонен"
                    : "Ожидает модерации"}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {customer.id}
            </p>
          </div>
        </div>

        <Button onClick={handleStartChat} className="shrink-0">
          <MessageSquare className="mr-2 h-4 w-4" />
          Написать сообщение
        </Button>
      </div>

      {/* --- MAIN PROFILE CARD --- */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900 relative" />
        <CardContent className="relative pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:-mt-10 mb-6">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg bg-white">
              <AvatarImage src={customer.profilePicture} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                {customer.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-bold">{customer.name}</h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary/70" />{" "}
                  {customer.city || "Город не указан"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary/70" /> {customer.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-primary/70" />{" "}
                  {customer.phone || "Телефон не указан"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary/70" />
                  Регистрация:{" "}
                  {format(new Date(customer.createdAt), "dd MMM yyyy", {
                    locale: ru,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- QUICK STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <ListOrdered className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Всего бронирований
              </p>
              <h3 className="text-2xl font-bold">
                {customer.stats?.totalBookings || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Успешные брони
              </p>
              <h3 className="text-2xl font-bold">
                {customer.stats?.confirmedBookings || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Платные запросы
              </p>
              <h3 className="text-2xl font-bold">
                {customer.stats?.totalPaidRequests || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- TABS --- */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md h-auto mb-6">
          <TabsTrigger value="bookings" className="py-3">
            <CalendarCheck className="h-4 w-4 mr-2" /> Бронирования (
            {customer.bookings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="paid_requests" className="py-3">
            <CreditCard className="h-4 w-4 mr-2" /> Платные запросы (
            {customer.paidRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings">
          <Card>
            <ScrollArea className="h-[500px] w-full rounded-xl">
              {!customer.bookings || customer.bookings.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Нет бронирований
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Этот заказчик еще не бронировал услуги исполнителей.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {customer.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={
                              booking.status === "confirmed" ||
                              booking.status === "completed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {booking.status === "confirmed"
                              ? "Подтверждено"
                              : booking.status === "completed"
                                ? "Завершено"
                                : booking.status === "pending"
                                  ? "Ожидает"
                                  : "Отменено"}
                          </Badge>
                          <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            {format(new Date(booking.date), "dd MMMM yyyy", {
                              locale: ru,
                            })}
                          </span>
                        </div>
                        <p className="font-semibold text-base mt-2">
                          Исполнитель:{" "}
                          <span className="text-primary">
                            {booking.performerName}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.performerEmail}
                        </p>
                        <div className="text-sm mt-3 text-gray-600 dark:text-gray-300 bg-muted/50 p-3 rounded-lg border">
                          <span className="font-semibold block mb-1">
                            Детали заказа:
                          </span>
                          {booking.details || "Детали не указаны"}
                        </div>
                      </div>
                      <div className="md:text-right shrink-0 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border">
                        <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold mb-1">
                          Стоимость
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
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

        {/* PAID REQUESTS TAB */}
        <TabsContent value="paid_requests">
          <Card>
            <ScrollArea className="h-[500px] w-full rounded-xl">
              {!customer.paidRequests || customer.paidRequests.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Нет платных запросов
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    История транзакций пуста.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {customer.paidRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={
                              request.status === "paid"
                                ? "default"
                                : request.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              request.status === "paid"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {request.status === "paid"
                              ? "Оплачено"
                              : request.status === "pending"
                                ? "В обработке"
                                : "Ошибка"}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground">
                            {format(
                              new Date(request.createdAt),
                              "dd.MM.yyyy HH:mm",
                              { locale: ru },
                            )}
                          </span>
                        </div>
                        <p className="font-medium mt-2">
                          Назначение:{" "}
                          {request.description || "Оплата услуг платформы"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          ID Транзакции: {request.id}
                        </p>
                      </div>
                      <div className="md:text-right shrink-0">
                        <span className="text-lg font-bold">
                          {formatCurrency(request.amount)}
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
