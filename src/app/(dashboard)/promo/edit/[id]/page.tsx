"use client";

import { PromoForm } from "@/components/admin/PromoForm";
import { usePromo, useUpdatePromo } from "@/services/promo";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPromoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();

  // Получаем данные конкретного промокода из нашего сервиса
  const { data: promo, isLoading } = usePromo(params.id);
  const updateMutation = useUpdatePromo();

  // Состояние загрузки данных с бэкенда
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Skeleton className="h-[600px] w-full rounded-3xl shadow-sm" />
      </div>
    );
  }

  // Если промокод не найден или удален
  if (!promo) {
    return (
      <div className="text-center py-20 text-muted-foreground font-medium">
        Промокод не найден
      </div>
    );
  }

  // Обработчик сохранения изменений
  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: params.id, data },
      {
        onSuccess: () => {
          toast({ title: "Промокод успешно обновлен!" });
          router.push("/promo"); // Возврат к таблице
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description:
              error.response?.data?.message || "Не удалось обновить промокод",
          });
        },
      },
    );
  };

  return (
    <PromoForm
      title={`Редактирование: ${promo.code}`}
      initialData={promo}
      isLoading={updateMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
