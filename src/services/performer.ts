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

export interface Performer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  city: string | null;
  roles: string[];
  role: string;
  walletBalance: number;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
}

export interface PerformerBooking {
  id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED"
    | "FULFILLED"
    | "CANCELLED_BY_CUSTOMER";
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  price: number;
  details: string;
  createdAt: string;
}

export interface AdminPerformerDetails extends Performer {
  companyName: string | null;
  inn: string | null;
  description: string | null;
  accountType: string | null;
  backgroundPicture: string | null;
  priceRange: number[];
  gallery: {
    id: string;
    title: string;
    imageUrls: string[];
    description: string | null;
    moderationStatus: string;
    createdAt: string;
  }[];
  certificates: {
    id: string;
    fileUrl: string;
    description: string | null;
    moderationStatus: string;
    createdAt: string;
  }[];
  recommendationLetters: {
    id: string;
    fileUrl: string;
    description: string | null;
    moderationStatus: string;
    createdAt: string;
  }[];
  bookings: PerformerBooking[];
  events: {
    id: string;
    title: string;
    date: string;
    status: string;
    city: string;
    price: number;
    imageUrl: string;
    createdAt: string;
  }[];
}

export interface PerformersResponse {
  data: Performer[];
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

export const fetchPerformers = async (
  page: number,
  limit: number,
  search?: string,
): Promise<PerformersResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  return await apiRequest({
    method: "GET",
    url: `/api/users/performers?${query.toString()}`,
  });
};

export const fetchPerformerDetails = async (
  id: string,
): Promise<AdminPerformerDetails> => {
  return await apiRequest({
    method: "GET",
    url: `/api/users/performers/${id}`,
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
      userType: "performer",
    },
  });
};

// ==========================================
// 3. REACT QUERY HOOKS
// ==========================================

export function usePerformersQuery(
  page: number,
  limit: number,
  search?: string,
) {
  return useQuery({
    queryKey: ["performers", page, limit, search],
    queryFn: () => fetchPerformers(page, limit, search),
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export function usePerformerDetailsQuery(id: string) {
  return useQuery<AdminPerformerDetails>({
    queryKey: ["admin", "performer", id],
    queryFn: () => fetchPerformerDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useUpdateModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updatePerformerModeration(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["performers"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "performer", variables.id],
      });
    },
  });
}
