"use client";

import { useState } from "react";
import {
  useSupportTickets,
  useResolveTicket,
  SupportTicket,
} from "@/services/support";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatMobile } from "@/utils/utils";
import {
  Loader2,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
  const { toast } = useToast();
  // Dialog State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState<string>("RESOLVED");

  // ==========================================
  // DATA FETCHING (Интеграция чистых хуков)
  // ==========================================
  const {
    data: tickets = [],
    isLoading,
    isRefetching,
    refetch,
  } = useSupportTickets();

  const resolveMutation = useResolveTicket(
    () => {
      toast({
        variant: "success",
        title: "Тикет обновлен и пользователь уведомлен!",
      });

      setSelectedTicket(null);
    },
    (error) => {
      toast({
        variant: "destructive",
        title: error.response?.data?.message || "Ошибка при обновлении тикета",
      });
    },
  );

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleResolve = () => {
    if (!selectedTicket) return;
    resolveMutation.mutate({
      id: selectedTicket.id,
      status: newStatus,
      adminReply: replyText,
    });
  };

  // Helper for Status Badge Color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "IN_PROGRESS":
      case "WAITING_ON_CUSTOMER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTicketType = (type: string) => {
    const types: Record<string, string> = {
      BUG_REPORT: "Ошибка",
      FEATURE_REQUEST: "Идея/Предложение",
      BILLING: "Оплата",
      TECHNICAL_SUPPORT: "Тех. поддержка",
      GENERAL_INQUIRY: "Общий вопрос",
      OTHER: "Другое",
    };
    return types[type] || type;
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Служба поддержки
          </h2>
          <p className="text-muted-foreground mt-1">
            Управление обращениями и контроль качества сервиса (SLA).
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isRefetching}
          className="rounded-xl shadow-sm"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Обновить
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-3xl shadow-sm border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold whitespace-nowrap">
                  ID Тикета
                </TableHead>
                <TableHead className="font-bold">Статус</TableHead>
                <TableHead className="font-bold">Клиент</TableHead>
                <TableHead className="font-bold">Тип обращения</TableHead>
                <TableHead className="font-bold">Сообщение</TableHead>
                <TableHead className="font-bold">Дата создания</TableHead>
                <TableHead className="text-right font-bold">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/40" />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-48 text-center text-muted-foreground"
                  >
                    <MessageSquare className="mx-auto h-10 w-10 opacity-20 mb-3" />
                    <p className="font-medium">Активных обращений нет</p>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      #{ticket.ticket_number}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-bold ${getStatusBadge(ticket.status)}`}
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">
                          {ticket.requester?.name || "Гость"}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mt-0.5">
                          {ticket.contact_mobile
                            ? formatMobile(ticket.contact_mobile)
                            : "Нет телефона"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-medium bg-muted"
                      >
                        {formatTicketType(ticket.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="truncate text-sm font-medium text-foreground">
                        {ticket.description}
                      </p>
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="flex items-center text-xs text-blue-600 mt-1 font-medium">
                          <Paperclip className="w-3 h-3 mr-1" />
                          Вложения ({ticket.attachments.length})
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {format(
                        new Date(ticket.created_at),
                        "d MMM yyyy, HH:mm",
                        { locale: ru },
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="font-bold shadow-sm rounded-lg"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setReplyText("");
                          setNewStatus(
                            ticket.status === "OPEN"
                              ? "IN_PROGRESS"
                              : ticket.status,
                          );
                        }}
                      >
                        Открыть
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- DETAIL DIALOG --- */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 rounded-[2rem]">
          <div className="bg-muted/40 p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                Тикет #{selectedTicket?.ticket_number}
                {selectedTicket && (
                  <Badge
                    variant="outline"
                    className={getStatusBadge(selectedTicket.status)}
                  >
                    {selectedTicket.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Создано:{" "}
                {selectedTicket
                  ? format(
                      new Date(selectedTicket.created_at),
                      "PPP 'в' HH:mm",
                      { locale: ru },
                    )
                  : ""}
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedTicket && (
            <div className="p-6 grid gap-6 max-h-[70vh] overflow-y-auto">
              {/* 1. User Info & Message */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border shadow-sm p-4 rounded-2xl">
                  <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    Телефон клиента
                  </Label>
                  <p className="font-bold text-base mt-1">
                    {selectedTicket.contact_mobile
                      ? formatMobile(selectedTicket.contact_mobile)
                      : "Не указан"}
                  </p>
                </div>
                <div className="bg-background border shadow-sm p-4 rounded-2xl">
                  <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    Категория
                  </Label>
                  <p className="font-bold text-base mt-1">
                    {formatTicketType(selectedTicket.type)}
                  </p>
                </div>

                <div className="col-span-2 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                  <Label className="text-xs text-blue-800 font-bold uppercase tracking-wider">
                    Описание проблемы
                  </Label>
                  <p className="text-[15px] mt-2 text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* 2. Image Proofs */}
              {selectedTicket.attachments &&
                selectedTicket.attachments.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Вложения ({selectedTicket.attachments.length})
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTicket.attachments.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative h-48 w-full rounded-2xl overflow-hidden border bg-muted/30 group"
                        >
                          <img
                            src={url}
                            alt={`Вложение ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2 backdrop-blur-sm"
                          >
                            <ExternalLink className="h-5 w-5" /> Открыть
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 3. Admin Action Area */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="font-bold text-lg">Решение проблемы</h3>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Изменить статус
                    </Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="h-12 font-bold rounded-xl bg-background border shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN" className="font-medium">
                          Открыт (Open)
                        </SelectItem>
                        <SelectItem
                          value="IN_PROGRESS"
                          className="font-medium text-blue-600"
                        >
                          В работе (In Progress)
                        </SelectItem>
                        <SelectItem
                          value="WAITING_ON_CUSTOMER"
                          className="font-medium text-amber-600"
                        >
                          Ожидание ответа клиента
                        </SelectItem>
                        <SelectItem
                          value="RESOLVED"
                          className="font-medium text-emerald-600"
                        >
                          Решен (Resolved)
                        </SelectItem>
                        <SelectItem
                          value="CLOSED"
                          className="font-medium text-gray-500"
                        >
                          Закрыт (Closed)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Ответ клиенту (Получит Push-уведомление)
                    </Label>
                    <Textarea
                      placeholder="Опишите, как была решена проблема, или запросите дополнительные данные..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[120px] resize-none rounded-xl bg-background border shadow-sm text-[15px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted/40 p-5 border-t flex justify-end gap-3 rounded-b-[2rem]">
            <Button
              variant="outline"
              className="rounded-xl font-bold h-12 px-6"
              onClick={() => setSelectedTicket(null)}
            >
              Отмена
            </Button>
            <Button
              className="rounded-xl font-bold h-12 px-8 shadow-md"
              onClick={handleResolve}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Сохранить и отправить"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
