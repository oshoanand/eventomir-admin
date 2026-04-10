// Common fields for all notifications
export interface BaseNotification {
  id: string | number;
  isRead?: boolean;
  message?: string; // Used in the UI list
  createdAt: string | Date;
}

// Chat Message Notification (NEW)
export interface ChatMessagePayload extends BaseNotification {
  type: "CHAT_MESSAGE";
  data: {
    chatId: string;
    senderName: string;
    preview: string;
  };
}

// Booking Request Notification (Used in NotificationsPage)
export interface BookingRequestPayload extends BaseNotification {
  type: "BOOKING_REQUEST";
  data: {
    bookingId: string;
    customerId?: string;
    status?: string;
  };
}

// 🚨 FIX: Added "extends BaseNotification" here
export interface PartnerRequestPayload extends BaseNotification {
  type: "PARTNER_REQUEST" | "SYSTEM";
  message: string;
  link?: string;
  // createdAt is inherited from BaseNotification, but explicitly typing it as string here is fine
  createdAt: string;
}

// Union Type
export type NotificationItem =
  | ChatMessagePayload
  | BookingRequestPayload
  | PartnerRequestPayload
  | (BaseNotification & { type: string; data?: any }); // Fallback for generic types

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  socket: any;
}
