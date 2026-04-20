"use client";

import {
  usePromos,
  useUpdatePromo,
  useDeletePromo,
  PromoCode,
} from "@/services/promo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Edit2, Trash2, Tag, Percent } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

export default function PromosPage() {
  const { toast } = useToast();

  // Используем наши кастомные хуки из сервиса
  const { data: promos, isLoading } = usePromos();
  const updateStatusMutation = useUpdatePromo();
  const deleteMutation = useDeletePromo();

  const handleToggleStatus = (promo: PromoCode) => {
    updateStatusMutation.mutate(
      { id: promo.id, data: { isActive: !promo.isActive } },
      {
        onSuccess: () => toast({ title: "Статус успешно изменен" }),
        onError: () =>
          toast({
            variant: "destructive",
            title: "Ошибка при изменении статуса",
          }),
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот промокод?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast({ title: "Промокод удален" }),
        onError: () =>
          toast({ variant: "destructive", title: "Ошибка при удалении" }),
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Промокоды</h1>
          <p className="text-muted-foreground mt-1">
            Управление скидками и маркетинговыми акциями
          </p>
        </div>
        <Link href="/promo/new">
          <Button className="rounded-full shadow-md font-bold px-6">
            <Plus className="w-4 h-4 mr-2" /> Создать промокод
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Код</TableHead>
              <TableHead className="font-bold">Скидка</TableHead>
              <TableHead className="font-bold">Использования</TableHead>
              <TableHead className="font-bold">Срок действия</TableHead>
              <TableHead className="font-bold">Статус</TableHead>
              <TableHead className="text-right font-bold">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : promos?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground"
                >
                  <Tag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  Нет активных промокодов
                </TableCell>
              </TableRow>
            ) : (
              promos?.map((promo) => (
                <TableRow
                  key={promo.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-bold font-mono tracking-wider">
                    {promo.code}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="font-semibold bg-primary/10 text-primary"
                    >
                      {promo.type === "PERCENTAGE" ? (
                        <>
                          <Percent className="w-3 h-3 mr-1 inline" />{" "}
                          {promo.value}%
                        </>
                      ) : (
                        <>
                          <span className="mr-1">₽</span> {promo.value}
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{promo.currentUses}</span>
                    <span className="text-muted-foreground">
                      {promo.maxUses ? ` / ${promo.maxUses}` : " / ∞"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {promo.validUntil ? (
                      new Date(promo.validUntil).toLocaleDateString("ru-RU")
                    ) : (
                      <span className="text-muted-foreground">Бессрочно</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.isActive}
                      onCheckedChange={() => handleToggleStatus(promo)}
                      disabled={updateStatusMutation.isPending}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/promo/edit/${promo.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(promo.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
