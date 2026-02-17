"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

// --- Types ---

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "administrator" | "support";
  status: "active" | "blocked";
  created_at?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
}

export interface UpdateUserData {
  id: string; // needed for the URL
  data: Partial<CreateUserData>; // body payload
}

// --- API Functions (Private) ---

const getUsers = async (): Promise<AdminUser[]> => {
  const response = await apiRequest<AdminUser[]>({
    method: "get",
    url: "/api/admin/users",
  });
  return response;
};

const createUser = async (data: CreateUserData) => {
  return await apiRequest({
    method: "post",
    url: "/api/admin/user",
    data: data,
  });
};

const updateUser = async ({ id, data }: UpdateUserData) => {
  return await apiRequest({
    method: "put",
    url: `/api/admin/user/${id}`,
    data: data,
  });
};

const deleteUser = async (id: string) => {
  return await apiRequest({
    method: "delete",
    url: `/api/admin/user/${id}`,
  });
};

// --- React Query Hooks (Public) ---

/**
 * Hook to fetch all users for the admin table.
 */
export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsers,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Hook to create a new user.
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Refresh the list immediately after creation
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

/**
 * Hook to update an existing user.
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

/**
 * Hook to delete a user.
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
