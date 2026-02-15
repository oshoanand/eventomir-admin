"use client";

import { useCreatePlan } from "@/data/use-subscription-plan";
import SubscriptionPlanForm from "@/components/subscription-plan-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createPlan, isPending } = useCreatePlan();

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/pricing">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Создать новый тариф</h1>

      <SubscriptionPlanForm
        isSubmitting={isPending}
        onSubmit={(data) => {
          createPlan(data, {
            onSuccess: () => {
              toast({ title: "Тариф создан!" });
              router.push("/pricing");
            },
            onError: () =>
              toast({ variant: "destructive", title: "Ошибка создания" }),
          });
        }}
      />
    </div>
  );
}
