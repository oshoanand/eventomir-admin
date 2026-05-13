import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string; // 'PENDING', 'PAID', etc. (PaymentStatus)
  provider: string; // 'yookassa', 'tinkoff', 'stripe', etc.
  description: string;
  escrowStatus: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface PaymentsResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usePaymentsQuery = (
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ["payments", page, limit, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      return await apiRequest<PaymentsResponse>({
        url: `/api/admin/payments?${params.toString()}`,
        method: "GET",
      });
    },
  });
};
