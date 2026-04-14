"use client";

import { useCreatePlan } from "@/data/use-subscription-plan";
import SubscriptionPlanForm from "@/components/subscription-plan-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/utils/api-client";

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreatePlan();

  return (
    <div className="container py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/pricing">
            <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к тарифам
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Создать новый тариф</h1>
        <p className="text-muted-foreground mt-1">
          Заполните данные и настройте лимиты для нового уровня подписки.
        </p>
      </div>

      <SubscriptionPlanForm
        isSubmitting={isPending}
        onSubmit={(data: any) => {
          createPlan(data, {
            onSuccess: () => {
              toast({
                title: "Тариф успешно создан!",
                variant: "success",
              });
              router.push("/pricing");
            },
            onError: (error: any) => {
              const errorMessage =
                error instanceof ApiError
                  ? error.message
                  : "Произошла системная ошибка при создании тарифа.";

              toast({
                variant: "destructive",
                title: "Ошибка создания",
                description: errorMessage,
              });
            },
          });
        }}
      />
    </div>
  );
}
