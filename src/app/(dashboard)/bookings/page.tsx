"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/components/providers/socket-provider"; // Your existing socket provider
import {
  fetchAllBookings,
  updateBookingStatus,
  deleteBooking,
  Booking,
  BookingStatus,
} from "@/services/bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// --- Helper: Status Badge Colors ---
const getStatusBadge = (status: BookingStatus) => {
  const styles: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    COMPLETED:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    REJECTED: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    CANCELLED: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
    DISPUTED:
      "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
  };

  const labels: Record<string, string> = {
    PENDING: "Ожидает",
    CONFIRMED: "Подтвержден",
    COMPLETED: "Завершен",
    REJECTED: "Отклонен",
    CANCELLED: "Отменен",
    DISPUTED: "Спор",
  };

  return (
    <Badge variant="outline" className={styles[status] || styles.PENDING}>
      {labels[status] || status}
    </Badge>
  );
};

export default function AdminBookingsPage() {
  const { socket } = useSocket();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL",
  );

  // Action States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. Fetch Data ---
  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список бронирований.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // --- 2. Real-Time Listener ---
  useEffect(() => {
    if (!socket) return;

    // Listen for global booking updates (e.g., customer books, performer accepts)
    const handleBookingUpdate = (event: any) => {
      if (event.type === "BOOKING_UPDATE" || event.type === "NEW_BOOKING") {
        // Option A: Optimistic update (complex)
        // Option B: Simple Refetch (recommended for admin panels to ensure consistency)
        loadBookings();
        toast({
          title: "Обновление",
          description: "Список бронирований обновлен.",
        });
      }
    };

    socket.on("app_event", handleBookingUpdate); // Assuming your backend emits generic app_events
    // Or specifically: socket.on("booking_updated", loadBookings);

    return () => {
      socket.off("app_event", handleBookingUpdate);
    };
  }, [socket]);

  // --- 3. Handlers ---
  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    setIsProcessing(true);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
      );
      toast({
        title: "Статус обновлен",
        description: `Бронирование переведено в статус ${newStatus}`,
      });
      setIsDetailsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить статус.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Вы уверены? Это удалит историю бронирования навсегда."))
      return;
    setIsProcessing(true);
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      toast({ title: "Удалено", description: "Бронирование удалено из базы." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить запись.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 4. Filtering Logic ---
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.performer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Управление бронированиями
          </h1>
          <p className="text-muted-foreground">
            Мониторинг и управление запросами между клиентами и исполнителями.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadBookings}>
            Обновить
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ID, имени клиента или исполнителя..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground mr-2" />
          {[
            "ALL",
            "PENDING",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED",
            "DISPUTED",
          ].map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setStatusFilter(status as any)}
            >
              {status === "ALL" ? "Все" : status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Дата / ID</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Исполнитель</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    Загрузка...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Записей не найдено.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.date), "dd MMM yyyy", {
                          locale: ru,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{booking.id.slice(-6)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.customer.image} />
                        <AvatarFallback>
                          {booking.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {booking.customer.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.customer.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Performer */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarImage src={booking.performer.image} />
                        <AvatarFallback>
                          {booking.performer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {booking.performer.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.performer.category || "Артист"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(booking.status)}</TableCell>

                  <TableCell>
                    <span className="font-semibold text-slate-700">
                      {booking.amount > 0
                        ? `${booking.amount.toLocaleString()} ₽`
                        : "По довг."}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Подробнее
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(booking.id, "CONFIRMED")
                          }
                        >
                          Подтвердить принудительно
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(booking.id, "CANCELLED")
                          }
                          className="text-red-600"
                        >
                          Отменить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      {selectedBooking && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Детали бронирования #{selectedBooking.id.slice(-6)}
              </DialogTitle>
              <DialogDescription>
                Создано:{" "}
                {format(
                  new Date(selectedBooking.createdAt),
                  "dd MMM yyyy HH:mm",
                  { locale: ru },
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Status Alert */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <span className="text-sm text-muted-foreground">
                  Текущий статус:
                </span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Details Text */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Детали мероприятия:</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md min-h-[60px]">
                  {selectedBooking.details || "Описание отсутствует"}
                </p>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs uppercase text-muted-foreground font-bold">
                    Клиент
                  </h4>
                  <p className="text-sm font-medium">
                    {selectedBooking.customer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedBooking.customer.phone || "Нет телефона"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs uppercase text-muted-foreground font-bold">
                    Исполнитель
                  </h4>
                  <p className="text-sm font-medium">
                    {selectedBooking.performer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedBooking.performer.email}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedBooking.status === "PENDING" && (
                <>
                  <Button
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      handleStatusChange(selectedBooking.id, "CONFIRMED")
                    }
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      handleStatusChange(selectedBooking.id, "REJECTED")
                    }
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Отклонить
                  </Button>
                </>
              )}

              {selectedBooking.status !== "PENDING" && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(selectedBooking.id)}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Удалить запись
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
