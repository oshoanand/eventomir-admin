"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import {
  NotificationContextType,
  NotificationItem,
  TokenPayload,
  JobPayload,
  PartnerRequestPayload,
} from "@/types/notification";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  // Consume the shared socket from the Provider
  // We don't need useSession here anymore, as SocketProvider handles auth
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const { toast } = useToast();
  const router = useRouter();

  // Helper function to play sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/notification.wav");
      audio.play().catch((e) => console.log("Audio play blocked", e));
    } catch (error) {
      console.error("Audio error:", error);
    }
  }, []);

  useEffect(() => {
    // 3. Guard: Wait until the socket is initialized and connected
    if (!socket) return;

    // 4. Define the Event Listener
    const handleNotification = (payload: any) => {
      console.log("🔔 Received Notification:", payload);

      const { type, data } = payload;

      // Handle "TOKEN" type
      if (type === "TOKEN") {
        const item: TokenPayload = { ...data, type: "TOKEN" };

        setNotifications((prev) => [item, ...prev]);
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();

        toast({
          title: "New Token Generated 🎟️",
          description: `Token: ${data.tokenCode}`,
          variant: "success",
          duration: 8000,
          action: {
            label: "View",
            onClick: () => router.push("/tokens"),
          },
        });
      }

      // Handle "JOB" type
      else if (type === "JOB") {
        const item: JobPayload = { ...data, type: "JOB" };

        setNotifications((prev) => [item, ...prev]);
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();

        toast({
          title: "New Job Posted 🚛",
          description: `${data.location} | ${data.cost}₽`,
          variant: "default",
          duration: 8000,
          action: {
            label: "Jobs",
            onClick: () => router.push("/jobs"),
          },
        });
      } else if (type === "PARTNER_REQUEST" || type === "SYSTEM") {
        const item: PartnerRequestPayload = {
          type: type as any,
          message: payload.message,
          link: payload.link,
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        setNotifications((prev) => [item, ...prev]);
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();

        toast({
          title:
            type === "PARTNER_REQUEST"
              ? "Новая заявка на партнерство 🤝"
              : "Уведомление",
          description: payload.message,
          duration: 8000,
          action: payload.link
            ? {
                label: "Смотреть",
                onClick: () => router.push(payload.link),
              }
            : undefined,
        });

        // 🔥 Smart Cache Invalidation: Refresh the admin table instantly
        if (type === "PARTNER_REQUEST" || payload.link?.includes("partners")) {
          queryClient.invalidateQueries({ queryKey: ["partnershipRequests"] });
        }
      }

      // --- Handle Unknown generic types ---
      else {
        setNotifications((prev) => [
          { ...payload, id: Date.now().toString() },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
        toast({
          title: payload.message || "Уведомление",
          description: "Новое сообщение от системы",
        });
      }
    };

    // 5. Attach the listener to the shared socket instance
    socket.on("notification", handleNotification);

    // 6. Cleanup: Remove ONLY this specific listener when component unmounts
    // DO NOT disconnect the socket here, as other components (like Chat) need it.
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, toast, router, playNotificationSound, queryClient]);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        socket, // Pass the socket down if needed, though consumers should prefer useSocket()
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
