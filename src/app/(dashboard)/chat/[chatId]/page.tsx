import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path if needed
import { prisma } from "@/utils/prisma";
import ChatInterface from "@/components/admin/chat/ChatInterface";
import { notFound, redirect } from "next/navigation";

// Helper function remains the same
async function getChatData(chatId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // 1. Fetch Chat with Messages and Participants
  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          isRead: true,
        },
      },
      participants: {
        select: {
          id: true,
          name: true,
          profile_picture: true,
          role: true,
          // lastSeen: true // Uncomment if you added this field to schema
        },
      },
    },
  });

  if (!chat) return null;

  // 2. Identify the "Other" User (Target)
  const targetUser = chat.participants.find((p) => p.id !== session.user.id);

  if (!targetUser) {
    return null;
  }

  // 3. Format Data
  return {
    id: chat.id,
    targetUser: {
      id: targetUser.id,
      name: targetUser.name || "Unknown User",
      role: targetUser.role,
      image: targetUser.profile_picture || "/images/no-image.webp",
      isOnline: false,
    },
    messages: chat.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt.toISOString(), // Ensure serializable string
      status: "sent" as const,
    })),
  };
}

// --- FIX IS APPLIED HERE ---
interface PageProps {
  params: Promise<{ chatId: string }>; // 1. Update Type to Promise
}

export default async function ChatPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 2. Await the params before using properties
  const { chatId } = await params;

  // Fetch data
  const data = await getChatData(chatId);

  if (!data) {
    return notFound();
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Чат</h1>
          <p className="text-sm text-muted-foreground">
            Диалог с пользователем{" "}
            <span className="font-medium text-foreground">
              {data.targetUser.name}
            </span>
          </p>
        </div>
      </div>

      <ChatInterface
        chatId={chatId}
        initialMessages={data.messages}
        targetUser={data.targetUser}
      />
    </div>
  );
}
