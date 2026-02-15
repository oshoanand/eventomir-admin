"use client";

import { useAdminArticle, useUpdateArticle } from "@/data/use-article";
import ArticleForm from "@/components/article-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function AdminEditArticlePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  // 1. Fetch data specifically for editing (via ID, not slug)
  const { data: article, isLoading, isError } = useAdminArticle(id);
  const { mutate: updateArticle, isPending } = useUpdateArticle();

  if (isLoading)
    return (
      <div className="container py-10">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  if (isError || !article)
    return (
      <div className="container py-10 text-destructive">Статья не найдена</div>
    );

  return (
    <div className="container py-10 max-w-6xl">
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Редактирование статьи</h1>
        <p className="text-muted-foreground">ID: {id}</p>
      </div>

      <ArticleForm
        initialData={article}
        isSubmitting={isPending}
        onSubmit={(data) => {
          updateArticle(
            { id, data },
            {
              onSuccess: () => {
                toast({ title: "Изменения сохранены!" });
                router.push("/admin/blog");
              },
              onError: () =>
                toast({ variant: "destructive", title: "Ошибка сохранения" }),
            },
          );
        }}
      />
    </div>
  );
}
