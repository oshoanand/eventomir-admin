"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  profile_picture: string | null;
  registration_date: string;
  role: string;
  account_type: string | null;
  company_name: string | null;
  inn: string | null;
  description: string | null;
  background_picture: string | null;
  roles: string[];
  price_range: number[];
  latitude: number | null;
  longitude: number | null;
  subscription_plan_id: string | null;
  subscription_end_date: string | null;
  moderation_status: string;
  parent_agency_id: string | null;
  sub_profile_ids: string[];
  created_at: string;
  updated_at: string;
  status: string | null;
  experience: string | null;
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

const getCustomers = async (
  page: number,
  limit: number,
): Promise<CustomersResponse> => {
  const queryString = `?page=${page}&limit=${limit}`;
  const response = await apiRequest({
    method: "get",
    url: `/api/users/customers${queryString}`,
  });
  return response as CustomersResponse;
};

export function useCustomersQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ["performers", page, limit],
    queryFn: () => getCustomers(page, limit),
    placeholderData: keepPreviousData,
  });
}

const updateModerationStatus = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  return await apiRequest({
    method: "patch",
    url: `/api/admin/profile/moderation/${id}`,
    data: { moderation_status: status },
  });
};

export function useUpdateModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateModerationStatus,
    onSuccess: () => {
      // Invalidate the performers query to refetch the table data automatically
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
