// services/admin/bookings.ts
import { apiRequest } from "@/utils/api-client";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export interface Booking {
  id: string;
  createdAt: string;
  date: string; // The scheduled date of the event
  status: BookingStatus;
  amount: number;
  details: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
  performer: {
    id: string;
    name: string;
    email: string;
    category?: string;
    image?: string;
  };
}

export const fetchAllBookings = async (params?: {
  status?: string;
  search?: string;
}) => {
  return apiRequest<Booking[]>({
    method: "get",
    url: "/api/admin/bookings", // Ensure your backend has this endpoint
    params,
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
) => {
  return apiRequest<Booking>({
    method: "patch",
    url: `/api/admin/bookings/${bookingId}`,
    data: { status },
  });
};

export const deleteBooking = async (bookingId: string) => {
  return apiRequest({
    method: "delete",
    url: `/api/admin/bookings/${bookingId}`,
  });
};
