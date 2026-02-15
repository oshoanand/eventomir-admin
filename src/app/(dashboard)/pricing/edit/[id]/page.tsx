"use client";

import { useAdminPlan, useUpdatePlan } from "@/data/use-subscription-plan";
import SubscriptionPlanForm from "@/components/subscription-plan-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function EditSubscriptionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  const { data: plan, isLoading } = useAdminPlan(id);
  const { mutate: updatePlan, isPending } = useUpdatePlan();

  if (isLoading)
    return (
      <div className="container py-10">
        <Skeleton className="h-[500px]" />
      </div>
    );
  if (!plan) return <div>Тариф не найден</div>;

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/pricing">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Редактировать тариф</h1>

      <SubscriptionPlanForm
        initialData={plan}
        isSubmitting={isPending}
        onSubmit={(data) => {
          updatePlan(
            { id, data },
            {
              onSuccess: () => {
                toast({ title: "Тариф обновлен!" });
                router.push("/pricing");
              },
              onError: () =>
                toast({ variant: "destructive", title: "Ошибка обновления" }),
            },
          );
        }}
      />
    </div>
  );
}
