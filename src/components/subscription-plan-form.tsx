"use client";

import { useState, useEffect } from "react";
import { CreatePlanDTO } from "@/data/use-subscription-plan";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Hash,
  Type,
  ToggleLeft,
  PencilLine,
} from "lucide-react";

interface SubscriptionPlanFormProps {
  initialData?: any;
  onSubmit: (data: CreatePlanDTO) => void;
  isSubmitting: boolean;
}

type CustomFeatureType = "text" | "number" | "boolean";

interface StandardFeature {
  key: string;
  label: string;
  type: CustomFeatureType;
  value: any;
}

interface CustomFeature {
  id: string;
  keyName: string;
  value: any;
  type: CustomFeatureType;
}

// Initial templates for standard features
const INITIAL_STANDARD_FEATURES: StandardFeature[] = [
  {
    key: "maxPhotoUpload",
    label: "Макс. количество фото",
    type: "number",
    value: 0,
  },
  {
    key: "emailSupport",
    label: "Поддержка по Email",
    type: "boolean",
    value: false,
  },
  {
    key: "chatSupport",
    label: "Поддержка в Чате",
    type: "boolean",
    value: false,
  },
  {
    key: "telephonicSupport",
    label: "Телефонная поддержка",
    type: "boolean",
    value: false,
  },
  {
    key: "prioritySupport",
    label: "Приоритетная поддержка",
    type: "boolean",
    value: false,
  },
  {
    key: "profileSeo",
    label: "SEO настройка профиля",
    type: "boolean",
    value: false,
  },
  {
    key: "profileMarketing",
    label: "Маркетинг профиля",
    type: "boolean",
    value: false,
  },
  {
    key: "portfolioPromotion",
    label: "Продвижение портфолио",
    type: "boolean",
    value: false,
  },
];

