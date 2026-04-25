"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  MoreHorizontal,
  Loader2,
  X,
  MessageSquare,
  UserCheck,
  Trash2,
  Eye,
  Search,
} from "lucide-react";
import { ModerationStatusCell } from "@/components/ModerationStatusCell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, formatDate } from "@/utils/helper";
import { apiRequest } from "@/utils/api-client";

import {
  useCustomersQuery,
  useUpdateModerationMutation,
  Customer,
} from "@/services/customer";
import { useChatStore } from "@/store/useChatStore";

export default function CustomersTable() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Socket & Real-time State
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const connectSocket = useChatStore((state) => state.connectSocket);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      connectSocket(session.user.id);
    }
  }, [status, session, connectSocket]);

  // Table State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  // Queries
  const { data, isLoading, isError } = useCustomersQuery(page, limit, search);
  const { mutate: updateModeration, isPending: isUpdating } =
    useUpdateModerationMutation();

  // UI State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<string>("");

  // --- Helpers ---

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.meta.totalPages || 1)) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "ellipsis",
          totalPages,
        );
      }
    }
    return pages;
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewStatus((customer as any).moderation_status || "PENDING");
    setIsEditModalOpen(true);
  };

  const handleStartChat = async (customerId: string) => {
    toast({
      title: "Подключение...",
      description: "Открываем диалог с пользователем.",
    });
    try {
      const res = await apiRequest<{ partnerId: string }>({
        method: "POST",
        url: "/api/chats/init",
        data: { partnerId: customerId },
      });
      if (res?.partnerId) router.push(`/chat/${res.partnerId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать чат.",
      });
    }
  };

  const handleSaveStatus = () => {
    if (!selectedCustomer) return;
    updateModeration(
      { id: selectedCustomer.id, status: newStatus },
      {
        onSuccess: () => {
          toast({ title: "Успех", description: "Статус обновлен." });
          setIsEditModalOpen(false);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Не удалось обновить статус.",
          });
        },
      },
    );
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex flex-col py-20 items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Загрузка списка заказчиков...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col py-20 items-center justify-center text-red-500">
        <X className="h-10 w-10 mb-2" />
        <p>Ошибка загрузки данных.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или email..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Пользователь</TableHead>
              <TableHead>Контактные данные</TableHead>
              <TableHead>Город</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((customer) => {
                const isOnline = onlineUsers.has(customer.id);
                return (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={customer.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {customer.name?.slice(0, 2).toUpperCase() || "CU"}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                              isOnline ? "bg-green-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium leading-none truncate">
                            {customer.name || "Без имени"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {customer.id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-foreground truncate max-w-[200px]">
                          {customer.email}
                        </span>
                        <span className="text-muted-foreground">
                          {formatPhoneNumber(customer.phone)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <p className="font-medium leading-none truncate">
                          {customer.city || "Город не указан"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <ModerationStatusCell status={customer.moderationStatus} />

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleStartChat(customer.id)}
                            className="cursor-pointer"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" /> Написать
                            сообщение
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(customer)}
                            className="cursor-pointer"
                          >
                            <UserCheck className="mr-2 h-4 w-4" /> Изменить
                            статус
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/users/customers/view/${customer.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> Детальный
                              просмотр
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Заказчики не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Показано{" "}
            <span className="font-medium">{(page - 1) * limit + 1}</span> -{" "}
            <span className="font-medium">
              {Math.min(page * limit, data.meta.total)}
            </span>{" "}
            из <span className="font-medium">{data.meta.total}</span>
          </p>
          <Pagination className="sm:justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers(page, data.meta.totalPages).map((pNum, i) => (
                <PaginationItem key={i}>
                  {pNum === "ellipsis" ? (
                    <span className="px-3 py-2 text-muted-foreground">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(pNum as number)}
                      isActive={page === pNum}
                      className="cursor-pointer"
                    >
                      {pNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page === data.meta.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Moderation Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обновить статус модерации</DialogTitle>
            <DialogDescription>
              Изменение статуса для пользователя{" "}
              <strong className="text-foreground">
                {selectedCustomer?.name || "Заказчика"}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">✅ Одобрен</SelectItem>
                <SelectItem value="PENDING">⏳ На проверке</SelectItem>
                <SelectItem value="REJECTED">❌ Отклонен</SelectItem>
                <SelectItem value="BLOCKED">🚫 Заблокирован</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveStatus} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
