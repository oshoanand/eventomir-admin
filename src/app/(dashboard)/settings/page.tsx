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

const popularFonts = [
  "Arial, sans-serif",
  "Verdana, sans-serif",
  "Helvetica, sans-serif",
  "Tahoma, sans-serif",
  "Trebuchet MS, sans-serif",
  "Times New Roman, serif",
  "Georgia, serif",
  "Garamond, serif",
  "Courier New, monospace",
  "Brush Script MT, cursive",
];

const SettingsPage = () => {
  const { toast } = useToast();

  // --- 1. Data Fetching via React Query ---
  const { data: serverSettings, isLoading: isSettingsLoading } =
    useGeneralSettingsQuery();
  const { data: serverPrices, isLoading: isPricesLoading } =
    usePricingConfigQuery();

  // --- 2. Mutations ---
  const updateSettingsMutation = useUpdateSettingsMutation();
  const updatePricingMutation = useUpdatePricingMutation();
  const uploadFileMutation = useFileUploadMutation();

  // --- 3. Local State (Initialized from Server Data) ---
  // We keep local state so users can edit inputs before saving
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [priceConfig, setPriceConfig] = useState<FullPriceConfig | null>(null);

  // Sync server data to local state when loaded
  useEffect(() => {
    if (serverSettings) setSettings(serverSettings);
  }, [serverSettings]);

  useEffect(() => {
    if (serverPrices) setPriceConfig(serverPrices);
  }, [serverPrices]);

  // States for file uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // States for category dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SiteCategory | null>(
    null,
  );
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    icon: string;
  }>({ name: "", icon: "PlusCircle" });

  // States for SEO Dialog
  const [isSeoDialogOpen, setIsSeoDialogOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<PageSEO | null>(null);
  const [seoFormData, setSeoFormData] = useState<PageSEO>({
    path: "",
    title: "",
    description: "",
    keywords: "",
  });
  const isEditingSeoDialog = !!editingSeo;

  // --- Handlers ---

  // Generic handler to update local settings state
  const handleSettingsChange = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleContactSettingsChange = (
    field: keyof SiteSettings["contacts"],
    value: string,
  ) => {
    setSettings((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        contacts: {
          ...prev.contacts,
          [field]: value,
        },
      };
    });
  };

  // --- SAVE LOGIC (General) ---
  const handleSaveSettings = async (keysToSave: (keyof SiteSettings)[]) => {
    if (!settings) return;

    // Create a copy of the settings to modify
    let settingsToUpdateFull = { ...settings };

    try {
      // 1. Handle File Uploads first if they exist
      if (logoFile) {
        toast({ description: "Загрузка логотипа..." });
        const response = await uploadFileMutation.mutateAsync({
          file: logoFile,
          type: "logo",
        });
        // @ts-ignore - assuming response returns { url: string }
        settingsToUpdateFull.logoUrl = response.url;
      }
      if (faviconFile) {
        toast({ description: "Загрузка фавикона..." });
        const response = await uploadFileMutation.mutateAsync({
          file: faviconFile,
          type: "favicon",
        });
        // @ts-ignore
        settingsToUpdateFull.faviconUrl = response.url;
      }

      // 2. Prepare Partial Update Object
      const partialUpdate: Partial<SiteSettings> = {};
      keysToSave.forEach((key) => {
        // @ts-ignore
        partialUpdate[key] = settingsToUpdateFull[key];
      });

      // Always include URLs if they were just updated via upload
      if (logoFile) partialUpdate.logoUrl = settingsToUpdateFull.logoUrl;
      if (faviconFile)
        partialUpdate.faviconUrl = settingsToUpdateFull.faviconUrl;

      // 3. Trigger Mutation
      updateSettingsMutation.mutate(partialUpdate, {
        onSuccess: () => {
          // Clear file inputs on success
          setLogoFile(null);
          setFaviconFile(null);
          // Update local state with the new URLs if needed
          setSettings(settingsToUpdateFull);
        },
      });
    } catch (error) {
      console.error("Save flow failed", error);
      // Error toast is handled by mutation hook
    }
  };

  // --- SAVE LOGIC (Prices) ---
  const handleSavePrices = () => {
    if (!priceConfig) return;
    updatePricingMutation.mutate(priceConfig);
  };

  // --- UI Helpers ---
  const renderIcon = (iconName: string, props: any) => {
    // @ts-ignore
    const IconComponent = LucideIcons[iconName] as React.ElementType;
    if (!IconComponent) {
      // @ts-ignore
      return <LucideIcons.HelpCircle {...props} />;
    }
    return <IconComponent {...props} />;
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setSettings((prev) =>
        prev ? { ...prev, logoUrl: URL.createObjectURL(file) } : null,
      );
    }
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/x-icon", "image/png", "image/svg+xml"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Допустимые форматы для фавикона: .ico, .png, .svg.",
        });
        return;
      }
      setFaviconFile(file);
      setSettings((prev) =>
        prev ? { ...prev, faviconUrl: URL.createObjectURL(file) } : null,
      );
    }
  };

  // --- Category Handlers ---
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

  const handleCategoryFormChange = (field: "name" | "icon", value: string) => {
    setCategoryFormData((prev) => ({ ...prev, [field]: value }));
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
    // @ts-ignore
    if (!LucideIcons[categoryFormData.icon]) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Укажите неверное имя иконки Lucide.",
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
      const newCategory: SiteCategory = {
        id: String(Date.now()),
        ...categoryFormData,
      };
      updatedCategories = [...settings.siteCategories, newCategory];
    }
    handleSettingsChange("siteCategories", updatedCategories);
    setIsCategoryDialogOpen(false);
    toast({
      title: "Изменения готовы к сохранению",
      description:
        "Нажмите кнопку 'Сохранить Категории', чтобы применить изменения.",
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!settings) return;
    const updatedCategories = settings.siteCategories.filter(
      (cat) => cat.id !== categoryId,
    );
    handleSettingsChange("siteCategories", updatedCategories);
    toast({
      title: "Категория готова к удалению",
      description: "Нажмите 'Сохранить Категории' для подтверждения.",
      variant: "destructive",
    });
  };

  // --- Price Handlers ---
  const handlePriceChange = (
    planId: SubscriptionPlanDetails["id"],
    duration: "monthly" | "halfYearly" | "yearly",
    value: string,
  ) => {
    setPriceConfig((prevConfig) => {
      if (!prevConfig) return null;
      const newPrice = parseInt(value, 10);
      if (isNaN(newPrice) || newPrice < 0) return prevConfig;

      return {
        ...prevConfig,
        plans: prevConfig.plans.map((plan) =>
          plan.id === planId
            ? { ...plan, price: { ...plan.price, [duration]: newPrice } }
            : plan,
        ),
      };
    });
  };

  const handlePlanFieldChange = (
    planId: SubscriptionPlanDetails["id"],
    field: "name" | "description",
    value: string,
  ) => {
    setPriceConfig((prevConfig) => {
      if (!prevConfig) return null;
      return {
        ...prevConfig,
        plans: prevConfig.plans.map((plan) =>
          plan.id === planId ? { ...plan, [field]: value } : plan,
        ),
      };
    });
  };

  const handleFeatureChange = (
    planId: SubscriptionPlanDetails["id"],
    featureIndex: number,
    value: string,
  ) => {
    setPriceConfig((prevConfig) => {
      if (!prevConfig) return null;
      return {
        ...prevConfig,
        plans: prevConfig.plans.map((plan) => {
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

  const handleAddFeature = (planId: SubscriptionPlanDetails["id"]) => {
    setPriceConfig((prevConfig) => {
      if (!prevConfig) return null;
      return {
        ...prevConfig,
        plans: prevConfig.plans.map((plan) =>
          plan.id === planId
            ? { ...plan, features: [...plan.features, "Новая возможность"] }
            : plan,
        ),
      };
    });
  };

  const handleRemoveFeature = (
    planId: SubscriptionPlanDetails["id"],
    featureIndex: number,
  ) => {
    setPriceConfig((prevConfig) => {
      if (!prevConfig) return null;
      return {
        ...prevConfig,
        plans: prevConfig.plans.map((plan) => {
          if (plan.id === planId) {
            const newFeatures = plan.features.filter(
              (_, index) => index !== featureIndex,
            );
            return { ...plan, features: newFeatures };
          }
          return plan;
        }),
      };
    });
  };

  const handlePaidRequestPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    const newPrice = parseInt(value, 10);
    if (priceConfig) {
      if (!isNaN(newPrice) && newPrice >= 0) {
        setPriceConfig({ ...priceConfig, paidRequestPrice: newPrice });
      } else if (value === "") {
        setPriceConfig({ ...priceConfig, paidRequestPrice: 0 });
      }
    }
  };

  // --- SEO Handlers ---
  const openSeoDialog = (seo: PageSEO | null) => {
    setEditingSeo(seo);
    setSeoFormData(
      seo || { path: "", title: "", description: "", keywords: "" },
    );
    setIsSeoDialogOpen(true);
  };

  const handleSeoFormChange = (field: keyof PageSEO, value: string) => {
    setSeoFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSeo = () => {
    if (!settings || !seoFormData.path.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Путь к странице (URL) обязателен.",
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
          description: "SEO для этого пути уже существует.",
        });
        return;
      }
      updatedSeoList = [...settings.pageSpecificSEO, seoFormData];
    }
    handleSettingsChange("pageSpecificSEO", updatedSeoList);
    setIsSeoDialogOpen(false);
    toast({
      title: "SEO-настройки готовы к сохранению",
      description:
        "Нажмите 'Сохранить SEO-настройки', чтобы применить изменения.",
    });
  };

  const handleRemoveSeo = (path: string) => {
    if (!settings) return;
    const updatedSeoList = settings.pageSpecificSEO.filter(
      (s) => s.path !== path,
    );
    handleSettingsChange("pageSpecificSEO", updatedSeoList);
    toast({
      title: "SEO-настройки готовы к удалению",
      description: "Нажмите 'Сохранить SEO-настройки' для подтверждения.",
      variant: "destructive",
    });
  };

  // --- Skeletons ---
  const SettingsSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );

  const PriceSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Separator />
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Separator />
      <Skeleton className="h-8 w-1/3 mb-2" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-10 w-32" />
    </div>
  );

  if (isSettingsLoading || !settings) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <SettingsSkeleton />
        <SettingsSkeleton />
        <SettingsSkeleton />
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-2 pb-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Settings className="mr-2 h-6 w-6" /> Настройки Сайта
          </CardTitle>
          <CardDescription>
            Управление основными параметрами и внешним видом платформы
            Eventomir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" /> Общие настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Название сайта</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleSettingsChange("siteName", e.target.value)
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Логотип</Label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <label
                    htmlFor="logoFile"
                    className="w-32 h-32 bg-muted rounded flex items-center justify-center flex-shrink-0 border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt={settings.logoAltText || "Логотип сайта"}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-8 w-8 group-hover:text-primary" />
                        <p className="text-xs mt-1">Загрузить лого</p>
                      </div>
                    )}
                  </label>
                  <Input
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                  <div className="flex-grow space-y-2">
                    <Label htmlFor="logoAltText">
                      Alt текст для логотипа (SEO)
                    </Label>
                    <Input
                      id="logoAltText"
                      type="text"
                      placeholder="Краткое описание логотипа"
                      value={settings.logoAltText}
                      onChange={(e) =>
                        handleSettingsChange("logoAltText", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Опишите логотип для поисковых систем и доступности.
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Фавикон</Label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="faviconFile"
                    className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0 border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    {settings.faviconUrl ? (
                      <img
                        src={settings.faviconUrl}
                        alt="Фавикон сайта"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    )}
                  </label>
                  <Input
                    id="faviconFile"
                    type="file"
                    accept=".ico, image/png, image/svg+xml"
                    className="hidden"
                    onChange={handleFaviconFileChange}
                  />
                  <div className="text-xs text-muted-foreground">
                    <p>Нажмите на иконку, чтобы загрузить файл.</p>
                    <p>Рекомендуемый формат: ICO, PNG, SVG (32x32 px).</p>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  handleSaveSettings([
                    "siteName",
                    "logoAltText",
                    "logoUrl",
                    "faviconUrl",
                  ])
                }
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending
                  ? "Сохранение..."
                  : "Сохранить общие настройки"}
              </Button>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Mail className="mr-2 h-5 w-5" /> Контактная информация и
                соцсети
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
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
              <div>
                <Label htmlFor="contactPhone">Контактный Телефон</Label>
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
              <div>
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
              <div>
                <Label htmlFor="telegramLink">Ссылка на Telegram</Label>
                <Input
                  id="telegramLink"
                  type="url"
                  value={settings.contacts?.telegramLink || ""}
                  onChange={(e) =>
                    handleContactSettingsChange("telegramLink", e.target.value)
                  }
                  placeholder="https://t.me/..."
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => handleSaveSettings(["contacts"])}
                disabled={updateSettingsMutation.isPending}
              >
                Сохранить контакты
              </Button>
            </CardContent>
          </Card>

          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Palette className="mr-2 h-5 w-5" /> Цветовая схема
              </CardTitle>
              <CardDescription>
                Выберите цвета, которые будут использоваться на сайте.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="backgroundColor">Цвет фона</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.theme.backgroundColor}
                  onChange={(e) =>
                    handleSettingsChange("theme", {
                      ...settings.theme,
                      backgroundColor: e.target.value,
                    })
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="primaryColor">Основной цвет</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.theme.primaryColor}
                  onChange={(e) =>
                    handleSettingsChange("theme", {
                      ...settings.theme,
                      primaryColor: e.target.value,
                    })
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="accentColor">Акцентный цвет</Label>
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.theme.accentColor}
                  onChange={(e) =>
                    handleSettingsChange("theme", {
                      ...settings.theme,
                      accentColor: e.target.value,
                    })
                  }
                  className="h-10"
                />
              </div>
              <div className="sm:col-span-3">
                <Button
                  variant="destructive"
                  onClick={() => handleSaveSettings(["theme"])}
                  disabled={updateSettingsMutation.isPending}
                >
                  Сохранить цветовую схему
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center">
                  <Tags className="mr-2 h-5 w-5" /> SEO-настройки по страницам
                </CardTitle>
                <CardDescription>
                  Управляйте мета-тегами для каждой страницы вашего сайта.
                </CardDescription>
              </div>
              <Button variant="destructive" onClick={() => openSeoDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Добавить страницу
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  {settings.pageSpecificSEO.length > 0 ? (
                    settings.pageSpecificSEO.map((seo) => (
                      <div
                        key={seo.path}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                      >
                        <div className="flex-grow">
                          <p className="font-mono text-sm font-semibold text-primary">
                            {seo.path}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {seo.title}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openSeoDialog(seo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveSeo(seo.path)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      SEO-настройки для страниц еще не добавлены.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <Button
                variant="destructive"
                onClick={() => handleSaveSettings(["pageSpecificSEO"])}
                disabled={updateSettingsMutation.isPending}
                className="mt-4"
              >
                Сохранить SEO-настройки
              </Button>
            </CardContent>
          </Card>

          {/* Fonts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TypeIcon className="mr-2 h-5 w-5" /> Шрифты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fontFamilySelect">Основной шрифт сайта</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) =>
                    handleSettingsChange("fontFamily", value)
                  }
                >
                  <SelectTrigger id="fontFamilySelect">
                    <SelectValue placeholder="Выберите шрифт" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularFonts.map((font) => (
                      <SelectItem
                        key={font}
                        value={font}
                        style={{ fontFamily: font }}
                      >
                        {font.split(",")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleSaveSettings(["fontFamily"])}
                disabled={updateSettingsMutation.isPending}
              >
                Сохранить настройки шрифтов
              </Button>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center">
                  <UserCog className="mr-2 h-5 w-5" /> Управление категориями
                </CardTitle>
                <CardDescription>
                  Добавляйте, редактируйте или удаляйте категории услуг.
                </CardDescription>
              </div>
              <Button variant="destructive" onClick={openAddCategoryDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Добавить категорию
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-72 w-full rounded-md border">
                <div className="p-4">
                  {settings.siteCategories.length > 0 ? (
                    settings.siteCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          {renderIcon(category.icon, {
                            className: "h-5 w-5 text-muted-foreground",
                          })}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditCategoryDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Редактировать</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Удалить</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      Категорий пока нет.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <Button
                variant="destructive"
                onClick={() => handleSaveSettings(["siteCategories"])}
                disabled={updateSettingsMutation.isPending}
              >
                Сохранить Категории
              </Button>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="mr-2 h-5 w-5" /> Управление Тарифами
              </CardTitle>
              <CardDescription>
                Управляйте названиями, описаниями, ценами и возможностями
                тарифных планов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPricesLoading || !priceConfig ? (
                <PriceSkeleton />
              ) : (
                <div className="space-y-8">
                  {priceConfig.plans
                    .filter((p) => p.id !== "econom")
                    .map((plan) => (
                      <Card key={plan.id} className="p-4">
                        <CardHeader className="p-2">
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-4">
                          <div>
                            <Label htmlFor={`plan-name-${plan.id}`}>
                              Название тарифа
                            </Label>
                            <Input
                              id={`plan-name-${plan.id}`}
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
                          <div>
                            <Label htmlFor={`plan-desc-${plan.id}`}>
                              Описание тарифа
                            </Label>
                            <Textarea
                              id={`plan-desc-${plan.id}`}
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
                          <div>
                            <Label>Цены (руб.)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                              <div>
                                <Label htmlFor={`${plan.id}-monthly`}>
                                  За месяц
                                </Label>
                                <Input
                                  id={`${plan.id}-monthly`}
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
                                <Label htmlFor={`${plan.id}-halfYearly`}>
                                  За 6 месяцев
                                </Label>
                                <Input
                                  id={`${plan.id}-halfYearly`}
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
                                <Label htmlFor={`${plan.id}-yearly`}>
                                  За 12 месяцев
                                </Label>
                                <Input
                                  id={`${plan.id}-yearly`}
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
                            <Label>Возможности тарифа</Label>
                            <div className="space-y-2 mt-2">
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
                                    className="flex-grow"
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
                              className="mt-2"
                              onClick={() => handleAddFeature(plan.id)}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Добавить возможность
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-medium text-base mb-2">
                      Стоимость размещения платного запроса (руб.)
                    </h4>
                    <div>
                      <Label htmlFor="paidRequestPrice">
                        Цена за один запрос
                      </Label>
                      <Input
                        id="paidRequestPrice"
                        type="number"
                        min="0"
                        value={priceConfig.paidRequestPrice}
                        onChange={handlePaidRequestPriceChange}
                        disabled={updatePricingMutation.isPending}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Эта цена будет взиматься с заказчика за публикацию
                        одного платного запроса.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleSavePrices}
                    disabled={updatePricingMutation.isPending}
                    className="mt-6"
                  >
                    {updatePricingMutation.isPending
                      ? "Сохранение..."
                      : "Сохранить все тарифы"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Dialogs - Kept as is, using local state */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? "Редактировать категорию"
                : "Добавить новую категорию"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Измените название или иконку категории."
                : "Введите название и выберите иконку для новой категории."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Название
              </Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) =>
                  handleCategoryFormChange("name", e.target.value)
                }
                className="col-span-3"
                placeholder="Например, Кейтеринг"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryIcon" className="text-right">
                Иконка (Lucide)
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Select
                  value={categoryFormData.icon}
                  onValueChange={(value) =>
                    handleCategoryFormChange("icon", value)
                  }
                >
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Выберите иконку" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {Object.keys(LucideIcons)
                        .filter(
                          (key) =>
                            typeof (LucideIcons as any)[key] === "object",
                        )
                        .map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2">
                              {renderIcon(iconName, { className: "h-4 w-4" })}
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
            {categoryFormData.icon &&
              !(LucideIcons as any)[categoryFormData.icon] && (
                <p className="col-span-4 text-xs text-destructive text-center">
                  Введено неверное имя иконки Lucide. Выберите из списка.
                </p>
              )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSaveCategory}
            >
              {editingCategory ? "Сохранить изменения" : "Добавить категорию"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSeoDialogOpen} onOpenChange={setIsSeoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSeo ? "Редактировать SEO" : "Добавить SEO для страницы"}
            </DialogTitle>
            <DialogDescription>
              Укажите мета-теги для конкретной страницы.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="seoPath">Путь страницы (URL)</Label>
              <Input
                id="seoPath"
                value={seoFormData.path}
                onChange={(e) => handleSeoFormChange("path", e.target.value)}
                placeholder="например, /about или /partnership"
                disabled={isEditingSeoDialog}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Заголовок (Title)</Label>
              <Input
                id="seoTitle"
                value={seoFormData.title}
                onChange={(e) => handleSeoFormChange("title", e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">Описание (Description)</Label>
              <Textarea
                id="seoDescription"
                value={seoFormData.description}
                onChange={(e) =>
                  handleSeoFormChange("description", e.target.value)
                }
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">
                Ключевые слова (через запятую)
              </Label>
              <Input
                id="seoKeywords"
                value={seoFormData.keywords}
                onChange={(e) =>
                  handleSeoFormChange("keywords", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleSaveSeo}>
              {editingSeo ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
