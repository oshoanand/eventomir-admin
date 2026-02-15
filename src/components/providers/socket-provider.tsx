"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SocketProvider() {
  const { toast } = useToast();
  const router = useRouter(); // 2. Initialize Router

  useEffect(() => {
    // Connect to your Node.js Backend
    const socket = io(
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800",
    );

    socket.on("connect", () => {
      console.log("✅ Admin Panel: Connected to Live Server");
    });

    socket.on("new_token", (data: any) => {
      // Optional: Play Sound
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(() => {});
      } catch (e) {}

      // Trigger Toast with Action
      toast({
        title: "New Token Generated 🎟️",
        description: `Token: ${data.tokenCode} | Order #${data.orderNumber}`,
        variant: "success", // You can use "success" if defined in your wrapper
        duration: 10000,
        action: {
          label: "View",
          onClick: () => router.push("/tokens"), // Smooth navigation
        },
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, router]);

  return null;
}
