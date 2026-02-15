"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

export type SubscriptionTier = "FREE" | "STANDARD" | "PREMIUM";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  priceMonthly: number;
  priceHalfYearly?: number;
  priceYearly?: number;
  features: string[];
  isActive: boolean;
}

export type CreatePlanDTO = Omit<
  SubscriptionPlan,
  "id" | "createdAt" | "updatedAt"
>;

// --- API Functions ---

const fetchAdminPlans = async (): Promise<SubscriptionPlan[]> => {
  return await apiRequest({ method: "get", url: "/api/admin/plans" });
};

const fetchAdminPlanById = async (id: string): Promise<SubscriptionPlan> => {
  return await apiRequest({ method: "get", url: `/api/admin/plans/${id}` });
};

const createPlanFn = async (data: CreatePlanDTO): Promise<SubscriptionPlan> => {
  return await apiRequest({ method: "post", url: "/api/admin/plans", data });
};

const updatePlanFn = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<CreatePlanDTO>;
}): Promise<SubscriptionPlan> => {
  return await apiRequest({
    method: "patch",
    url: `/api/admin/plans/${id}`,
    data,
  });
};

const deletePlanFn = async (id: string): Promise<void> => {
  return await apiRequest({ method: "delete", url: `/api/admin/plans/${id}` });
};

// --- Hooks ---

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: fetchAdminPlans,
  });
};

export const useAdminPlan = (id: string) => {
  return useQuery({
    queryKey: ["admin", "plans", id],
    queryFn: () => fetchAdminPlanById(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlanFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlanFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlanFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
};
