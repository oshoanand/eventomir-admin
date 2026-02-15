"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

// Ensure these match your Prisma schema / Backend response
export interface SiteCategory {
  id: string;
  name: string;
  icon: string;
  link?: string;
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

const fetchPricingConfig = async (): Promise<FullPriceConfig> => {
  return await apiRequest({
    method: "get",
    url: "/api/settings/pricing",
  });
};

const updatePricingConfig = async (config: FullPriceConfig) => {
  return await apiRequest({
    method: "put",
    url: "/api/settings/pricing",
    data: config,
  });
};

const uploadFile = async (payload: {
  file: File;
  type: "logo" | "favicon";
}) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  // Note: 'type' might be used by backend for folder organization
  // formData.append("type", payload.type);

  // apiRequest needs to handle FormData correctly (usually by removing Content-Type header so browser sets boundary)
  return await apiRequest({
    method: "post",
    url: "/api/upload",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data", // Ensure your apiRequest utility handles this removal/setting correctly
    },
  });
};

// --- Hooks ---

/**
 * Hook to fetch General Settings
 */
export function useGeneralSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "general"],
    queryFn: fetchGeneralSettings,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Hook to update General Settings
 */
export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: (data) => {
      // Update the cache immediately with the new data
      queryClient.setQueryData(["settings", "general"], data);

      toast({
        title: "Настройки сохранены",
        description: "Общие настройки сайта успешно обновлены.",
        variant: "default", // or "success" if you have that variant
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

/**
 * Hook to fetch Pricing Configuration
 */
export function usePricingConfigQuery() {
  return useQuery({
    queryKey: ["settings", "pricing"],
    queryFn: fetchPricingConfig,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to update Pricing Configuration
 */
export function useUpdatePricingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updatePricingConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "pricing"], data);
      toast({
        title: "Тарифы обновлены",
        description: "Настройки цен и подписок успешно сохранены.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить тарифы.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to upload files (Logo/Favicon)
 * Returns the URL of the uploaded file
 */
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
    // We don't necessarily toast on success here because usually
    // the upload is an intermediate step before saving the URL to settings.
  });
}
