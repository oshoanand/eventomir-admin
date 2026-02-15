"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

export interface Job {
  id: number;
  description: string | null;
  category: string | null;
  location: string;
  paymentStatus: string;
  status: string;
  cost: string;
  jobPhoto: string;
  jobPhotoDone: string;
  createdAt: string;
  finishedAt: string;
  postedBy: {
    name: string | null;
    mobile: string;
    image: string | null;
  };
  finishedBy?: {
    name: string | null;
    mobile: string;
    image: string | null;
  };
}

export interface JobsResponse {
  data: Job[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const getJobs = async (page: number, limit: number): Promise<JobsResponse> => {
  const queryString = `?page=${page}&limit=${limit}`;
  const response = await apiRequest({
    method: "get",
    url: `/api/jobs/all-jobs${queryString}`,
  });
  return response as JobsResponse;
};

export function useJobsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ["jobs", page, limit],
    queryFn: () => getJobs(page, limit),
    placeholderData: keepPreviousData,
  });
}
