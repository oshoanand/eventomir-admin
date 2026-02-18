// "use client";

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { io, Socket } from "socket.io-client";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// // Import the new types
// import {
//   NotificationContextType,
//   NotificationItem,
//   TokenPayload,
//   JobPayload,
// } from "@/types/notification";

// const NotificationContext = createContext<NotificationContextType | undefined>(
//   undefined,
// );

// const SOCKET_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

// interface NotificationProviderProps {
//   children: ReactNode;
// }

// export const NotificationProvider: React.FC<NotificationProviderProps> = ({
//   children,
// }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   // Update state type to accept both Jobs and Tokens
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [unreadCount, setUnreadCount] = useState<number>(0);

//   const { toast } = useToast();
//   const router = useRouter();

//   // Helper function to play sound
//   const playNotificationSound = () => {
//     try {
//       const audio = new Audio("/sounds/notification.wav");
//       audio.play().catch((e) => console.log("Audio play blocked", e));
//     } catch (error) {
//       console.error("Audio error:", error);
//     }
//   };

//   useEffect(() => {
//     const newSocket: Socket = io(SOCKET_URL, {
//       transports: ["websocket"],
//     });

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("✅ Admin Panel: Connected to Live Server");
//     });

//     // --- 1. LISTENER: NEW TOKEN ---
//     newSocket.on("new_token", (payload: TokenPayload) => {
//       console.log("🔔 New Token:", payload);

//       // Ensure type is set
//       const item: TokenPayload = { ...payload, type: "TOKEN" };

//       setNotifications((prev) => [item, ...prev]);
//       setUnreadCount((prev) => prev + 1);
//       playNotificationSound();

//       toast({
//         title: "New Token Generated 🎟️",
//         description: `Token: ${payload.tokenCode}`,
//         variant: "success",
//         duration: 8000,
//         action: {
//           label: "View",
//           onClick: () => router.push("/tokens"),
//         },
//       });
//     });

//     // --- 2. LISTENER: NEW JOB (Implemented) ---
//     newSocket.on("new_job", (payload: JobPayload) => {
//       console.log("🚛 New Job:", payload);

//       // Ensure type is set
//       const item: JobPayload = { ...payload, type: "JOB" };

//       setNotifications((prev) => [item, ...prev]);
//       setUnreadCount((prev) => prev + 1);
//       playNotificationSound();

//       toast({
//         title: "New Job Posted 🚛",
//         description: `${payload.location} | ${payload.cost}₽`,
//         variant: "default", // You can define a specific variant style in your toast component
//         duration: 8000,
//         action: {
//           label: "Jobs",
//           onClick: () => router.push("/jobs"),
//         },
//       });
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [toast, router]);

//   const markAllAsRead = () => {
//     setUnreadCount(0);
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         unreadCount,
//         markAllAsRead,
//         socket,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotification = (): NotificationContextType => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error(
//       "useNotification must be used within a NotificationProvider",
//     );
//   }
//   return context;
// };
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
import { useSocket } from "@/components/providers/socket-provider"; // 1. Import the hook
import {
  NotificationContextType,
  NotificationItem,
  TokenPayload,
  JobPayload,
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
  // 2. Consume the shared socket from the Provider
  // We don't need useSession here anymore, as SocketProvider handles auth
  const { socket } = useSocket();

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
      }

      // Handle generic "SYSTEM" type
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
  }, [socket, toast, router, playNotificationSound]);

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
