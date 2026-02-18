"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

// --- Types ---
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[]; // Array of User IDs who are currently online
}

// --- Context ---
const SocketContext = createContext<SocketContextType | null>(null);

// --- Hook Export ---
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// --- Configuration ---
// Adjust this URL if your socket server runs on a different port/url
const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    // 1. Guard: Only connect if user is logged in
    if (!session?.user?.id) {
      return;
    }

    // 2. Initialize Socket
    const socketInstance = io(SOCKET_URL, {
      path: "/socket.io", // Default path, adjust if needed
      transports: ["websocket"], // Force WebSocket for better performance
      reconnectionAttempts: 5,
      query: {
        userId: session.user.id, // Pass ID for backend authentication
      },
    });

    setSocket(socketInstance);

    // 3. Connection Event Listeners
    socketInstance.on("connect", () => {
      console.log("✅ Socket Connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("⚠️ Socket Connection Error:", err.message);
      setIsConnected(false);
    });

    // 4. Online Status Management
    // A. Initial List: Received immediately after connection
    socketInstance.on("online_users_list", (users: string[]) => {
      setOnlineUsers(users);
    });

    // B. Incremental Updates: Received when someone connects/disconnects
    socketInstance.on(
      "user_status_change",
      ({
        userId,
        status,
      }: {
        userId: string;
        status: "online" | "offline";
      }) => {
        setOnlineUsers((prev) => {
          const uniqueSet = new Set(prev);
          if (status === "online") {
            uniqueSet.add(userId);
          } else {
            uniqueSet.delete(userId);
          }
          return Array.from(uniqueSet);
        });
      },
    );

    // 5. Cleanup
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
