"use client";

import { apiRequest } from "@/utils/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ==========================================
// 1. ТИПЫ ДАННЫХ
// ==========================================
export interface SupportTicket {
  id: string;
  ticket_number: number;
  contact_mobile: string | null;
  type: string;
  description: string;
  attachments: string[];
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING_ON_CUSTOMER"
    | "RESOLVED"
    | "CLOSED";
  created_at: string;
  requester?: {
    name: string | null;
  } | null;
}

export interface ResolveTicketPayload {
  id: string;
  status: string;
  adminReply: string;
}

// ==========================================
// 2. API МЕТОДЫ (Чистые функции)
// ==========================================
export const supportApi = {
  getAllTickets: async (): Promise<SupportTicket[]> => {
    return await apiRequest({ method: "GET", url: "/api/support/all" });
  },

  resolveTicket: async (data: ResolveTicketPayload): Promise<SupportTicket> => {
    // Используем PATCH, как определено в routes/support.js
    return await apiRequest({
      method: "PATCH",
      url: `/api/support/${data.id}`,
      data,
    });
  },
};

// ==========================================
// 3. REACT QUERY ХУКИ
// ==========================================
export const QUERY_KEYS = {
  supportTickets: ["support-tickets"] as const,
};

export const useSupportTickets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.supportTickets,
    queryFn: supportApi.getAllTickets,
  });
};

export const useResolveTicket = (
  onSuccessCallback?: () => void,
  onErrorCallback?: (error: any) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supportApi.resolveTicket,
    onSuccess: () => {
      // Автоматически инвалидируем кэш, чтобы таблица обновилась
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportTickets });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      if (onErrorCallback) onErrorCallback(error);
    },
  });
};
