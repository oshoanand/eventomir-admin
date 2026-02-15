// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useCreateArticle, CreateArticleDTO } from "@/data/use-article";
// import TiptapEditor from "@/components/tiptap-editor";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2, Save, ArrowLeft } from "lucide-react";
// import Link from "next/link";

// export default function AdminBlogPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const { mutate: createArticle, isPending } = useCreateArticle();

//   const [formData, setFormData] = useState<CreateArticleDTO>({
//     title: "",
//     slug: "",
//     content: "",
//     media_url: "",
//     media_type: "image",
//     isActive: false,
//     meta_title: "",
//     meta_description: "",
//     keywords: "",
//   });
//   // Helper: Auto-generate slug from title
//   useEffect(() => {
//     if (formData.title) {
//       // Only auto-update slug if the user hasn't manually edited it significantly
//       // (Simple implementation: just always update based on title for this demo)
//       const autoSlug = formData.title
//         .toLowerCase()
//         .trim()
//         .replace(/[^\w\s-]/g, "") // Remove special chars
//         .replace(/[\s_-]+/g, "-") // Replace spaces with dashes
//         .replace(/^-+|-+$/g, ""); // Trim dashes

//       // You might want to check if the user has manually "touched" the slug field
//       // before overwriting, but this is a standard CMS behavior for new posts.
//       if (!formData.slug || formData.slug.includes(autoSlug.substring(0, 3))) {
//         // Optionally keep it synced or just let user type.
//         // Here we only set it if it's empty to be less intrusive.
//         if (formData.slug === "")
//           setFormData((prev) => ({ ...prev, slug: autoSlug }));
//       }
//     }
//   }, [formData.title]);

//   const handleChange = (field: keyof CreateArticleDTO, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = () => {
//     // Basic Validation
//     if (!formData.title || !formData.slug || !formData.content) {
//       toast({
//         variant: "destructive",
//         title: "Ошибка валидации",
//         description:
//           "Пожалуйста, заполните заголовок, slug и содержание статьи.",
//       });
//       return;
//     }

//     createArticle(formData, {
//       onSuccess: () => {
//         toast({
//           title: "Статья создана",
//           description: "Материал успешно сохранен в базе данных.",
//         });
//         // Reset form
//         setFormData({
//           title: "",
//           slug: "",
//           content: "",
//           media_url: "",
//           media_type: "image",
//           image_alt_text: "",
//           isActive: false,
//           meta_title: "",
//           meta_description: "",
//           keywords: "",
//         });
//         // Optional: Redirect to list
//         // router.push("/admin/blog/list");
//       },
//       onError: (error: any) => {
//         toast({
//           variant: "destructive",
//           title: "Ошибка сохранения",
//           description: error?.message || "Не удалось создать статью.",
//         });
//       },
//     });
//   };

//   return (
//     <div className="container py-10 max-w-5xl space-y-8">
//       {/* Header Actions */}
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2 text-muted-foreground mb-2">
//             <Link href="/admin" className="hover:text-primary">
//               <ArrowLeft className="h-4 w-4" />
//             </Link>
//             <span className="text-sm">Назад в админ-панель</span>
//           </div>
//           <h1 className="text-3xl font-bold tracking-tight">Новая статья</h1>
//           <p className="text-muted-foreground">
//             Создайте и опубликуйте новый материал для блога.
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
//             <Checkbox
//               id="active"
//               checked={formData.isActive}
//               onCheckedChange={(c) => handleChange("isActive", c as boolean)}
//             />
//             <Label htmlFor="active" className="cursor-pointer font-medium">
//               Опубликовать
//             </Label>
//           </div>
//           <Button onClick={handleSubmit} disabled={isPending} size="lg">
//             {isPending ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               <Save className="mr-2 h-4 w-4" />
//             )}
//             Сохранить
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column: Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Основная информация</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="title">Заголовок статьи</Label>
//                 <Input
//                   id="title"
//                   placeholder="Введите заголовок..."
//                   value={formData.title}
//                   onChange={(e) => handleChange("title", e.target.value)}
//                   className="text-lg font-medium"
//                 />
//               </div>

//               <div className="grid gap-2">
//                 <Label htmlFor="slug">URL Slug (адрес страницы)</Label>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-muted-foreground bg-muted p-2 rounded-md border">
//                     /blog/
//                   </span>
//                   <Input
//                     id="slug"
//                     value={formData.slug}
//                     onChange={(e) => handleChange("slug", e.target.value)}
//                     placeholder="my-new-article"
//                   />
//                 </div>
//               </div>

