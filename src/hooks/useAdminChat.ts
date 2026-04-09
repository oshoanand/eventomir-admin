"use client";

import { useEffect } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

export const useAdminChat = (onNewMessage: (message: any) => void) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen to specific chat room messages
    socket.on("receive_message", ({ message, chatId }) => {
      onNewMessage(message);
    });

    // Listen for general message notifications (if admin is outside the chat room)
    socket.on("message_notification", (data) => {
      console.log("New unread message from:", data.senderName);
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_notification");
    };
  }, [socket, onNewMessage]);

  const joinChatRoom = (chatId: string) => {
    socket?.emit("join_chat", chatId);
  };

  const sendMessage = (chatId: string, content: string, receiverId: string) => {
    socket?.emit("send_message", { chatId, content, receiverId });
  };

  return { joinChatRoom, sendMessage };
};
