import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/utils/api-client";

// 1. Define the TypeScript interface
export interface PartnershipRequest {
  id: string;
  name: string;
  email: string;
  website: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

// 2. Raw API fetcher functions
export const getPartnershipRequests = async (): Promise<
  PartnershipRequest[]
> => {
  return apiRequest<PartnershipRequest[]>({
    method: "get",
    url: "/api/admin/partnership-requests",
  });
};

export const updatePartnershipStatus = async (
  id: string,
  status: "APPROVED" | "REJECTED",
) => {
  return apiRequest<{ message: string }>({
    method: "patch",
    url: `/api/admin/partnership-requests/${id}/status`,
    data: { status },
  });
};

// 3. React Query Hooks
export const usePartnershipRequests = () => {
  return useQuery<PartnershipRequest[], ApiError>({
    queryKey: ["partnershipRequests"],
    queryFn: getPartnershipRequests,
  });
};

export const useApprovePartnership = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (id: string) => updatePartnershipStatus(id, "APPROVED"),
    onSuccess: () => {
      // Refresh the table automatically
      queryClient.invalidateQueries({ queryKey: ["partnershipRequests"] });
    },
  });
};

export const useRejectPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (id: string) => updatePartnershipStatus(id, "REJECTED"),
    onSuccess: () => {
      // Refresh the table automatically
      queryClient.invalidateQueries({ queryKey: ["partnershipRequests"] });
    },
  });
};
