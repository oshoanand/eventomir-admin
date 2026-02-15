"use client";

import { useState } from "react";
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
import { MoreHorizontal, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, formatDate } from "@/utils/helper";

// Import your queries and mutations
import {
  useCustomersQuery,
  useUpdateModerationMutation,
  Customer,
} from "@/data/use-customers";

export default function CustomersTable() {
  const { toast } = useToast();

  // Table State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Data Hooks
  const { data, isLoading, isError } = useCustomersQuery(page, limit);
  const { mutate: updateModeration, isPending: isUpdating } =
    useUpdateModerationMutation();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex flex-row py-16 align-middle items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-green-700" />
        <span className="text-green-500">Получение данных...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-row py-16 align-middle items-center justify-center">
        <X className="mr-2 h-4 w-4 text-red-600" />
        <span className="text-red-500">Что-то пошло не так!</span>
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.meta.totalPages || 1)) {
      setPage(newPage);
    }
  };

  // Open the edit modal and set the target user
  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewStatus(customer.moderation_status);
    setIsEditModalOpen(true);
  };

  // Submit the mutation
  const handleSaveStatus = () => {
    if (!selectedCustomer) return;

    updateModeration(
      { id: selectedCustomer.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: "Успех",
            description: "Статус модерации успешно обновлен.",
          });
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Пользователь</TableHead>
            <TableHead>Электронная почта</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Статус модерации</TableHead>
            <TableHead>...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((performer) => (
            <TableRow key={performer.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={performer.profile_picture || ""} />
                    <AvatarFallback>
                      {performer.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPhoneNumber(performer.phone)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{performer.email}</TableCell>
              <TableCell>{formatDate(performer.created_at)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    performer.status === "active" ? "default" : "destructive"
                  }
                >
                  {performer.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    performer.moderation_status === "approved"
                      ? "default"
                      : "destructive"
                  }
                >
                  {performer.moderation_status}
                </Badge>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(performer)}>
                      Изменить статус
                    </DropdownMenuItem>
                    <DropdownMenuItem>Подробности</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              aria-disabled={page === 1}
              className={
                page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
          {Array.from({ length: data?.meta.totalPages || 1 }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i + 1)}
                isActive={page === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              aria-disabled={page === data?.meta.totalPages}
              className={
                page === data?.meta.totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* --- EDIT MODAL --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить статус модерации</DialogTitle>
            <DialogDescription>
              Выберите новый статус для пользователя{" "}
              <span className="font-semibold">{selectedCustomer?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_approval">
                  Ожидает проверки (pending_approval)
                </SelectItem>
                <SelectItem value="approved">Одобрен (approved)</SelectItem>
                <SelectItem value="rejected">Отклонен (rejected)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveStatus}
              disabled={
                isUpdating || newStatus === selectedCustomer?.moderation_status
              }
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
