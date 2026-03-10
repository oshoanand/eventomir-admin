"use client";

import { useState, useEffect } from "react";
import { CreateArticleDTO, Article } from "@/data/use-article";
import TiptapEditor from "@/components/tiptap-editor"; // Ensure path matches your project
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";

interface ArticleFormProps {
  initialData?: Article; // Optional for Edit mode
  onSubmit: (data: FormData) => void; // CHANGED: Must submit FormData for multer
  isSubmitting: boolean;
}

// Helper: Transliterate Russian to English and slugify
const slugify = (text: string) => {
  const ruMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    " ": "-",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => ruMap[char] || char)
    .join("")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function ArticleForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ArticleFormProps) {
  // Initialize form state
  const [formData, setFormData] = useState<CreateArticleDTO>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    media_url: initialData?.media_url || "", // Holds external link OR existing DB link
    media_type: initialData?.media_type || "image",
    image_alt_text: initialData?.image_alt_text || "",
    isActive: initialData?.isActive || false,
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
    keywords: initialData?.keywords || "",
  });

  // NEW: Track physical file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.media_url || null,
  );

  const [isSlugTouched, setIsSlugTouched] = useState(!!initialData?.slug);

  // Effect: Auto-generate slug from title
  useEffect(() => {
    if (!isSlugTouched && formData.title) {
      const autoSlug = slugify(formData.title);
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, isSlugTouched]);

  const handleChange = (field: keyof CreateArticleDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugTouched(true);
    handleChange("slug", e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create a local preview of the uploaded image
      setPreviewUrl(URL.createObjectURL(file));
      // Reset external URL if a file is chosen
      handleChange("media_url", "");
    }
  };

  const handleFormSubmit = () => {
    // 1. Create FormData object
    const payload = new FormData();

    // 2. Append all text fields
    payload.append("title", formData.title);
    payload.append("content", formData.content);
    payload.append("slug", formData.slug);
    payload.append("media_type", formData.media_type || "image");
    payload.append("image_alt_text", formData.image_alt_text || "");
    payload.append("meta_title", formData.meta_title || "");
    payload.append("meta_description", formData.meta_description || "");
    payload.append("keywords", formData.keywords || "");
    payload.append("isActive", String(formData.isActive));

    // 3. Handle Media (File vs External Link)
    if (selectedFile) {
      payload.append("media", selectedFile); // Matches backend `upload.single("media")`
    } else if (formData.media_url) {
      payload.append("media_url", formData.media_url); // Pass string if it's an external link
    }

    // 4. Send to parent
    onSubmit(payload);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Контент</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>
                Заголовок <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Введите заголовок статьи"
              />
            </div>

            <div className="grid gap-2">
              <Label>Slug (URL адрес)</Label>
              <div className="flex flex-col gap-1">
                <Input
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="url-statyi"
                />
                <p className="text-[11px] text-muted-foreground">
                  {formData.slug
                    ? `/blog/${formData.slug}`
                    : "Автоматически генерируется из заголовка"}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>
                Текст статьи <span className="text-destructive">*</span>
              </Label>
              <div className="min-h-[400px]">
                <TiptapEditor
                  content={formData.content}
                  onChange={(html) => handleChange("content", html)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Settings, Media, SEO */}
      <div className="space-y-6">
        {/* Publication Status & Action */}
        <Card>
          <CardHeader>
            <CardTitle>Публикация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
              <Checkbox
                id="active"
                checked={formData.isActive}
                onCheckedChange={(c) => handleChange("isActive", c as boolean)}
              />
              <Label htmlFor="active" className="cursor-pointer font-medium">
                Опубликовать на сайте
              </Label>
            </div>

            <Button
              onClick={handleFormSubmit}
              disabled={isSubmitting || !formData.title || !formData.content}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {initialData ? "Сохранить изменения" : "Создать статью"}
            </Button>
          </CardContent>
        </Card>

        {/* Media Settings (File Upload or Link) */}
        <Card>
          <CardHeader>
            <CardTitle>Медиа обложка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Тип загрузки</Label>
              <Select
                value={formData.media_type}
                onValueChange={(v: any) => handleChange("media_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    Загрузить файл (Картинка)
                  </SelectItem>
                  <SelectItem value="link">Внешняя ссылка (URL)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggle Input based on Media Type */}
            {formData.media_type === "image" ? (
              <div className="grid gap-2">
                <Label>Файл изображения</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Внешняя ссылка (URL)</Label>
                <Input
                  value={formData.media_url || ""}
                  onChange={(e) => {
                    handleChange("media_url", e.target.value);
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null); // Clear file if switching to URL
                  }}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>Alt текст (SEO для картинок)</Label>
              <Input
                value={formData.image_alt_text || ""}
                onChange={(e) => handleChange("image_alt_text", e.target.value)}
                placeholder="Краткое описание картинки"
              />
            </div>

            {/* Preview Area */}
            {previewUrl && (
              <div className="mt-2 relative rounded-md overflow-hidden border aspect-video bg-muted flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl(null)} // Hide if invalid link
                />
              </div>
            )}
            {!previewUrl && (
              <div className="mt-2 rounded-md border border-dashed aspect-video bg-muted/30 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Нет обложки</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Оптимизация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Meta Title</Label>
              <Input
                value={formData.meta_title || ""}
                onChange={(e) => handleChange("meta_title", e.target.value)}
                placeholder="Заголовок для поисковиков"
              />
              <span className="text-[10px] text-muted-foreground text-right">
                {formData.meta_title?.length || 0}/60
              </span>
            </div>

            <div className="grid gap-2">
              <Label>Meta Description</Label>
              <Textarea
                value={formData.meta_description || ""}
                onChange={(e) =>
                  handleChange("meta_description", e.target.value)
                }
                placeholder="Краткое описание страницы..."
                className="h-24 resize-none"
              />
              <span className="text-[10px] text-muted-foreground text-right">
                {formData.meta_description?.length || 0}/160
              </span>
            </div>

            <div className="grid gap-2">
              <Label>Keywords (Ключевые слова)</Label>
              <Input
                value={formData.keywords || ""}
                onChange={(e) => handleChange("keywords", e.target.value)}
                placeholder="ивент, организация, праздник..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
