"use client";

import { useAdminPlan, useUpdatePlan } from "@/data/use-subscription-plan";
import SubscriptionPlanForm from "@/components/subscription-plan-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ApiError } from "@/utils/api-client";

export default function EditSubscriptionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  const { data: plan, isLoading } = useAdminPlan(id);
  const { mutate: updatePlan, isPending } = useUpdatePlan();

  // Improved Loading State matching the wide layout
  if (isLoading) {
    return (
      <div className="container py-10 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Graceful Not Found State
  if (!plan) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2">Тариф не найден</h2>
        <p className="text-muted-foreground mb-6">
          Запрашиваемый тарифный план не существует или был удален.
        </p>
        <Button asChild>
          <Link href="/pricing">Вернуться к списку тарифов</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/pricing">
            <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к тарифам
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Редактировать тариф: {plan.name}</h1>
        <p className="text-muted-foreground mt-1">
          Внесите изменения в основные настройки и лимиты текущего тарифа.
        </p>
      </div>

      <SubscriptionPlanForm
        initialData={plan}
        isSubmitting={isPending}
        onSubmit={(data: any) => {
          updatePlan(
            { id, data },
            {
              onSuccess: () => {
                toast({
                  title: "Тариф успешно обновлен!",
                  variant: "success",
                });
                router.push("/pricing");
              },
              onError: (error: any) => {
                // 🚨 ROBUST ERROR HANDLING: Catch backend duplicate tier warnings
                const errorMessage =
                  error instanceof ApiError
                    ? error.message
                    : "Произошла системная ошибка при обновлении тарифа.";

                toast({
                  variant: "destructive",
                  title: "Ошибка обновления",
                  description: errorMessage,
                });
              },
            },
          );
        }}
      />
    </div>
  );
}
