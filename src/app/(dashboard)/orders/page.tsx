"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CreditCard, CheckCircle2, Ticket } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Import the hook we just created
import { useAdminOrdersQuery } from "@/data/use-orders";

export default function AdminOrdersPage() {
  // Use React Query for data fetching
  const { data: orders = [], isLoading } = useAdminOrdersQuery();

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> История покупок
          </CardTitle>
          <CardDescription>
            Список всех проданных билетов и транзакций платформы.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Заказа</TableHead>
                  <TableHead>Событие</TableHead>
                  <TableHead>Клиент (ID)</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Загрузка транзакций...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Транзакций пока нет.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {order.id.split("-")[0]}...
                      </TableCell>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">
                        {order.event.title}
                      </TableCell>
                      <TableCell className="text-sm">{order.userId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold">
                          <Ticket className="h-4 w-4 text-muted-foreground" />{" "}
                          {order.ticketCount}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold whitespace-nowrap">
                        {order.totalPrice.toLocaleString()} ₽
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1 w-fit"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Успешно
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {format(
                          new Date(order.createdAt),
                          "dd MMM yyyy, HH:mm",
                          { locale: ru },
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
