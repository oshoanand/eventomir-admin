"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface Partner {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  city: string | null;
  addess: string | null;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
}

export interface PartnersResponse {
  data: Partner[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==========================================
// 2. CORE API IMPLEMENTATION (Pure Functions)
// ==========================================

export const fetchPartners = async (
  page: number,
  limit: number,
  search?: string,
): Promise<PartnersResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  return await apiRequest({
    method: "GET",
    url: `/api/users/partners?${query.toString()}`,
  });
};

export const updatePerformerModeration = async (id: string, status: string) => {
  // Normalize to UPPERCASE to pass backend Enum validation
  const normalizedStatus = status.toUpperCase();

  return await apiRequest({
    method: "PATCH",
    url: `/api/admin/profile/moderation/${id}`,
    data: {
      moderationStatus: normalizedStatus,
      userType: "partner",
    },
  });
};

export const deletePerformerProfile = async (id: string) => {
  return await apiRequest({
    method: "DELETE",
    url: `/api/admin/profile/delete/${id}`,
    data: {
      userType: "partner",
    },
  });
};

// ==========================================
// 3. REACT QUERY HOOKS
// ==========================================

export function usePartnersQuery(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ["partners", page, limit, search],
    queryFn: () => fetchPartners(page, limit, search),
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export function useUpdateModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updatePerformerModeration(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "partner", variables.id],
      });
    },
  });
}

export const checkLinkedUsers = async (partnerId: string) => {
  return await apiRequest<{
    linkedPerformers: number;
    linkedCustomers: number;
  }>({
    url: `/api/admin/partners/${partnerId}/linked-count`,
    method: "GET",
  });
};
export const useDeletePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      return await apiRequest({
        method: "DELETE",
        url: `/api/admin/profile/delete/${partnerId}?userType=partner`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};
