"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";
import { useToast } from "@/hooks/use-toast";

// --- NEW: SubCategory Interface ---
export interface SubCategory {
  id: string;
  name: string;
  link: string;
}

export interface SiteCategory {
  id: string;
  name: string;
  icon: string;
  link?: string;
  subCategories?: SubCategory[]; // --- NEW: Added subCategories array ---
}

export interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  logoAltText: string;
  faviconUrl: string;
  contacts: {
    email: string;
    phone: string;
    vkLink: string;
    telegramLink: string;
  };
  theme: {
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
  };
  siteCategories: SiteCategory[];
  pageSpecificSEO: PageSEO[];
  fontFamily: string;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    halfYearly: number;
    yearly: number;
  };
  features: string[];
}

export interface FullPriceConfig {
  plans: SubscriptionPlanDetails[];
  paidRequestPrice: number;
}

// --- API Functions ---

const fetchGeneralSettings = async (): Promise<SiteSettings> => {
  return await apiRequest({
    method: "get",
    url: "/api/settings/general",
  });
};

const updateGeneralSettings = async (settings: Partial<SiteSettings>) => {
  return await apiRequest({
    method: "put",
    url: "/api/settings/general",
    data: settings,
  });
};

const uploadFile = async (payload: {
  file: File;
  type: "logo" | "favicon";
}) => {
  const formData = new FormData();
  formData.append("file", payload.file);

  return await apiRequest({
    method: "post",
    url: "/api/settings/upload",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// --- Hooks ---

export function useGeneralSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "general"],
    queryFn: fetchGeneralSettings,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "general"], data);
      toast({
        title: "Настройки сохранены",
        description: "Общие настройки сайта успешно обновлены.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки.",
        variant: "destructive",
      });
    },
  });
}

export function useFileUploadMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: uploadFile,
    onError: (error: any) => {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить файл.",
        variant: "destructive",
      });
    },
  });
}
