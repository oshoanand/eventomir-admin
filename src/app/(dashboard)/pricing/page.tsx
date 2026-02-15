"use client";

import Link from "next/link";
import { useAdminPlans, useDeletePlan } from "@/data/use-subscription-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSubscriptionsPage() {
  const { data: plans, isLoading } = useAdminPlans();
  const { mutate: deletePlan } = useDeletePlan();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (
      confirm("Вы уверены? Удаление тарифа может повлиять на пользователей.")
    ) {
      deletePlan(id, {
        onSuccess: () => toast({ title: "Тариф удален" }),
        onError: () =>
          toast({
            variant: "destructive",
            title: "Ошибка удаления (возможно есть активные подписки)",
          }),
      });
    }
  };

  if (isLoading)
    return (
      <div className="p-10">
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.tier}</Badge>
                  </TableCell>
                  <TableCell>{plan.priceMonthly} ₽</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Активен" : "Скрыт"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/pricing/edit/${plan.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
