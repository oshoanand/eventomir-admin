"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

// --- Types ---
export interface HostData {
  id: string;
  name: string;
  email: string;
}

export interface EventData {
  id: string;
  title: string;
  category: string;
  price: number;
  date: string; // ISO Date String
  time?: string | null; // NEW: Event time string (e.g., "19:00")
  city: string;
  address?: string | null; // NEW: Specific address
  imageUrl: string;
  description?: string | null;
  totalTickets: number; // NEW
  availableTickets: number; // NEW
  status: string; // NEW: e.g., "active", "cancelled", "completed"
  hostId?: string | null;
  host?: HostData | null;
}

// Omit 'id' and 'host' when sending data to create/update
export type EventPayload = Omit<EventData, "id" | "host">;

// --- API Functions ---
const getEvents = async (): Promise<EventData[]> => {
  const response = await apiRequest({
    method: "get",
    url: "/api/events",
  });
  return response as EventData[];
};

const getHosts = async (): Promise<HostData[]> => {
  const response = await apiRequest({
    method: "get",
    url: "/api/events/hosts/list",
  });
  return response as HostData[];
};

const createEvent = async (data: EventPayload): Promise<EventData> => {
  const response = await apiRequest({
    method: "post",
    url: "/api/events",
    data,
  });
  return response as EventData;
};

const updateEvent = async ({
  id,
  data,
}: {
  id: string;
  data: EventPayload;
}): Promise<EventData> => {
  const response = await apiRequest({
    method: "put",
    url: `/api/events/${id}`,
    data,
  });
  return response as EventData;
};

const deleteEvent = async (id: string): Promise<void> => {
  await apiRequest({
    method: "delete",
    url: `/api/events/${id}`,
  });
};

// --- React Query Hooks ---

export function useEventsQuery() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
}

export function useHostsQuery() {
  return useQuery({
    queryKey: ["hosts"],
    queryFn: getHosts,
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
