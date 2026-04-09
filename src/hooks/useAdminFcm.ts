"use client";

import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api-client";

export default function useAdminFcm() {
  const { data: session, status } = useSession();
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const setupFCM = async () => {
      try {
        if (!("serviceWorker" in navigator)) return;

        // 1. Manually register the SW (since we don't have next-pwa doing it for us)
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const msg = await messaging();
          if (!msg) return;

          // 2. Get Token
          const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          // 3. Sync with backend
          if (token) {
            if (session?.user && syncedTokenRef.current !== token) {
              await syncTokenWithBackend(token, session.user.phone);
              syncedTokenRef.current = token;
            }
          }

          // 4. Listen for Foreground Messages (Real-time Toasts)
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
        console.error("FCM Setup Failed:", error);
      }
    };

    setupFCM();
  }, [session, status]);
}

/**
 * Sends token to backend. Backend handles DB save AND Topic Subscriptions.
 */
async function syncTokenWithBackend(token: string, mobile?: string | null) {
  try {
    await apiRequest({
      method: "POST",
      url: "/api/fcm/save-fcm",
      data: { token, mobile },
    });
    console.log("✅ FCM Token synced with backend");
  } catch (error) {
    console.error("❌ Failed to sync FCM token:", error);
  }
}
