"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react"; // Assuming NextAuth for Admin Panel

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800",
      {
        auth: { userId: session.user.id },
        withCredentials: true,
      },
    );

    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));

    // Listen for Real-Time User Status
    socketInstance.on("online_users_list", (users: string[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on(
      "user_status_change",
      ({ userId, status }: { userId: string; status: string }) => {
        setOnlineUsers((prev) =>
          status === "online"
            ? Array.from(new Set([...prev, userId]))
            : prev.filter((id) => id !== userId),
        );
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
