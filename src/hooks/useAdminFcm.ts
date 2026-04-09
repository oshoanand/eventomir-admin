"use client";

import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

// Use your existing authenticated API client here (e.g., Axios instance)
import { apiRequest } from "@/utils/api-client";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

export default function useAdminFcm() {
  const { status } = useSession();
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Only run if the admin is successfully logged in
    if (status !== "authenticated") return;

    const setupFCM = async () => {
      try {
        if (!("serviceWorker" in navigator)) return;

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

        // 5. Send to your authenticated backend route
        if (currentToken && syncedTokenRef.current !== currentToken) {
          // This hits the robust routes/fcm.js we built earlier!
          await apiRequest({
            method: "POST",
            url: "/api/fcm/save-fcm",
            data: { token: currentToken },
          });

          syncedTokenRef.current = currentToken;
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
      } catch (error) {
        console.error("❌ Admin FCM Setup Failed:", error);
      }
    };

    setupFCM();
  }, [status]);
}
