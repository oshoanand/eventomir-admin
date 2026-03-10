"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";
import {
  useDeleteArticle,
  useUpdateArticle,
  useModerateCommentMutation,
} from "@/data/use-article";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Trash2,
  Plus,
  Eye,
  MessageSquare,
  FileText,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function AdminBlogList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: deleteArticle } = useDeleteArticle();
  const { mutate: updateArticle } = useUpdateArticle();
  const { mutate: moderateComment } = useModerateCommentMutation();

  // Fetch Admin Articles
  const { data: articles, isLoading: isArticlesLoading } = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () =>
      apiRequest({ method: "get", url: "/api/articles/admin/all" }),
  });

  // Fetch Pending Comments
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["admin", "comments", "pending"],
    queryFn: () =>
      apiRequest({
        method: "get",
        url: "/api/articles/admin/comments?status=pending",
      }),
  });

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту статью?")) {
      deleteArticle(id, {
        onSuccess: () => {
          toast({ variant: "success", title: "Статья удалена" });
          queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
        },
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    // Send as FormData or plain object depending on your ArticleForm setup
    // For simple toggles, plain object is fine if backend handles it
    updateArticle(
      { id, data: { isActive: !currentStatus } as any },
      {
        onSuccess: () => {
          toast({
            title: `Статус изменен на ${!currentStatus ? "Опубликовано" : "Черновик"}`,
          });
          queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
        },
      },
    );
  };

  const handleModerate = (
    commentId: string,
    status: "approved" | "rejected",
  ) => {
    moderateComment(
      { commentId, status },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: status === "approved" ? "Одобрено" : "Отклонено",
          });
          queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
        },
      },
    );
  };

  if (isArticlesLoading)
    return (
      <div className="p-10">
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="container py-10 max-w-6xl animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Блог / Управление</h1>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="mr-2 h-4 w-4" /> Создать статью
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="articles" className="flex gap-2">
            <FileText className="h-4 w-4" /> Статьи
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex gap-2 relative">
            <MessageSquare className="h-4 w-4" /> Модерация
            {(comments as any[]).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {(comments as any[]).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* --- ARTICLES TAB --- */}
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>
                Все материалы ({(articles as any[])?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(articles as any[])?.map((article: any) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{article.title}</span>
                          <span className="text-xs text-muted-foreground">
                            /{article.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={article.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() =>
                            handleToggleStatus(article.id, article.isActive)
                          }
                        >
                          {article.isActive ? "Опубликовано" : "Черновик"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(article.createdAt), "dd MMM yyyy", {
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Просмотр на сайте"
                          >
                            <Link
                              href={`/blog/${article.slug}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="icon"
                            title="Редактировать"
                          >
                            <Link href={`/blog/edit/${article.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(article.id)}
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!articles || (articles as any[]).length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-muted-foreground"
                      >
                        Нет статей. Создайте первую!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- COMMENTS MODERATION TAB --- */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>
                Ожидают проверки ({(comments as any[])?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isCommentsLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Загрузка...
                </div>
              ) : (comments as any[]).length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Нет новых комментариев.
                </div>
              ) : (
                (comments as any[]).map((comment: any) => (
                  <div
                    key={comment.id}
                    className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 border rounded-lg bg-muted/10"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{comment.user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          к статье: {comment.article?.title}
                        </span>
                      </div>
                      <p className="italic text-foreground/90">
                        "{comment.content}"
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleModerate(comment.id, "approved")}
                      >
                        <Check className="h-4 w-4 mr-1" /> Одобрить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleModerate(comment.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" /> Отклонить
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
