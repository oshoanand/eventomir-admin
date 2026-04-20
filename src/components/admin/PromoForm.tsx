"use client";

import { useState } from "react";
import { PromoCodeInput } from "@/services/promo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/utils";

interface PromoFormProps {
  initialData?: Partial<PromoCodeInput>;
  onSubmit: (data: PromoCodeInput) => void;
  isLoading: boolean;
  title: string;
}

export function PromoForm({
  initialData,
  onSubmit,
  isLoading,
  title,
}: PromoFormProps) {
  const [formData, setFormData] = useState<PromoCodeInput>({
    code: initialData?.code || "",
    type: initialData?.type || "PERCENTAGE",
    value: initialData?.value || 0,
    maxDiscountAmount: initialData?.maxDiscountAmount || null,
    minOrderAmount: initialData?.minOrderAmount || null,
    isSingleUsePerUser: initialData?.isSingleUsePerUser ?? false,
    maxUses: initialData?.maxUses || null,
    validUntil: initialData?.validUntil
      ? new Date(initialData.validUntil).toISOString().split("T")[0]
      : null,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-in fade-in zoom-in-95 duration-500">
      <Link
        href="/promo"
        className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Назад к списку
      </Link>

      <div className="bg-card border rounded-3xl p-8 shadow-xl shadow-black/5">
        <h1 className="text-3xl font-black mb-8 tracking-tight">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. ОСНОВНАЯ ИНФОРМАЦИЯ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold">Код (ПРОМОКОД)</Label>
              <Input
                required
                className="uppercase font-mono text-lg tracking-wider"
                placeholder="SUMMER2026"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold">Статус</Label>
              <div className="flex items-center h-10 gap-3 bg-muted/30 px-4 rounded-xl border">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, isActive: val })
                  }
                  className="data-[state=checked]:bg-orange-500"
                />
                <span className="font-medium text-sm">
                  {formData.isActive ? "Активен" : "Отключен"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* 2. НАСТРОЙКИ СКИДКИ */}
          <div>
            <h3 className="font-bold text-lg mb-4">Настройки скидки</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-3">
                <Label className="text-sm font-bold">Тип скидки</Label>
                <div className="flex rounded-xl bg-muted/50 p-1 border">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                      formData.type === "PERCENTAGE"
                        ? "bg-orange-500 text-white shadow-md" // 👈 Оранжевый активный таб
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "PERCENTAGE",
                        maxDiscountAmount: null,
                      })
                    }
                  >
                    Процент (%)
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                      formData.type === "FLAT"
                        ? "bg-orange-500 text-white shadow-md" // 👈 Оранжевый активный таб
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "FLAT",
                        maxDiscountAmount: null,
                      })
                    }
                  >
                    Сумма (₽)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">Размер скидки</Label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    min="1"
                    className="pl-4 pr-10 font-bold"
                    value={formData.value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: parseFloat(e.target.value),
                      })
                    }
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    {formData.type === "PERCENTAGE" ? "%" : "₽"}
                  </span>
                </div>
              </div>

              {formData.type === "PERCENTAGE" && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <Label className="text-sm font-bold">Макс. скидка (₽)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Без лимита"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* 3. ОГРАНИЧЕНИЯ И ПРАВИЛА */}
          <div>
            <h3 className="font-bold text-lg mb-4">Ограничения и правила</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* ПРИВЯЗКА К ПОЛЬЗОВАТЕЛЮ */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">
                  Привязка к пользователю
                </Label>
                <div className="flex rounded-xl bg-muted/50 p-1 border">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                      !formData.isSingleUsePerUser
                        ? "bg-orange-500 text-white shadow-md" // 👈 Оранжевый активный таб
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() =>
                      setFormData({ ...formData, isSingleUsePerUser: false })
                    }
                  >
                    Многоразовый
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                      formData.isSingleUsePerUser
                        ? "bg-orange-500 text-white shadow-md" // 👈 Оранжевый активный таб
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() =>
                      setFormData({ ...formData, isSingleUsePerUser: true })
                    }
                  >
                    1 раз на аккаунт
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium leading-tight px-1">
                  {formData.isSingleUsePerUser
                    ? "Каждый клиент сможет применить этот промокод только один раз за все время."
                    : "Клиенты смогут использовать этот промокод неограниченное число раз."}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">
                  Лимит активаций (Всего)
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Бесконечно"
                  value={formData.maxUses || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
                <p className="text-[11px] text-muted-foreground font-medium px-1 mt-1">
                  Максимальное количество применений промокода всеми
                  пользователями суммарно.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold">
                  Мин. сумма заказа (₽)
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="От любой суммы"
                  value={formData.minOrderAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderAmount: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">Срок действия (до)</Label>
                <Input
                  type="date"
                  className="w-full"
                  value={formData.validUntil || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      validUntil: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* 4. КНОПКА СОХРАНЕНИЯ */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                  Сохранение...
                </>
              ) : (
                "Сохранить промокод"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
