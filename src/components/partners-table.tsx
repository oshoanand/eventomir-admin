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
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
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
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, formatDate } from "@/utils/helper";
import { apiRequest } from "@/utils/api-client";

import { ModerationStatusCell } from "@/components/ModerationStatusCell";

import {
  usePartnersQuery,
  useUpdateModerationMutation,
  useDeletePartnerMutation,
  checkLinkedUsers,
  Partner,
} from "@/services/partner";

import { useChatStore } from "@/store/useChatStore";

export default function PartnersTable() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const connectSocket = useChatStore((state) => state.connectSocket);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      connectSocket(session.user.id as string);
    }
  }, [status, session, connectSocket]);

  // --- State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCheckingLinks, setIsCheckingLinks] = useState(false);
  const [linkedStats, setLinkedStats] = useState({
    performers: 0,
    customers: 0,
  });

  // --- Data Fetching ---
  const { data, isLoading, isError } = usePartnersQuery(page, limit, search);
  const { mutate: updateModeration, isPending: isUpdating } =
    useUpdateModerationMutation();
  const { mutate: deletePartner, isPending: isDeleting } =
    useDeletePartnerMutation();

  // --- Helpers ---
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.meta.totalPages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  const handleOpenEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setNewStatus((partner as any).moderationStatus?.toUpperCase() || "PENDING");
    setIsEditModalOpen(true);
  };

  const handleStartChat = async (partnerId: string) => {
    toast({ title: "Подключение...", description: "Инициализация чата." });
    try {
      const res = await apiRequest<{ partnerId: string }>({
        method: "POST",
        url: "/api/chats/init",
        data: { partnerId: partnerId },
      });
      if (res?.partnerId) router.push(`/chat/${res.partnerId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось открыть чат.",
      });
    }
  };

  const handleSaveStatus = () => {
    if (!selectedPartner) return;
    updateModeration(
      { id: selectedPartner.id, status: newStatus.toUpperCase() },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: "Успех",
            description: "Статус модерации обновлен.",
          });
          setIsEditModalOpen(false);
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: error.message || "Не удалось обновить статус.",
          });
        },
      },
    );
  };

  // --- Delete Logic ---
  const handleOpenDelete = async (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDeleteModalOpen(true);
    setIsCheckingLinks(true);

    try {
      const stats = await checkLinkedUsers(partner.id);
      setLinkedStats({
        performers: stats.linkedPerformers,
        customers: stats.linkedCustomers,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось проверить связанные профили.",
      });
    } finally {
      setIsCheckingLinks(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedPartner) return;

    deletePartner(selectedPartner.id, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Успех",
          description: "Партнер успешно удален.",
        });
        setIsDeleteModalOpen(false);
        setSelectedPartner(null);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.message || "Не удалось удалить партнера.",
        });
      },
    });
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
        <Loader2 className="animate-spin h-8 w-8 mb-2" />
        <p>Загрузка Партнеры...</p>
      </div>
    );

  if (isError)
    return (
      <div className="py-20 text-center text-red-500 flex flex-col items-center">
        <X className="h-10 w-10 mb-2" />
        <p>Ошибка загрузки данных.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, email или городу..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

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
              data.data.map((partner) => {
                const isOnline = onlineUsers.has(partner.id);
                return (
                  <TableRow key={partner.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={partner.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {partner.name?.substring(0, 2).toUpperCase() ||
                                "UN"}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white transition-colors duration-300 ${
                              isOnline ? "bg-green-500" : "bg-gray-300"
                            }`}
                            title={isOnline ? "Online" : "Offline"}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-gray-900 truncate">
                            {partner.name || "Исполнитель"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-foreground truncate max-w-[200px]">
                          {partner.email}
                        </span>
                        <span className="text-muted-foreground">
                          {formatPhoneNumber(partner.phone)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <p className="font-medium leading-none truncate">
                          {partner.city || "Город не указан"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(partner.createdAt)}
                    </TableCell>
                    <ModerationStatusCell status={partner.moderationStatus} />
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onClick={() => handleStartChat(partner.id)}
                            className="cursor-pointer"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" /> Написать
                            сообщение
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(partner)}
                            className="cursor-pointer"
                          >
                            <UserCheck className="mr-2 h-4 w-4" /> Изменить
                            статус
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/partners/view/${partner.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> Детальный
                              просмотр
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDelete(partner)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          >
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
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Партнеры не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- PAGINATION --- */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            Показано{" "}
            <span className="font-medium">{(page - 1) * limit + 1}</span> -{" "}
            <span className="font-medium">
              {Math.min(page * limit, data.meta.total)}
            </span>{" "}
            из <span className="font-medium">{data.meta.total}</span>
          </p>
          <Pagination className="justify-end w-auto mx-0">
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

      {/* --- EDIT STATUS MODAL --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Модерация Партнер</DialogTitle>
            <DialogDescription>
              Измените статус для пользователя{" "}
              <strong className="text-foreground">
                {selectedPartner?.name || "Партнер"}
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

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSaveStatus}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md border-red-100">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Угроза потери данных
            </DialogTitle>
            <DialogDescription className="pt-3 text-slate-700">
              Вы собираетесь безвозвратно удалить аккаунт{" "}
              <strong>{selectedPartner?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {isCheckingLinks ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Проверка связанных профилей...</span>
              </div>
            ) : (
              (linkedStats.performers > 0 || linkedStats.customers > 0) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 space-y-2">
                  <p className="font-semibold">
                    Внимание! У этого партнера есть привязанные пользователи:
                  </p>
                  <ul className="list-disc pl-5">
                    {linkedStats.performers > 0 && (
                      <li>Исполнителей: {linkedStats.performers}</li>
                    )}
                    {linkedStats.customers > 0 && (
                      <li>Заказчиков: {linkedStats.customers}</li>
                    )}
                  </ul>
                  <p className="pt-2">
                    Если вы удалите партнера, его запись и профиль партнера
                    будут безвозвратно удалены.
                  </p>
                </div>
              )
            )}
            {!isCheckingLinks &&
              linkedStats.performers === 0 &&
              linkedStats.customers === 0 && (
                <p className="text-sm text-muted-foreground">
                  У данного партнера нет привязанных пользователей. Удаление
                  пройдет безопасно.
                </p>
              )}
          </div>

          <DialogFooter className="sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting || isCheckingLinks}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Удалить безвозвратно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