export default function SubscriptionPlanForm({
  initialData,
  onSubmit,
  isSubmitting,
}: SubscriptionPlanFormProps) {
  // --- 1. BASIC FORM STATE ---
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    tier: initialData?.tier || "FREE",
    priceMonthly: initialData?.priceMonthly || 0,
    priceHalfYearly: initialData?.priceHalfYearly || null,
    priceYearly: initialData?.priceYearly || null,
    isActive: initialData?.isActive ?? true,
  });

  // --- 2. FEATURES STATE ---
  const [standardFeatures, setStandardFeatures] = useState<StandardFeature[]>(
    [],
  );
  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>([]);

  // Parse initial DB JSON into the UI
  useEffect(() => {
    const sourceFeatures = initialData?.features || {};

    // Process Standard Features
    const initStd: StandardFeature[] = INITIAL_STANDARD_FEATURES.map((def) => {
      const featureData = sourceFeatures[def.key];

      // Check if the data is saved as our new rich object, or if it's legacy flat data
      const isRichObject =
        featureData &&
        typeof featureData === "object" &&
        !Array.isArray(featureData);

      return {
        ...def,
        // Prioritize the saved label from the DB, otherwise fallback to default
        label:
          isRichObject && featureData.label ? featureData.label : def.label,
        // Prioritize the saved value from the DB, otherwise fallback to default
        value:
          isRichObject && featureData.value !== undefined
            ? featureData.value
            : featureData !== undefined
              ? featureData
              : def.value,
      };
    });

    // Process Custom Features (anything not defined in INITIAL_STANDARD_FEATURES)
    const initCust: CustomFeature[] = [];
    const standardKeys = INITIAL_STANDARD_FEATURES.map((f) => f.key);

    Object.entries(sourceFeatures).forEach(([key, featureData]) => {
      if (!standardKeys.includes(key)) {
        const isRichObject =
          featureData &&
          typeof featureData === "object" &&
          !Array.isArray(featureData);

        // Extract value and type handling both new rich objects and old flat data
        const value = isRichObject ? (featureData as any).value : featureData;
        const type: CustomFeatureType = isRichObject
          ? (featureData as any).type
          : typeof value === "boolean"
            ? "boolean"
            : typeof value === "number"
              ? "number"
              : "text";

        initCust.push({
          id: Math.random().toString(),
          keyName: key,
          value: value,
          type: type,
        });
      }
    });

    setStandardFeatures(initStd);
    setCustomFeatures(initCust);
  }, [initialData]);

  // --- 3. HANDLERS ---
  const updateStandardFeature = (
    key: string,
    field: "value" | "label",
    val: any,
  ) => {
    setStandardFeatures((prev) =>
      prev.map((f) => {
        if (f.key !== key) return f;
        return { ...f, [field]: val };
      }),
    );
  };

  const addCustomFeature = () => {
    setCustomFeatures((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        keyName: "newFeature",
        value: "",
        type: "text",
      },
    ]);
  };

  const updateCustomFeature = (
    id: string,
    field: keyof CustomFeature,
    val: any,
  ) => {
    setCustomFeatures((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, [field]: val };

        // Reset value safely if the user changes the data type dropdown
        if (field === "type") {
          updated.value = val === "boolean" ? false : val === "number" ? 0 : "";
        }
        return updated;
      }),
    );
  };

  const removeCustomFeature = (id: string) => {
    setCustomFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const compiledFeatures: Record<string, any> = {};

    // 🚨 FIX: Save standard features as rich JSON objects
    standardFeatures.forEach((f) => {
      compiledFeatures[f.key] = {
        key: f.key,
        label: f.label,
        type: f.type,
        value: f.type === "number" ? Number(f.value) || 0 : f.value,
      };
    });

    // Save custom features uniformly as rich JSON objects
    customFeatures.forEach((cf) => {
      if (cf.keyName.trim() !== "") {
        const cleanKey = cf.keyName.trim();
        compiledFeatures[cleanKey] = {
          key: cleanKey,
          label: cleanKey, // Custom features use the key as the label by default
          type: cf.type,
          value: cf.type === "number" ? Number(cf.value) || 0 : cf.value,
        };
      }
    });

    onSubmit({
      ...formData,
      features: compiledFeatures,
    } as CreatePlanDTO);
  };

  // --- 4. RENDER ---
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20"
    >
      {/* LEFT COLUMN: Basic Info */}
      <div className="xl:col-span-4 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Название тарифа</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Например: Премиум"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Уровень (Tier)</Label>
              <Select
                value={formData.tier}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, tier: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Бесплатный</SelectItem>
                  <SelectItem value="STANDARD">Стандарт</SelectItem>
                  <SelectItem value="PREMIUM">Премиум</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                className="resize-none h-24"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Краткое описание преимуществ..."
              />
            </div>

            <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
              <div>
                <Label htmlFor="active" className="cursor-pointer font-bold">
                  Активный тариф
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Скрыть или показать тариф на сайте.
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, isActive: c })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* PRICING SECTION */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Стоимость (₽)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>За 1 месяц</Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.priceMonthly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceMonthly: parseInt(e.target.value) || 0,
                  })
                }
                className="font-semibold text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>За 6 месяцев</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.priceHalfYearly ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceHalfYearly: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Опционально"
                />
              </div>

              <div className="space-y-2">
                <Label>За 1 год</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.priceYearly ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceYearly: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Опционально"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Feature Matrix Builder */}
      <div className="xl:col-span-8 space-y-6">
        {/* STANDARD FEATURES */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Базовые лимиты и права</CardTitle>
            <CardDescription>
              Стандартный функционал платформы. Вы можете свободно редактировать
              ярлыки (Label), они будут сохранены в базе.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {standardFeatures.map((def) => (
              <div
                key={def.key}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-slate-50 transition-colors gap-4"
              >
                {/* Editable Label Area */}
                <div className="flex-1 min-w-0">
                  <div className="relative group">
                    <Input
                      value={def.label}
                      onChange={(e) =>
                        updateStandardFeature(def.key, "label", e.target.value)
                      }
                      className="h-8 text-sm font-semibold border-transparent hover:border-input focus:border-input bg-transparent px-1 -ml-1 transition-all"
                      title="Изменить название фичи"
                    />
                    <PencilLine className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 bg-slate-100 w-fit px-1.5 rounded">
                    {def.key}
                  </p>
                </div>

                {/* Value Input Area */}
                <div className="shrink-0 flex items-center justify-end">
                  {def.type === "boolean" ? (
                    <Switch
                      checked={!!def.value}
                      onCheckedChange={(checked) =>
                        updateStandardFeature(def.key, "value", checked)
                      }
                    />
                  ) : (
                    <Input
                      type="number"
                      className="w-20 text-center font-semibold h-9"
                      min="0"
                      value={def.value}
                      onChange={(e) =>
                        updateStandardFeature(def.key, "value", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* DYNAMIC CUSTOM FEATURES BUILDER */}
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-primary">
                Дополнительные опции (Custom Keys)
              </CardTitle>
              <CardDescription>
                Добавляйте новые ключи (на англ.) и значения для гибкой
                настройки логики в основном приложении.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addCustomFeature}
              variant="secondary"
            >
              <Plus className="mr-2 h-4 w-4" /> Добавить опцию
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {customFeatures.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground bg-slate-50/50">
                Дополнительные опции не заданы. Нажмите "Добавить опцию" чтобы
                начать.
              </div>
            ) : (
              customFeatures.map((feat) => (
                <div
                  key={feat.id}
                  className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-white items-start sm:items-center shadow-sm"
                >
                  {/* Key Name Input */}
                  <div className="flex-1 w-full">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Ключ в БД (Key)
                    </Label>
                    <Input
                      value={feat.keyName}
                      onChange={(e) =>
                        updateCustomFeature(feat.id, "keyName", e.target.value)
                      }
                      placeholder="например: canUploadVideo"
                      className="font-mono text-sm bg-slate-50"
                    />
                  </div>

                  {/* Type Selector */}
                  <div className="w-full sm:w-[160px]">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Тип данных
                    </Label>
                    <Select
                      value={feat.type}
                      onValueChange={(val: CustomFeatureType) =>
                        updateCustomFeature(feat.id, "type", val)
                      }
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boolean">
                          <span className="flex items-center">
                            <ToggleLeft className="w-4 h-4 mr-2" /> Да/Нет
                          </span>
                        </SelectItem>
                        <SelectItem value="number">
                          <span className="flex items-center">
                            <Hash className="w-4 h-4 mr-2" /> Число
                          </span>
                        </SelectItem>
                        <SelectItem value="text">
                          <span className="flex items-center">
                            <Type className="w-4 h-4 mr-2" /> Текст
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Value Input */}
                  <div className="w-full sm:w-[200px]">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Значение
                    </Label>
                    <div className="h-10 flex items-center">
                      {feat.type === "boolean" ? (
                        <div className="flex items-center gap-3 h-full px-2">
                          <Switch
                            checked={!!feat.value}
                            onCheckedChange={(c) =>
                              updateCustomFeature(feat.id, "value", c)
                            }
                          />
                          <span className="text-sm font-medium">
                            {feat.value ? "Включено" : "Отключено"}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type={feat.type === "number" ? "number" : "text"}
                          value={feat.value}
                          onChange={(e) =>
                            updateCustomFeature(
                              feat.id,
                              "value",
                              e.target.value,
                            )
                          }
                          placeholder={
                            feat.type === "number" ? "Число..." : "Текст..."
                          }
                        />
                      )}
                    </div>
                  </div>

                  {/* Delete Button (Desktop) */}
                  <div className="pt-5 hidden sm:block">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeCustomFeature(feat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Delete Button (Mobile) */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full sm:hidden mt-2"
                    onClick={() => removeCustomFeature(feat.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Удалить опцию
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Master Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Save className="mr-2 h-6 w-6" />
            )}
            Сохранить тариф
          </Button>
        </div>
      </div>
    </form>
  );
}
