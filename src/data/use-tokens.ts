"use client";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "ALL" | "REQUESTED" | "ISSUED";

export interface Token {
  id: string;
  mobileNumber: string;
  orderNumber: string;
  orderCode: string;
  tokenCode: string;
  quantity: number;
  createdAt: string;
  receivedAt: string | null;
  tokenStatus: "REQUESTED" | "ISSUED";
  postedBy?: {
    name: string | null;
    image?: string | null;
  } | null;
}

export interface TokenResponse {
  data: Token[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
const getTokens = async (
  status: StatusFilter,
  page: number,
  limit: number,
  search: string,
): Promise<TokenResponse> => {
  // Append search param
  const queryString = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

  const endpoint =
    status === "ALL"
      ? `/api/token/all-tokens${queryString}`
      : `/api/token/all/${status}${queryString}`;

  const response = await apiRequest({
    method: "get",
    url: endpoint,
  });
  return response as TokenResponse;
};

// --- Update Function ---
interface UpdateTokenPayload {
  id: string;
  tokenCode: string;
  mobileNumber: string;
  quantity: number;
  tokenStatus: "ISSUED";
}

const updateToken = async (payload: UpdateTokenPayload) => {
  const { quantity, tokenCode, mobileNumber, id } = payload;
  return await apiRequest({
    method: "patch",
    url: `/api/token/status/${quantity}/${tokenCode}?mobile=${mobileNumber}&id=${id}`,
  });
};

// Update Hook
export function useTokensQuery(
  status: StatusFilter,
  page: number,
  limit: number,
  search: string = "", // Default to empty
) {
  return useQuery({
    // Add 'search' to queryKey so it refetches when search changes
    queryKey: ["tokens", status, page, limit, search],
    queryFn: () => getTokens(status, page, limit, search),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateTokenMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateToken,
    onSuccess: () => {
      // Invalidate all token queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({
        title: "Success",
        description: "Token issued successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update token",
        variant: "destructive",
      });
    },
  });
}
