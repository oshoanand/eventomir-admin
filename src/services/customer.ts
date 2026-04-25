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

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  city: string | null;
  role: string;
  walletBalance: number;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
}

export interface CustomerBooking {
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
  performerName: string;
  performerEmail: string;
  price: number;
  details: string;
}

export interface PaidRequest {
  id: string;
  status: string;
  createdAt: string;
  amount: number;
  description: string;
}

export interface AdminCustomerDetails extends Customer {
  bookings: CustomerBooking[];
  paidRequests: PaidRequest[];
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    totalPaidRequests: number;
  };
}

export interface CustomersResponse {
  data: Customer[];
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

export const fetchCustomers = async (
  page: number,
  limit: number,
  search?: string,
): Promise<CustomersResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  return await apiRequest({
    method: "GET",
    url: `/api/users/customers?${query.toString()}`,
  });
};

export const fetchCustomerDetails = async (
  id: string,
): Promise<AdminCustomerDetails> => {
  return await apiRequest({
    method: "GET",
    url: `/api/users/customers/${id}`,
  });
};

export const updateCustomerModeration = async (id: string, status: string) => {
  const normalizedStatus = status.toUpperCase();

  return await apiRequest({
    method: "PATCH",
    url: `/api/admin/profile/moderation/${id}`,
    data: {
      moderationStatus: normalizedStatus,
      userType: "customer",
    },
  });
};

// ==========================================
// 3. REACT QUERY HOOKS
// ==========================================

export function useCustomersQuery(
  page: number,
  limit: number,
  search?: string,
) {
  return useQuery({
    queryKey: ["customers", page, limit, search],
    queryFn: () => fetchCustomers(page, limit, search),
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export function useCustomerDetailsQuery(id: string) {
  return useQuery<AdminCustomerDetails>({
    queryKey: ["admin", "customer", id],
    queryFn: () => fetchCustomerDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useUpdateModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateCustomerModeration(id, status),
    onSuccess: (_, variables) => {
      // Refresh the main table list
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      // Refresh the specific detail view to show the new status immediately
      queryClient.invalidateQueries({
        queryKey: ["admin", "customer", variables.id],
      });
    },
  });
}
