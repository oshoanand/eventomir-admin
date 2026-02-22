// Existing Token Type
export interface TokenPayload {
  type: "TOKEN"; // Discriminator
  id: number | string;
  tokenCode: string;
  orderNumber: string;
  mobileNumber: string;
  status: string;
  createdAt: string | Date;
}

// New Job Type
export interface JobPayload {
  type: "JOB"; // Discriminator
  id: number;
  description: string;
  location: string;
  cost: string;
  postedBy: string;
  createdAt: string | Date;
}

// Add this interface
export interface PartnerRequestPayload {
  type: "PARTNER_REQUEST" | "SYSTEM";
  message: string;
  link?: string;
  createdAt: string;
}

// Update your Union Type
export type NotificationItem =
  | TokenPayload
  | JobPayload
  | PartnerRequestPayload
  | any;

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  socket: any;
}
