"use client";

import { PromoForm } from "@/components/admin/PromoForm";
import { useCreatePromo, PromoCodeInput } from "@/services/promo";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPromoPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Используем инкапсулированный хук из сервиса
  const createMutation = useCreatePromo();

  const handleSubmit = (data: PromoCodeInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Промокод успешно создан!" });
        router.push("/promo"); // Возвращаем администратора обратно к списку
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description:
            error.response?.data?.message || "Не удалось создать промокод",
        });
      },
    });
  };

  return (
    <PromoForm
      title="Создание промокода"
      isLoading={createMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
