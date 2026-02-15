"use client";

import { useCreateArticle } from "@/data/use-article";
import ArticleForm from "@/components/article-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCreateArticlePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createArticle, isPending } = useCreateArticle();

  return (
    <div className="container py-10 max-w-6xl">
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Создать новую статью</h1>
      </div>

      <ArticleForm
        isSubmitting={isPending}
        onSubmit={(data) => {
          createArticle(data, {
            onSuccess: () => {
              toast({ title: "Статья создана!" });
              router.push("/blog");
            },
            onError: () =>
              toast({ variant: "destructive", title: "Ошибка создания" }),
          });
        }}
      />
    </div>
  );
}
