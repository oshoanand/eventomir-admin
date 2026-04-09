"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Loader2, BellRing, History, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// 🚨 1. Import the robust API client and Error class
import { apiRequest, ApiError } from "@/utils/api-client";

// 2. EVENTOMIR CONFIGURATION MAPPING
const TOPIC_CONFIG = {
  customers:
    process.env.NEXT_PUBLIC_CUSTOMER_FCM_TOPIC || "eventomir_customer_topic",
  performers:
    process.env.NEXT_PUBLIC_PERFORMER_FCM_TOPIC || "eventomir_performer_topic",
  all_users:
    process.env.NEXT_PUBLIC_ALL_USERS_FCM_TOPIC || "eventomir_all_users_topic",
  specific_user: "", // Requires manual input (e.g., user_9898989898)
};

type SelectionType = "customers" | "performers" | "all_users" | "specific_user";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [targetType, setTargetType] = useState<SelectionType>("customers");

  // Form State
  const [formData, setFormData] = useState({
    target: TOPIC_CONFIG.customers,
    title: "",
    body: "",
  });

  const handleTypeChange = (value: SelectionType) => {
    setTargetType(value);

    if (value === "specific_user") {
      // Clear target for manual entry
      setFormData((prev) => ({ ...prev, target: "" }));
    } else {
      // Auto-populate from predefined topics
      setFormData((prev) => ({ ...prev, target: TOPIC_CONFIG[value] }));
    }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.body || !formData.target) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Smart check: If target is extremely long, it's an FCM Token. Otherwise, it's a Topic.
      const isToken =
        targetType === "specific_user" && formData.target.length > 50;

      // 🚨 3. Use your custom apiRequest function
      await apiRequest({
        url: "/api/admin/notifications/send",
        method: "POST",
        data: {
          type: isToken ? "token" : "topic",
          target: formData.target,
          title: formData.title,
          body: formData.body,
        },
      });

      // If no error is thrown, the request was successful
      toast({
        title: "Успешно!",
        description: "Уведомление успешно отправлено.",
        variant: "success",
      });

      // Reset form but keep the current target logic intact
      setFormData((prev) => ({ ...prev, title: "", body: "" }));
      if (targetType === "specific_user") {
        setFormData((prev) => ({ ...prev, target: "" }));
      }
    } catch (error) {
      console.error(error);

      // 🚨 4. Handle custom ApiError gracefully
      if (error instanceof ApiError) {
        toast({
          title: "Ошибка отправки",
          description: error.message || "Не удалось отправить уведомление",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Системная ошибка",
          description: "Произошла ошибка при соединении с сервером",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Push Уведомления
          </h2>
          <p className="text-muted-foreground">
            Отправляйте FCM-сообщения конкретным пользователям или группам
            (топикам).
          </p>
        </div>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
          asChild
        >
          <Link href="/notifications/history">
            <History className="mr-2 h-4 w-4" />
            История
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        {/* --- Left Column: Input Form --- */}
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Создать сообщение</CardTitle>
            <CardDescription>
              Настройте детали вашего push-уведомления.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Целевая аудитория</Label>
                <Select
                  value={targetType}
                  onValueChange={(val: SelectionType) => handleTypeChange(val)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Выберите аудиторию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customers">
                      Клиенты (Customers)
                    </SelectItem>
                    <SelectItem value="performers">
                      Исполнители (Performers)
                    </SelectItem>
                    <SelectItem value="all_users">Все пользователи</SelectItem>
                    <SelectItem value="specific_user">
                      Конкретный пользователь
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="target">
                    {targetType === "specific_user"
                      ? "Топик (user_123) или Токен"
                      : "Имя топика (Автоматически)"}
                  </Label>
                  {targetType !== "specific_user" ? (
                    <Lock className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Unlock className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <Input
                  id="target"
                  placeholder={
                    targetType === "specific_user"
                      ? "user_9898989898 или FCM Токен..."
                      : "Топик из .env"
                  }
                  value={formData.target}
                  readOnly={targetType !== "specific_user"}
                  disabled={targetType !== "specific_user"}
                  className={
                    targetType !== "specific_user"
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800"
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Заголовок уведомления</Label>
              <Input
                id="title"
                placeholder="например: Специальное предложение!"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Текст сообщения</Label>
              <Textarea
                id="body"
                placeholder="Введите текст уведомления здесь..."
                className="min-h-[100px] resize-none"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end bg-gray-50/50 dark:bg-gray-900/50 py-4 rounded-b-xl">
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="w-full md:w-auto font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Отправить
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* --- Right Column: Live Preview --- */}
        <div className="col-span-4 lg:col-span-3">
          <Card className="h-full bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Предпросмотр
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-4 pb-8">
              {/* Mobile Phone Simulation */}
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[500px] w-[300px] shadow-xl">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

                {/* Screen Content */}
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[472px] bg-white dark:bg-gray-950 relative">
                  {/* Status Bar */}
                  <div className="h-6 bg-slate-100 dark:bg-slate-900 w-full flex justify-between items-center px-4 text-[10px] text-gray-500">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>

                  {/* Wallpaper / Home Screen */}
                  <div className="p-4 pt-10 space-y-4 h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                    {/* The Notification Card */}
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                          <BellRing className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                              Eventomir
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Сейчас
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                            {formData.title || "Заголовок уведомления"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug break-words">
                            {formData.body ||
                              "Текст сообщения будет отображаться здесь на устройстве пользователя."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
