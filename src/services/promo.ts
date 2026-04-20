"use client";

import { apiRequest } from "@/utils/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ==========================================
// 1. ТИПЫ ДАННЫХ
// ==========================================
export type DiscountType = "PERCENTAGE" | "FLAT";

export interface PromoCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  isSingleUsePerUser: boolean; // 👈 Флаг одноразового использования для юзера
  isActive: boolean;
  currentUses: number;
  maxUses: number | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PromoCodeInput = Omit<
  PromoCode,
  "id" | "createdAt" | "updatedAt" | "currentUses"
>;

// ==========================================
// 2. API МЕТОДЫ (Чистые запросы)
// ==========================================
export const promoApi = {
  getPromos: async (): Promise<PromoCode[]> => {
    return await apiRequest({ method: "get", url: "/api/promo-codes" });
  },
  getPromoById: async (id: string): Promise<PromoCode> => {
    return await apiRequest({ method: "get", url: `/api/promo-codes/${id}` });
  },
  createPromo: async (data: PromoCodeInput): Promise<PromoCode> => {
    return await apiRequest({ method: "post", url: "/api/promo-codes", data });
  },
  updatePromo: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<PromoCodeInput>;
  }): Promise<PromoCode> => {
    return await apiRequest({
      method: "patch",
      url: `/api/promo-codes/${id}`,
      data,
    });
  },
  deletePromo: async (id: string): Promise<void> => {
    return await apiRequest({
      method: "delete",
      url: `/api/promo-codes/${id}`,
    });
  },
};

// ==========================================
// 3. REACT QUERY ХУКИ
// ==========================================
export const QUERY_KEYS = {
  all: ["promos"] as const,
  detail: (id: string) => ["promo", id] as const,
};

export const usePromos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: promoApi.getPromos,
  });
};

export const usePromo = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => promoApi.getPromoById(id),
    enabled: !!id,
  });
};

export const useCreatePromo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoApi.createPromo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
};

export const useUpdatePromo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoApi.updatePromo,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
    },
  });
};

export const useDeletePromo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoApi.deletePromo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
};