//               <div className="grid gap-2">
//                 <Label>Содержание</Label>
//                 <div className="min-h-[400px]">
//                   <TiptapEditor
//                     content={formData.content}
//                     onChange={(html) => handleChange("content", html)}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column: Settings & SEO */}
//         <div className="space-y-6">
//           {/* Media Settings */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Медиа</CardTitle>
//               <CardDescription>Обложка и тип контента</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid gap-2">
//                 <Label>Тип медиа</Label>
//                 <Select
//                   value={formData.media_type}
//                   onValueChange={(val: any) => handleChange("media_type", val)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Выберите тип" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="image">Изображение</SelectItem>
//                     <SelectItem value="video">Видео (YouTube/Embed)</SelectItem>
//                     <SelectItem value="link">Внешняя ссылка</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid gap-2">
//                 <Label htmlFor="mediaUrl">Ссылка на файл (URL)</Label>
//                 <Input
//                   id="mediaUrl"
//                   value={formData.media_url || ""}
//                   onChange={(e) => handleChange("media_url", e.target.value)}
//                   placeholder="https://example.com/image.jpg"
//                 />
//               </div>

//               <div className="grid gap-2">
//                 <Label htmlFor="imageAlt">Alt текст (для SEO)</Label>
//                 <Input
//                   id="imageAlt"
//                   value={formData.image_alt_text || ""}
//                   onChange={(e) =>
//                     handleChange("image_alt_text", e.target.value)
//                   }
//                   placeholder="Описание изображения"
//                 />
//               </div>

//               {/* Preview */}
//               {formData.media_url && formData.media_type === "image" && (
//                 <div className="mt-2 rounded-md overflow-hidden border aspect-video relative">
//                   <img
//                     src={formData.media_url}
//                     alt="Preview"
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* SEO Settings */}
//           <Card>
//             <CardHeader>
//               <CardTitle>SEO Настройки</CardTitle>
//               <CardDescription>Оптимизация для поисковиков</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="metaTitle">Meta Title</Label>
//                 <Input
//                   id="metaTitle"
//                   value={formData.meta_title || ""}
//                   onChange={(e) => handleChange("meta_title", e.target.value)}
//                   placeholder="Заголовок для поисковой выдачи"
//                 />
//                 <p className="text-[10px] text-muted-foreground text-right">
//                   {formData.meta_title?.length || 0} / 60
//                 </p>
//               </div>

//               <div className="grid gap-2">
//                 <Label htmlFor="metaDesc">Meta Description</Label>
//                 <Textarea
//                   id="metaDesc"
//                   value={formData.meta_description || ""}
//                   onChange={(e) =>
//                     handleChange("meta_description", e.target.value)
//                   }
//                   placeholder="Краткое описание статьи..."
//                   className="h-24 resize-none"
//                 />
//                 <p className="text-[10px] text-muted-foreground text-right">
//                   {formData.meta_description?.length || 0} / 160
//                 </p>
//               </div>

//               <div className="grid gap-2">
//                 <Label htmlFor="keywords">Ключевые слова</Label>
//                 <Input
//                   id="keywords"
//                   value={formData.keywords || ""}
//                   onChange={(e) => handleChange("keywords", e.target.value)}
//                   placeholder="свадьба, советы, фотограф"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import {
  useAdminArticles,
  useDeleteArticle,
  useUpdateArticle,
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
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function AdminBlogList() {
  const { data: articles, isLoading } = useAdminArticles();
  const { mutate: deleteArticle } = useDeleteArticle();
  const { mutate: updateArticle } = useUpdateArticle();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту статью?")) {
      deleteArticle(id, {
        onSuccess: () => toast({ title: "Статья удалена" }),
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    updateArticle(
      { id, data: { isActive: !currentStatus } },
      {
        onSuccess: () =>
          toast({
            title: `Статус изменен на ${!currentStatus ? "Активен" : "Черновик"}`,
          }),
      },
    );
  };

  if (isLoading)
    return (
      <div className="p-10">
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Блог / Статьи</h1>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="mr-2 h-4 w-4" /> Создать статью
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все материалы ({articles?.length || 0})</CardTitle>
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
              {articles?.map((article) => (
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
                        <Link href={`/blog/${article.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        title="Редактировать"
                      >
                        <Link href={`/admin/blog/edit/${article.id}`}>
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
              {articles?.length === 0 && (
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
    </div>
  );
}
