"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";
import {
  Palette,
  TypeIcon,
  ImageIcon,
  Settings,
  Tags,
  UserCog,
  Pencil,
  Trash2,
  PlusCircle,
  Upload,
  Mail,
  LayoutTemplate,
  Link as LinkIcon,
  Layers,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGeneralSettingsQuery,
  useUpdateSettingsMutation,
  useFileUploadMutation,
  type SiteSettings,
  type SiteCategory,
  type PageSEO,
  type SubCategory,
} from "@/data/use-settings";

const THEME_OPTIONS = [
  { id: "zinc", name: "Монохром (Zinc)", color: "bg-zinc-900" },
  { id: "rose", name: "Роза (Rose)", color: "bg-rose-600" },
  { id: "blue", name: "Океан (Blue)", color: "bg-blue-600" },
  { id: "green", name: "Природа (Green)", color: "bg-green-600" },
  { id: "orange", name: "Закат (Orange)", color: "bg-orange-500" },
];

const RADIUS_OPTIONS = [
  { label: "Квадратный (0)", value: "0rem" },
  { label: "Слегка (0.3rem)", value: "0.3rem" },
  { label: "Стандарт (0.5rem)", value: "0.5rem" },
  { label: "Сильно (0.75rem)", value: "0.75rem" },
  { label: "Круглый (1rem)", value: "1rem" },
];

const popularFonts = [
  "Arial, sans-serif",
  "Verdana, sans-serif",
  "Helvetica, sans-serif",
  "Tahoma, sans-serif",
  "Trebuchet MS, sans-serif",
  "Inter, sans-serif",
  "Roboto, sans-serif",
];

const CATEGORY_ICONS = [
  "Camera",
  "Music",
  "Mic",
  "MicVocal",
  "Users",
  "Palette",
  "Film",
  "ChefHat",
  "Smile",
  "Utensils",
  "GlassWater",
  "MapPin",
  "Heart",
  "Star",
  "PartyPopper",
  "Gift",
  "Cake",
  "Image",
  "CarFront",
  "Brush",
  "Briefcase",
  "Home",
  "Calendar",
];

