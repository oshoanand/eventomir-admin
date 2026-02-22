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
  DollarSign,
  X,
  Upload,
  Mail,
  LayoutTemplate,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import hooks and types from your data folder
import {
  useGeneralSettingsQuery,
  usePricingConfigQuery,
  useUpdateSettingsMutation,
  useUpdatePricingMutation,
  useFileUploadMutation,
  type SiteSettings,
  type SiteCategory,
  type PageSEO,
  type FullPriceConfig,
  type SubscriptionPlanDetails,
} from "@/data/use-settings";

// --- BEST APPROACH: CURATED THEME PRESETS ---
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

export default function SettingsPage() {
  const { toast } = useToast();

  // --- 1. Data Fetching ---
  const { data: serverSettings, isLoading: isSettingsLoading } =
    useGeneralSettingsQuery();
  const { data: serverPrices, isLoading: isPricesLoading } =
    usePricingConfigQuery();

  // --- 2. Mutations ---
  const updateSettingsMutation = useUpdateSettingsMutation();
  const updatePricingMutation = useUpdatePricingMutation();
  const uploadFileMutation = useFileUploadMutation();

  // --- 3. Local State ---
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [priceConfig, setPriceConfig] = useState<FullPriceConfig | null>(null);

  useEffect(() => {
    if (serverSettings) setSettings(serverSettings);
  }, [serverSettings]);
  useEffect(() => {
    if (serverPrices) setPriceConfig(serverPrices);
  }, [serverPrices]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(
    null,
  );
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    icon: string;
  }>({ name: "", icon: "PlusCircle" });

  const [isSeoDialogOpen, setIsSeoDialogOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<PageSEO | null>(null);
  const [seoFormData, setSeoFormData] = useState<PageSEO>({
    path: "",
    title: "",
    description: "",
    keywords: "",
  });

  // --- 4. Generic Handlers ---
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

  const handleSavePrices = () => {
    if (priceConfig) updatePricingMutation.mutate(priceConfig);
  };

  // --- 5. Icon Helper ---
  const renderIcon = (iconName: string, props: any) => {
    const IconComponent = (LucideIcons as any)[iconName] as React.ElementType;
    return IconComponent ? (
      <IconComponent {...props} />
    ) : (
      <LucideIcons.HelpCircle {...props} />
    );
  };

  // --- 6. Category Handlers ---
  const openAddCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: "", icon: "PlusCircle" });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: SiteCategory) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name, icon: category.icon });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!settings || !categoryFormData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите название категории.",
      });
      return;
    }
    if (!(LucideIcons as any)[categoryFormData.icon]) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Неверное имя иконки.",
      });
      return;
    }

    let updatedCategories;
    if (editingCategory) {
      updatedCategories = settings.siteCategories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...editingCategory, ...categoryFormData }
          : cat,
      );
    } else {
      updatedCategories = [
        ...settings.siteCategories,
        { id: String(Date.now()), ...categoryFormData },
      ];
    }
    handleSettingsChange("siteCategories", updatedCategories);
    setIsCategoryDialogOpen(false);
    toast({
      title: "Категории обновлены",
      description: "Нажмите 'Сохранить Категории'.",
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!settings) return;
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

  // --- 7. Pricing Handlers ---
  const handlePriceChange = (
    planId: string,
    duration: "monthly" | "halfYearly" | "yearly",
    value: string,
  ) => {
    setPriceConfig((prev) => {
      if (!prev) return null;
      const newPrice = parseInt(value, 10);
      if (isNaN(newPrice) || newPrice < 0) return prev;
      return {
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId
            ? { ...plan, price: { ...plan.price, [duration]: newPrice } }
            : plan,
        ),
      };
    });
  };

  const handlePlanFieldChange = (
    planId: string,
    field: "name" | "description",
    value: string,
  ) => {
    setPriceConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId ? { ...plan, [field]: value } : plan,
        ),
      };
    });
  };

  const handleFeatureChange = (
    planId: string,
    featureIndex: number,
    value: string,
  ) => {
    setPriceConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plans: prev.plans.map((plan) => {
          if (plan.id === planId) {
            const newFeatures = [...plan.features];
            newFeatures[featureIndex] = value;
            return { ...plan, features: newFeatures };
          }
          return plan;
        }),
      };
    });
  };

  const handleAddFeature = (planId: string) => {
    setPriceConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId
            ? { ...plan, features: [...plan.features, "Новая возможность"] }
            : plan,
        ),
      };
    });
  };

  const handleRemoveFeature = (planId: string, featureIndex: number) => {
    setPriceConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plans: prev.plans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              features: plan.features.filter((_, idx) => idx !== featureIndex),
            };
          }
          return plan;
        }),
      };
    });
  };

  // --- 8. SEO Handlers ---
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

    let updatedSeoList;
    if (editingSeo) {
      updatedSeoList = settings.pageSpecificSEO.map((s) =>
        s.path === editingSeo.path ? seoFormData : s,
      );
    } else {
      if (settings.pageSpecificSEO.some((s) => s.path === seoFormData.path)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "SEO для этого пути уже есть.",
        });
        return;
      }
      updatedSeoList = [...settings.pageSpecificSEO, seoFormData];
    }
    handleSettingsChange("pageSpecificSEO", updatedSeoList);
    setIsSeoDialogOpen(false);
  };

  const handleRemoveSeo = (path: string) => {
    if (!settings) return;
    const updatedSeoList = settings.pageSpecificSEO.filter(
      (s) => s.path !== path,
    );
    handleSettingsChange("pageSpecificSEO", updatedSeoList);
  };

  // --- RENDER SKELETON ---
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
        {/* TABS NAVIGATION */}
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
          <TabsTrigger value="pricing" className="gap-2 px-4 py-2">
            <DollarSign className="h-4 w-4" /> Тарифы
          </TabsTrigger>
        </TabsList>

        {/* 1. GENERAL TAB */}
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
                  {/* Logo Upload */}
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

                  {/* Favicon Upload */}
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

        {/* 2. DESIGN TAB */}
        <TabsContent value="design">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Цветовая тема и
                дизайн
              </CardTitle>
              <CardDescription>
                Выберите профессионально подобранный визуальный стиль.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Preset Picker */}
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
                          className={`h-14 w-14 rounded-full ${theme.color} transition-all border-4 shadow-sm ${
                            isActive
                              ? "border-primary ring-4 ring-primary/20 ring-offset-2 scale-110"
                              : "border-white hover:scale-110 hover:shadow-md"
                          }`}
                          title={theme.name}
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

              {/* Radius Picker */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Скругление углов интерфейса
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
                        className="h-16 px-6 flex flex-col items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100"
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

              {/* Font Picker */}
              <div className="space-y-4 max-w-sm">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" /> Основной шрифт (Font Family)
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

        {/* 3. CONTACTS TAB */}
        <TabsContent value="contacts">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Контактный Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contacts?.email || ""}
                    onChange={(e) =>
                      handleContactSettingsChange("email", e.target.value)
                    }
                    placeholder="support@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Телефон</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={settings.contacts?.phone || ""}
                    onChange={(e) =>
                      handleContactSettingsChange("phone", e.target.value)
                    }
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vkLink">Ссылка на VK</Label>
                  <Input
                    id="vkLink"
                    type="url"
                    value={settings.contacts?.vkLink || ""}
                    onChange={(e) =>
                      handleContactSettingsChange("vkLink", e.target.value)
                    }
                    placeholder="https://vk.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegramLink">Ссылка на Telegram</Label>
                  <Input
                    id="telegramLink"
                    type="url"
                    value={settings.contacts?.telegramLink || ""}
                    onChange={(e) =>
                      handleContactSettingsChange(
                        "telegramLink",
                        e.target.value,
                      )
                    }
                    placeholder="https://t.me/..."
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

        {/* 4. CATEGORIES TAB */}
        <TabsContent value="categories">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" /> Управление
                  категориями
                </CardTitle>
                <CardDescription>
                  Услуги, отображаемые на главной странице.
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
              <div className="border rounded-lg bg-slate-50/50 p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {settings.siteCategories.length > 0 ? (
                  settings.siteCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {renderIcon(category.icon, {
                          className: "h-5 w-5 text-primary",
                        })}
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600"
                          onClick={() => openEditCategoryDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

        {/* 5. SEO TAB */}
        <TabsContent value="seo">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5 text-primary" /> SEO-настройки
                </CardTitle>
                <CardDescription>
                  Управляйте мета-тегами (Title, Description) для маршрутов.
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
                {settings.pageSpecificSEO.length > 0 ? (
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

        {/* 6. PRICING TAB */}
        <TabsContent value="pricing">
          <Card className="shadow-sm bg-slate-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Управление
                Тарифами
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPricesLoading || !priceConfig ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="space-y-8">
                  {priceConfig.plans
                    .filter((p) => p.id !== "econom")
                    .map((plan) => (
                      <Card key={plan.id} className="border-2 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                          <CardTitle className="text-xl text-primary">
                            {plan.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Название тарифа</Label>
                              <Input
                                value={plan.name}
                                onChange={(e) =>
                                  handlePlanFieldChange(
                                    plan.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Описание тарифа</Label>
                              <Textarea
                                className="min-h-[40px]"
                                value={plan.description}
                                onChange={(e) =>
                                  handlePlanFieldChange(
                                    plan.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-lg border">
                            <Label className="text-base mb-3 block">
                              Цены (руб.)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  За месяц
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={plan.price.monthly}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      plan.id,
                                      "monthly",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  За 6 месяцев
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={plan.price.halfYearly}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      plan.id,
                                      "halfYearly",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  За 12 месяцев
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={plan.price.yearly}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      plan.id,
                                      "yearly",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-base mb-3 block">
                              Возможности тарифа
                            </Label>
                            <div className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    value={feature}
                                    onChange={(e) =>
                                      handleFeatureChange(
                                        plan.id,
                                        index,
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleRemoveFeature(plan.id, index)
                                    }
                                  >
                                    <X className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => handleAddFeature(plan.id)}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" /> Добавить
                              возможность
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2">
                        Стоимость разового размещения запроса
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="w-48">
                          <Label>Цена (руб.)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={priceConfig.paidRequestPrice}
                            onChange={(e) =>
                              setPriceConfig({
                                ...priceConfig,
                                paidRequestPrice: parseInt(e.target.value) || 0,
                              })
                            }
                            disabled={updatePricingMutation.isPending}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Взимается с заказчика за публикацию.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    size="lg"
                    onClick={handleSavePrices}
                    disabled={updatePricingMutation.isPending}
                  >
                    {updatePricingMutation.isPending
                      ? "Сохранение..."
                      : "Сохранить тарифы"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}

      {/* Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? "Редактировать категорию"
                : "Добавить категорию"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Кейтеринг"
              />
            </div>
            <div className="space-y-2">
              <Label>Иконка (Lucide)</Label>
              <div className="flex items-center gap-3">
                <Select
                  value={categoryFormData.icon}
                  onValueChange={(val) =>
                    setCategoryFormData((p) => ({ ...p, icon: val }))
                  }
                >
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Иконка" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {Object.keys(LucideIcons)
                        .filter(
                          (k) => typeof (LucideIcons as any)[k] === "object",
                        )
                        .map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2">
                              {renderIcon(iconName, { className: "h-4 w-4" })}{" "}
                              {iconName}
                            </div>
                          </SelectItem>
                        ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <div className="p-2 border rounded-md">
                  {renderIcon(categoryFormData.icon, { className: "h-5 w-5" })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEO Dialog */}
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
