"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  X,
  Filter,
  CalendarDays,
  Wallet,
  RefreshCcw,
} from "lucide-react";

import { usePaymentsQuery } from "@/services/payment";
import { formatDate } from "@/utils/helper";

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // --- State ---
  const [page, setPage] = useState(1);
  const limit = 15;
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // --- Data Fetching ---
  const { data, isLoading, isError, refetch, isFetching } = usePaymentsQuery(
    page,
    limit,
    startDate,
    endDate,
  );

  // --- Helpers ---
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.meta.totalPages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Байджи для статусов оплаты
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "SUCCESS":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
            Оплачен
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
            Ожидание
          </Badge>
        );
      case "FAILED":
      case "ERROR":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
            Ошибка
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200">
            Возврат
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Неизвестно"}</Badge>;
    }
  };

  // Байджи для провайдеров (способов оплаты)
  const getProviderBadge = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case "yookassa":
        return "💳 ЮKassa";
      case "tinkoff":
        return "🏦 Тинькофф";
      case "stripe":
        return "💳 Stripe";
      case "sbp":
        return "📱 СБП";
      case "cash":
        return "💵 Наличные";
      default:
        return provider || "Неизвестно";
    }
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center">
        <Loader2 className="animate-spin h-8 w-8 mb-2 text-primary" />
        <p>Загрузка истории платежей...</p>
      </div>
    );

  if (isError)
    return (
      <div className="py-20 text-center text-red-500 flex flex-col items-center">
        <X className="h-10 w-10 mb-2" />
        <p>Ошибка загрузки данных. Пожалуйста, обновите страницу.</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> История платежей
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Все транзакции внутри платформы
          </p>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full xl:w-auto">
          <div className="flex items-center gap-2 px-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Период:
            </span>
          </div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="h-9 w-[130px] sm:w-[140px] text-sm bg-slate-50 border-slate-200"
          />
          <span className="text-slate-400">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="h-9 w-[130px] sm:w-[140px] text-sm bg-slate-50 border-slate-200"
          />

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-9 w-9 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 w-9 ml-auto sm:ml-0 bg-white hover:bg-slate-50"
          >
            <RefreshCcw
              className={`h-4 w-4 text-slate-600 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="font-bold text-slate-600">
                ID / Дата
              </TableHead>
              <TableHead className="font-bold text-slate-600">
                Пользователь
              </TableHead>
              <TableHead className="font-bold text-slate-600">
                Назначение платежа
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-right">
                Сумма
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-center">
                Провайдер
              </TableHead>
              <TableHead className="font-bold text-slate-600 text-center">
                Статус
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span
                        className="text-xs font-mono text-slate-400"
                        title={payment.id}
                      >
                        {payment.id.substring(0, 8)}...
                      </span>
                      <span className="text-sm font-medium text-slate-900 mt-1">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.user ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {payment.user.name || "Без имени"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {payment.user.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Системный</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p
                      className="text-sm text-slate-700 max-w-[250px] truncate"
                      title={payment.description}
                    >
                      {payment.description || "Не указано"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-black text-slate-900 whitespace-nowrap">
                      {/* Если у вас в Prisma amount хранится в копейках, используйте: (payment.amount / 100).toLocaleString("ru-RU") */}
                      {payment.amount.toLocaleString("ru-RU")}{" "}
                      {payment.currency || "₽"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium text-slate-600 whitespace-nowrap">
                    {getProviderBadge(payment.provider)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(payment.status)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="h-8 w-8 text-slate-300 mb-2" />
                    <p>За выбранный период платежи не найдены.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2 bg-white px-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium hidden sm:block">
            Показано{" "}
            <span className="font-bold text-slate-900">
              {(page - 1) * limit + 1}
            </span>{" "}
            -{" "}
            <span className="font-bold text-slate-900">
              {Math.min(page * limit, data.meta.total)}
            </span>{" "}
            из{" "}
            <span className="font-bold text-slate-900">{data.meta.total}</span>
          </p>
          <Pagination className="justify-end w-full sm:w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-slate-100"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm font-semibold text-slate-700">
                  {page} / {data.meta.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page === data.meta.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-slate-100"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