export default function SettingsPage() {
  const { toast } = useToast();

  const { data: serverSettings, isLoading: isSettingsLoading } =
    useGeneralSettingsQuery();

  const updateSettingsMutation = useUpdateSettingsMutation();
  const uploadFileMutation = useFileUploadMutation();

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (serverSettings) setSettings(serverSettings);
  }, [serverSettings]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(
    null,
  );

  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    icon: string;
    link: string;
    subCategories: SubCategory[];
  }>({ name: "", icon: "Star", link: "", subCategories: [] });

  const [isSeoDialogOpen, setIsSeoDialogOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<PageSEO | null>(null);
  const [seoFormData, setSeoFormData] = useState<PageSEO>({
    path: "",
    title: "",
    description: "",
    keywords: "",
  });

  const handleSettingsChange = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleThemeChange = (field: string, value: string) => {
    setSettings((prev: any) => {
      if (!prev) return null;
      return { ...prev, theme: { ...prev.theme, [field]: value } };
    });
  };

  const handleContactSettingsChange = (
    field: keyof SiteSettings["contacts"],
    value: string,
  ) => {
    setSettings((prev) => {
      if (!prev) return null;
      return { ...prev, contacts: { ...prev.contacts, [field]: value } };
    });
  };

  const handleSaveSettings = async (keysToSave: (keyof SiteSettings)[]) => {
    if (!settings) return;
    let settingsToUpdateFull = { ...settings };

    try {
      if (logoFile) {
        toast({ description: "Загрузка логотипа..." });
        const response = await uploadFileMutation.mutateAsync({
          file: logoFile,
          type: "logo",
        });
        settingsToUpdateFull.logoUrl = (response as any).url;
      }
      if (faviconFile) {
        toast({ description: "Загрузка фавикона..." });
        const response = await uploadFileMutation.mutateAsync({
          file: faviconFile,
          type: "favicon",
        });
        settingsToUpdateFull.faviconUrl = (response as any).url;
      }

      const partialUpdate: Partial<SiteSettings> = {};
      keysToSave.forEach((key) => {
        partialUpdate[key] = settingsToUpdateFull[key] as any;
      });

      if (logoFile) partialUpdate.logoUrl = settingsToUpdateFull.logoUrl;
      if (faviconFile)
        partialUpdate.faviconUrl = settingsToUpdateFull.faviconUrl;

      updateSettingsMutation.mutate(partialUpdate, {
        onSuccess: () => {
          setLogoFile(null);
          setFaviconFile(null);
          setSettings(settingsToUpdateFull);
        },
      });
    } catch (error) {
      console.error("Save flow failed", error);
    }
  };

  const renderIcon = (iconName: string, props: any) => {
    const IconComponent = (LucideIcons as any)[iconName] as React.ElementType;
    return IconComponent ? (
      <IconComponent {...props} />
    ) : (
      <LucideIcons.HelpCircle {...props} />
    );
  };

  // --- CATEGORY HANDLERS ---
  const openAddCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      icon: "Star",
      link: "",
      subCategories: [],
    });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: SiteCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      icon: category.icon,
      link: category.link || "",
      subCategories: category.subCategories || [],
    });
    setIsCategoryDialogOpen(true);
  };

  const handleAddSubCategory = () => {
    setCategoryFormData((prev) => ({
      ...prev,
      subCategories: [
        ...prev.subCategories,
        { id: String(Date.now()), name: "", link: "" },
      ],
    }));
  };

  const handleUpdateSubCategory = (
    id: string,
    field: "name" | "link",
    value: string,
  ) => {
    setCategoryFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories.map((sub) =>
        sub.id === id ? { ...sub, [field]: value } : sub,
      ),
    }));
  };

  const handleRemoveSubCategory = (id: string) => {
    setCategoryFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((sub) => sub.id !== id),
    }));
  };

  const handleSaveCategory = () => {
    if (
      !settings ||
      !categoryFormData.name.trim() ||
      !categoryFormData.link.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите название категории и ссылку.",
      });
      return;
    }

    const invalidSubCategories = categoryFormData.subCategories.some(
      (sub) => !sub.name.trim() || !sub.link.trim(),
    );
    if (invalidSubCategories) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните названия и ссылки для всех подкатегорий.",
      });
      return;
    }

    let updatedCategories = settings.siteCategories || [];

    if (editingCategory) {
      updatedCategories = updatedCategories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...editingCategory, ...categoryFormData }
          : cat,
      );
    } else {
      updatedCategories = [
        ...updatedCategories,
        { id: String(Date.now()), ...categoryFormData },
      ];
    }

    handleSettingsChange("siteCategories", updatedCategories);
    setIsCategoryDialogOpen(false);
    toast({
      variant: "success",
      title: "Категории обновлены",
      description: "Не забудьте нажать 'Сохранить Категории' внизу страницы.",
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!settings || !settings.siteCategories) return;
    const updatedCategories = settings.siteCategories.filter(
      (cat) => cat.id !== categoryId,
    );
    handleSettingsChange("siteCategories", updatedCategories);
    toast({
      variant: "destructive",
      title: "Категория удалена",
      description: "Нажмите 'Сохранить Категории'.",
    });
  };

  // --- SEO HANDLERS ---
  const openSeoDialog = (seo: PageSEO | null) => {
    setEditingSeo(seo);
    setSeoFormData(
      seo || { path: "", title: "", description: "", keywords: "" },
    );
    setIsSeoDialogOpen(true);
  };

  const handleSaveSeo = () => {
    if (!settings || !seoFormData.path.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "URL обязателен.",
      });
      return;
    }
    let updatedSeoList = settings.pageSpecificSEO || [];
    if (editingSeo) {
      updatedSeoList = updatedSeoList.map((s) =>
        s.path === editingSeo.path ? seoFormData : s,
      );
    } else {
      if (updatedSeoList.some((s) => s.path === seoFormData.path)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "SEO для этого пути уже есть.",
        });
        return;
      }
      updatedSeoList = [...updatedSeoList, seoFormData];
    }
    handleSettingsChange("pageSpecificSEO", updatedSeoList);
    setIsSeoDialogOpen(false);
  };

  const handleRemoveSeo = (path: string) => {
    if (!settings || !settings.pageSpecificSEO) return;
    const updatedSeoList = settings.pageSpecificSEO.filter(
      (s) => s.path !== path,
    );
    handleSettingsChange("pageSpecificSEO", updatedSeoList);
  };

  if (isSettingsLoading || !settings) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <Skeleton className="h-[40px] w-64 mb-6" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-2 pb-10 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Настройки Платформы
        </h1>
        <p className="text-muted-foreground mt-1">
          Управляйте внешним видом, контентом и тарифами клиентской части сайта.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border w-full flex-wrap h-auto p-1 justify-start shadow-sm">
          <TabsTrigger value="general" className="gap-2 px-4 py-2">
            <Settings className="h-4 w-4" /> Общие
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2 px-4 py-2">
            <LayoutTemplate className="h-4 w-4" /> Дизайн
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2 px-4 py-2">
            <Mail className="h-4 w-4" /> Контакты
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 px-4 py-2">
            <UserCog className="h-4 w-4" /> Категории
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2 px-4 py-2">
            <Tags className="h-4 w-4" /> SEO
          </TabsTrigger>
        </TabsList>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Основные
                настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2 max-w-xl">
                <Label htmlFor="siteName" className="font-semibold">
                  Название сайта
                </Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleSettingsChange("siteName", e.target.value)
                  }
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <Label className="font-semibold text-base">
                  Логотип и Фавикон
                </Label>
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="w-48 h-28 bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center rounded-lg cursor-pointer hover:border-primary hover:bg-slate-100 transition-all">
                      {settings.logoUrl || logoFile ? (
                        <img
                          src={
                            logoFile
                              ? URL.createObjectURL(logoFile)
                              : settings.logoUrl
                          }
                          alt="Logo"
                          className="max-h-full p-2 object-contain"
                        />
                      ) : (
                        <Upload className="text-slate-400 h-8 w-8" />
                      )}
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          setLogoFile(e.target.files?.[0] || null)
                        }
                      />
                    </label>
                    <p className="text-xs text-muted-foreground text-center">
                      Логотип сайта
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center rounded-lg cursor-pointer hover:border-primary hover:bg-slate-100 transition-all">
                      {settings.faviconUrl || faviconFile ? (
                        <img
                          src={
                            faviconFile
                              ? URL.createObjectURL(faviconFile)
                              : settings.faviconUrl
                          }
                          alt="Favicon"
                          className="max-h-full p-2 object-contain"
                        />
                      ) : (
                        <Upload className="text-slate-400 h-6 w-6" />
                      )}
                      <Input
                        type="file"
                        className="hidden"
                        accept=".ico,.png"
                        onChange={(e) =>
                          setFaviconFile(e.target.files?.[0] || null)
                        }
                      />
                    </label>
                    <p className="text-xs text-muted-foreground text-center">
                      Фавикон (.ico, .png)
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  onClick={() =>
                    handleSaveSettings(["siteName", "logoUrl", "faviconUrl"])
                  }
                  disabled={updateSettingsMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateSettingsMutation.isPending
                    ? "Сохранение..."
                    : "Сохранить общие настройки"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- DESIGN TAB --- */}
        <TabsContent value="design">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Цветовая тема и
                дизайн
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Цветовая тема (Пресет)
                </Label>
                <div className="flex flex-wrap gap-6">
                  {THEME_OPTIONS.map((theme) => {
                    const isActive =
                      (settings.theme as any)?.preset === theme.id;
                    return (
                      <div
                        key={theme.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => handleThemeChange("preset", theme.id)}
                          className={`h-14 w-14 rounded-full ${theme.color} transition-all border-4 shadow-sm ${isActive ? "border-primary ring-4 ring-primary/20 ring-offset-2 scale-110" : "border-white hover:scale-110 hover:shadow-md"}`}
                        />
                        <span
                          className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {theme.name.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Скругление углов
                </Label>
                <div className="flex flex-wrap gap-3">
                  {RADIUS_OPTIONS.map((rad) => {
                    const isActive =
                      (settings.theme as any)?.radius === rad.value;
                    return (
                      <Button
                        key={rad.value}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        onClick={() => handleThemeChange("radius", rad.value)}
                        className="h-16 px-6 flex flex-col items-center gap-1 bg-slate-50 hover:bg-slate-100"
                        style={{
                          borderRadius: rad.value,
                          backgroundColor: isActive
                            ? "hsl(var(--primary))"
                            : "",
                        }}
                      >
                        <span className="text-sm font-medium">
                          {rad.label.split(" ")[0]}
                        </span>
                        <span className="text-xs opacity-70">{rad.value}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <div className="space-y-4 max-w-sm">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" /> Основной шрифт
                </Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(val) =>
                    handleSettingsChange("fontFamily", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите шрифт" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularFonts.map((f) => (
                      <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                        {f.split(",")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4">
                <Button
                  onClick={() => handleSaveSettings(["theme", "fontFamily"])}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateSettingsMutation.isPending
                    ? "Сохранение..."
                    : "Применить дизайн"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CONTACTS TAB --- */}
        <TabsContent value="contacts">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Контакты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={settings.contacts?.email || ""}
                    onChange={(e) =>
                      handleContactSettingsChange("email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input
                    type="tel"
                    value={settings.contacts?.phone || ""}
                    onChange={(e) =>
                      handleContactSettingsChange("phone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>VK</Label>
                  <Input
                    type="url"
                    value={settings.contacts?.vkLink || ""}
                    onChange={(e) =>
                      handleContactSettingsChange("vkLink", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input
                    type="url"
                    value={settings.contacts?.telegramLink || ""}
                    onChange={(e) =>
                      handleContactSettingsChange(
                        "telegramLink",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSaveSettings(["contacts"])}
                disabled={updateSettingsMutation.isPending}
              >
                Сохранить контакты
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CATEGORIES TAB --- */}
        <TabsContent value="categories">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" /> Управление
                  категориями
                </CardTitle>
                <CardDescription>
                  Услуги и их подкатегории, отображаемые на главной странице и в
                  поиске.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={openAddCategoryDialog}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Добавить
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-slate-50/50 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {settings.siteCategories?.length > 0 ? (
                  settings.siteCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-start justify-between p-3 bg-white border rounded-md shadow-sm transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="shrink-0 p-2 bg-primary/5 rounded-md mt-1">
                          {renderIcon(category.icon, {
                            className: "h-5 w-5 text-primary",
                          })}
                        </div>
                        <div className="flex flex-col pr-2">
                          <span className="font-semibold text-sm truncate">
                            {category.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mb-1.5">
                            <LinkIcon className="h-3 w-3" />{" "}
                            {(category as any).link || "Нет ссылки"}
                          </span>

                          {category.subCategories &&
                          category.subCategories.length > 0 ? (
                            <span className="text-[11px] font-medium text-primary flex items-center gap-1 bg-primary/10 w-fit px-1.5 py-0.5 rounded">
                              <Layers className="h-3 w-3" />{" "}
                              {category.subCategories.length} подкат.
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/50 italic">
                              Нет подкатегорий
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditCategoryDialog(category)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveCategory(category.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-4 col-span-full text-center">
                    Категорий пока нет.
                  </p>
                )}
              </div>
              <Button
                className="mt-6"
                onClick={() => handleSaveSettings(["siteCategories"])}
                disabled={updateSettingsMutation.isPending}
              >
                Сохранить Категории
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SEO TAB --- */}
        <TabsContent value="seo">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5 text-primary" /> SEO
                </CardTitle>
                <CardDescription>
                  Управляйте мета-тегами для маршрутов.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => openSeoDialog(null)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Добавить SEO
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.pageSpecificSEO?.length > 0 ? (
                  settings.pageSpecificSEO.map((seo) => (
                    <div
                      key={seo.path}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border rounded-lg gap-4"
                    >
                      <div className="flex-grow">
                        <p className="font-mono text-sm font-semibold text-primary">
                          {seo.path}
                        </p>
                        <p className="text-sm font-medium mt-1">{seo.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {seo.description}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSeoDialog(seo)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Изменить
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveSeo(seo.path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-8 border rounded-lg bg-slate-50 border-dashed">
                    SEO-настройки не добавлены.
                  </p>
                )}
              </div>
              <Button
                className="mt-6"
                onClick={() => handleSaveSettings(["pageSpecificSEO"])}
                disabled={updateSettingsMutation.isPending}
              >
                Сохранить SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}

      {/* REDESIGNED CATEGORY DIALOG */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
            <DialogTitle className="text-lg">
              {editingCategory
                ? "Редактировать категорию"
                : "Добавить новую категорию"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <div className="px-6 py-6 space-y-8">
              {/* Main Category Info Card */}
              <div className="space-y-4 p-5 border rounded-xl bg-card shadow-sm">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                  <Tags className="h-4 w-4" /> Основные данные
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Название
                    </Label>
                    <Input
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData((p) => ({
                          ...p,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Например: Фотографы"
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      URL Фильтра (/search?...)
                    </Label>
                    <Input
                      value={categoryFormData.link}
                      onChange={(e) =>
                        setCategoryFormData((p) => ({
                          ...p,
                          link: e.target.value,
                        }))
                      }
                      placeholder="/search?category=Фотограф"
                      className="bg-muted/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Иконка (Lucide)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Select
                        value={categoryFormData.icon}
                        onValueChange={(val) =>
                          setCategoryFormData((p) => ({ ...p, icon: val }))
                        }
                      >
                        <SelectTrigger className="flex-grow bg-muted/50">
                          <SelectValue placeholder="Выберите иконку" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-48">
                            {CATEGORY_ICONS.map((iconName) => (
                              <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                  {renderIcon(iconName, {
                                    className: "h-4 w-4",
                                  })}{" "}
                                  {iconName}
                                </div>
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <div className="p-2.5 border rounded-lg bg-primary/5 text-primary">
                        {renderIcon(categoryFormData.icon, {
                          className: "h-5 w-5",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Categories Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                    <Layers className="h-4 w-4" /> Подкатегории
                  </h4>
                  <Badge variant="secondary" className="font-normal text-xs">
                    {categoryFormData.subCategories.length} шт.
                  </Badge>
                </div>

                <div className="space-y-3">
                  {categoryFormData.subCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl bg-slate-50/50">
                      <Layers className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Нет подкатегорий
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryFormData.subCategories.map((sub, index) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-3 p-3 bg-card border rounded-xl shadow-sm transition-all hover:border-primary/40 group"
                        >
                          <div className="flex flex-col items-center justify-center pt-2 px-1">
                            <span className="text-xs font-bold text-muted-foreground/50">
                              {index + 1}
                            </span>
                          </div>

                          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                Название
                              </Label>
                              <Input
                                placeholder="Напр. Свадебный"
                                value={sub.name}
                                onChange={(e) =>
                                  handleUpdateSubCategory(
                                    sub.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                Ссылка
                              </Label>
                              <Input
                                placeholder="/search?..."
                                value={sub.link}
                                onChange={(e) =>
                                  handleUpdateSubCategory(
                                    sub.id,
                                    "link",
                                    e.target.value,
                                  )
                                }
                                className="h-9 text-sm font-mono text-muted-foreground"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 mt-4 sm:mt-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg"
                            onClick={() => handleRemoveSubCategory(sub.id)}
                            title="Удалить подкатегорию"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Beautiful dashed add button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors rounded-xl mt-2"
                    onClick={handleAddSubCategory}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Добавить
                    подкатегорию
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Сохранить изменения" : "Добавить категорию"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEO Dialog (Preserved) */}
      <Dialog open={isSeoDialogOpen} onOpenChange={setIsSeoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSeo ? "Редактировать SEO" : "Добавить SEO"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Путь страницы (URL)</Label>
              <Input
                value={seoFormData.path}
                onChange={(e) =>
                  setSeoFormData((p) => ({ ...p, path: e.target.value }))
                }
                placeholder="/about"
                disabled={!!editingSeo}
              />
            </div>
            <div className="space-y-2">
              <Label>Заголовок (Title)</Label>
              <Input
                value={seoFormData.title}
                onChange={(e) =>
                  setSeoFormData((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Описание (Description)</Label>
              <Textarea
                value={seoFormData.description}
                onChange={(e) =>
                  setSeoFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ключевые слова</Label>
              <Input
                value={seoFormData.keywords}
                onChange={(e) =>
                  setSeoFormData((p) => ({ ...p, keywords: e.target.value }))
                }
                placeholder="через запятую"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSeoDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveSeo}>
              {editingSeo ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
