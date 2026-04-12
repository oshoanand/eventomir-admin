"use client";

import Link from "next/link";
import { useAdminPlans, useDeletePlan } from "@/data/use-subscription-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Plus, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/utils/api-client";

export default function AdminSubscriptionsPage() {
  const { data: plans, isLoading } = useAdminPlans();
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены? Удаление тарифа необратимо.")) {
      deletePlan(id, {
        onSuccess: () => {
          toast({
            title: "Тариф успешно удален",
            variant: "success", // Or omit variant if your setup only uses default/destructive
          });
        },
        onError: (error: any) => {
          // Robust error handling to catch the specific backend rejection message
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : "Произошла ошибка при удалении тарифа. Возможно, есть активные подписки.";

          toast({
            variant: "destructive",
            title: "Ошибка удаления",
            description: errorMessage,
            duration: 5000,
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-6xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-7xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="mr-2">
            <Link href="/pricing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Тарифные планы</h1>
        </div>
        <Button asChild>
          <Link href="/pricing/new">
            <Plus className="mr-2 h-4 w-4" /> Добавить тариф
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Уровень (Tier)</TableHead>
                <TableHead>Цена / мес.</TableHead>
                <TableHead>Подписчики</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.map((plan: any) => {
                // Safely extract the subscriber count from the Prisma relation
                const subscriberCount = plan._count?.subscriptions || 0;
                const canDelete = subscriberCount === 0;

                return (
                  <TableRow key={plan.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase font-mono">
                        {plan.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {plan.priceMonthly} ₽
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-muted-foreground font-medium">
                        <Users className="w-4 h-4 mr-2" />
                        {subscriberCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Активен" : "Скрыт"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="icon">
                          <Link href={`/pricing/edit/${plan.id}`}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Link>
                        </Button>
                        <Button
                          variant={canDelete ? "outline" : "secondary"}
                          size="icon"
                          disabled={!canDelete || isDeleting}
                          onClick={() => handleDelete(plan.id)}
                          className={
                            canDelete
                              ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              : "opacity-50 cursor-not-allowed"
                          }
                          title={
                            !canDelete
                              ? "Невозможно удалить: есть активные подписчики"
                              : "Удалить тариф"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!plans || plans.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Нет созданных тарифов. Нажмите "Добавить тариф", чтобы
                    начать.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
