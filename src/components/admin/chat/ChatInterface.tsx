"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/providers/socket-provider";
import { apiRequest } from "@/utils/api-client"; // Adjust path to your API helper
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  Clock,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string | Date;
  status?: "sending" | "sent" | "read"; // Optimistic UI state
}

interface ChatInterfaceProps {
  chatId: string;
  initialMessages?: Message[];
  targetUser: {
    id: string;
    name: string;
    image?: string;
    role: string;
    isOnline: boolean;
  };
}

export default function ChatInterface({
  chatId,
  initialMessages = [],
  targetUser,
}: ChatInterfaceProps) {
  const { data: session } = useSession();

  // 1. Consume Socket Context
  const { socket } = useSocket();

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. Real-time Listener & Room Joining
  useEffect(() => {
    if (!socket) return;

    // A. Join the specific chat room
    // This tells the socket server to send messages for this chat ID to this client
    socket.emit("join_chat", chatId);

    // B. Handle Incoming Messages
    const handleMessage = (msg: any) => {
      // Security check: Ensure message belongs to THIS chat
      if (msg.chatId === chatId) {
        setMessages((prev) => {
          // Prevent duplicates (e.g., if optimistic update already added it)
          const exists = prev.find((m) => m.id === msg.id);
          if (exists) return prev;
          return [...prev, { ...msg, status: "sent" }];
        });
      }
    };

    socket.on("receive_message", handleMessage);

    // Cleanup: Remove listener when component unmounts or chat changes
    return () => {
      socket.off("receive_message", handleMessage);
      // Optional: Leave room if your backend supports it
      // socket.emit("leave_chat", chatId);
    };
  }, [socket, chatId]);

  // 4. Send Handler
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const tempId = Date.now().toString();
    const messageContent = newMessage.trim();

    // A. Optimistic Update (Show immediately)
    const optimisticMsg: Message = {
      id: tempId,
      content: messageContent,
      senderId: session.user.id,
      createdAt: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    setIsSending(true);

    try {
      // B. API Call to persist message
      const savedMsg = await apiRequest<Message>({
        method: "post",
        url: `/api/chats/${chatId}/messages`,
        data: { content: messageContent },
      });

      // C. Update status to 'sent' with real ID from DB
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...savedMsg, status: "sent" } : m,
        ),
      );
    } catch (error) {
      console.error("Failed to send", error);
      // Optional: Mark message as failed in UI
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-950 border rounded-xl overflow-hidden shadow-sm">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={targetUser.image} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {targetUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Indicator (Real-time update via props or socket context) */}
            {targetUser.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {targetUser.name}
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500 font-normal uppercase">
                {targetUser.role === "performer" ? "Исполнитель" : "Заказчик"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {targetUser.isOnline ? "В сети" : "Был(а) недавно"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Button
            variant="ghost"
            size="icon"
            disabled
            title="Звонок недоступен"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled
            title="Видеозвонок недоступен"
          >
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Просмотр профиля</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Заблокировать
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- MESSAGES AREA --- */}
      <ScrollArea className="flex-1 px-4 py-4 bg-slate-50/50 dark:bg-slate-950">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-20 opacity-60">
              <p>История сообщений пуста</p>
              <p className="text-xs">Начните диалог первым</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === session?.user?.id;

              return (
                <div
                  key={msg.id || index}
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}
                  >
                    <div
                      className={`relative px-4 py-3 shadow-sm text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                          : "bg-white dark:bg-slate-900 text-foreground border rounded-2xl rounded-tl-sm"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                      {isMe && (
                        <span className="text-muted-foreground">
                          {msg.status === "sending" ? (
                            <Clock className="h-3 w-3 animate-pulse" />
                          ) : (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border focus-within:ring-2 focus-within:ring-primary/20 transition-all"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-3 h-auto min-h-[44px] max-h-32 resize-none"
            autoFocus
          />

          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className={`h-10 w-10 rounded-lg shrink-0 transition-all ${
              newMessage.trim()
                ? "bg-primary hover:bg-primary/90"
                : "bg-slate-300 hover:bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-muted-foreground">
            Enter для отправки
          </span>
        </div>
      </div>
    </div>
  );
}
