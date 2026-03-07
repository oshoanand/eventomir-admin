"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

// --- Types ---

export interface OrderEvent {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  city: string;
  address?: string | null;
  imageUrl: string;
}

export interface OrderData {
  id: string;
  userId: string;
  ticketCount: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  event: OrderEvent;
}

export interface PurchasePayload {
  eventId: string;
  userId: string;
  ticketCount: number;
}

// --- API Fetchers ---

export const getAdminOrders = async (): Promise<OrderData[]> => {
  const response = await apiRequest({
    method: "get",
    url: "/api/orders",
  });
  return response as OrderData[];
};

// --- React Query Hooks ---

/**
 * Hook to fetch all orders for the Admin Panel.
 */
export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: ["orders", "admin"],
    queryFn: getAdminOrders,
  });
}
