"use client";

import { useEffect } from "react"; // 🚨 Removed useRef
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

// Use your existing authenticated API client here (e.g., Axios instance)
import { apiRequest } from "@/utils/api-client";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

export default function useAdminFcm() {
  const { status } = useSession();

  useEffect(() => {
    // 1. Only run if the admin is successfully logged in
    if (status !== "authenticated") return;

    const setupFCM = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          // 2. Request Permission
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;

          // 3. Manually register our non-PWA Service Worker
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
          );

          const msg = await messaging();
          if (!msg) return;

          // 4. Get FCM Token
          const currentToken = await getToken(msg, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          // 🚨 FIX: Use sessionStorage instead of useRef
          // This flag will survive page refreshes!
          const hasSyncedThisSession =
            sessionStorage.getItem("admin_fcm_synced");

          // 5. Send to your authenticated backend route
          if (currentToken && !hasSyncedThisSession) {
            // This hits the robust routes/fcm.js we built earlier!
            await apiRequest({
              method: "POST",
              url: "/api/fcm/save-fcm",
              data: { token: currentToken },
            });

            // Mark as synced for this browser tab so it doesn't run again on refresh
            sessionStorage.setItem("admin_fcm_synced", "true");
            console.log("✅ Admin FCM Token synced & subscribed to topics.");
          }

          // 6. Listen for Foreground Messages (Live Toasts while admin tab is open)
          onMessage(msg, (payload) => {
            toast({
              title:
                payload.notification?.title ||
                payload.data?.title ||
                "Новое уведомление",
              description: payload.notification?.body || payload.data?.body,
            });
          });
        }
      } catch (error) {
        console.error("❌ Admin FCM Setup Failed:", error);
      }
    };

    setupFCM();
  }, [status]);
}
