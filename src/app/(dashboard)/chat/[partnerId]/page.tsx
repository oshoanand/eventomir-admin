// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useParams, useRouter } from "next/navigation";
// import { Loader2 } from "lucide-react";
// import { apiRequest } from "@/utils/api-client";

// // Import your Chat Detail Screen component
// import ChatDetailScreen from "@/components/chat/ChatDetailScreen";

// export default function ChatRoomPage() {
//   const { partnerId } = useParams() as { partnerId: string };
//   const { status } = useSession();
//   const router = useRouter();

//   const [partnerName, setPartnerName] = useState<string>("Загрузка...");
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Wait until NextAuth has finished checking the session
//     if (status === "loading") return;

//     if (status === "unauthenticated") {
//       router.replace("/login");
//       return;
//     }

//     // Fetch the partner's basic info so we can display their name in the header
//     const fetchPartnerInfo = async () => {
//       try {
//         const data = await apiRequest<{ name?: string }>({
//           method: "GET",
//           url: `/api/users/${partnerId}`,
//         });

//         setPartnerName(data.name || "Пользователь");
//       } catch (error) {
//         console.error("Failed to fetch partner info:", error);
//         setPartnerName("Пользователь");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchPartnerInfo();
//   }, [status, partnerId, router]);

//   const handleBack = () => {
//     router.push("/chat");
//   };

//   if (status === "loading" || isLoading) {
//     return (
//       <div className="flex flex-col h-[100dvh] items-center justify-center bg-background">
//         <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
//         <p className="text-muted-foreground font-medium">
//           Подключение к чату...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <ChatDetailScreen
//       partnerId={partnerId}
//       partnerName={partnerName}
//       onBack={handleBack}
//     />
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/utils/api-client";
import ChatDetailScreen from "@/components/chat/ChatDetailScreen";

export default function ChatRoomPage() {
  const { partnerId } = useParams() as { partnerId: string };
  const { status } = useSession();
  const router = useRouter();

  const [partnerName, setPartnerName] = useState<string>("Загрузка...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const fetchPartnerInfo = async () => {
      try {
        const data = await apiRequest<{ name?: string }>({
          method: "GET",
          url: `/api/users/${partnerId}`,
        });
        setPartnerName(data.name || "Пользователь");
      } catch (error) {
        console.error("Failed to fetch partner info:", error);
        setPartnerName("Пользователь");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerInfo();
  }, [status, partnerId, router]);

  const handleBack = () => {
    router.push("/chat");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col h-[calc(100dvh-4rem)] items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-muted-foreground font-medium">
          Подключение к чату...
        </p>
      </div>
    );
  }

  return (
    // Note the h-[calc(100dvh-4rem)] or similar depending on your layout header height.
    // We remove the fixed full screen from the child and rely on the parent container.
    <div className="flex flex-col h-[calc(100dvh-64px)] w-full overflow-hidden bg-background">
      <ChatDetailScreen
        partnerId={partnerId}
        partnerName={partnerName}
        onBack={handleBack}
      />
    </div>
  );
}
