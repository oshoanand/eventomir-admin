"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";
import { useToast } from "@/hooks/use-toast";

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
  subCategories?: SubCategory[];
}

export interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string;
}

// 🚨 ADDED COMMISSION SLAB INTERFACE
export interface CommissionSlab {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number | null; // null means infinity (e.g., 100,000+)
  percent: number;
  flat: number;
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

  // 🚨 ADDED FINANCE FIELDS
  paidRequestPrice: number;
  commissionRatePercent: number;
  commissionRateFlat: number;
  commissionSlabs: CommissionSlab[];
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
        description: "Настройки сайта успешно обновлены.",
        variant: "default",
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
