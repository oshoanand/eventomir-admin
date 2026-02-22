// import type { Metadata } from "next";
// import { Suspense } from "react";
// import "./globals.css";
// import { Toaster } from "@/components/ui/toaster";
// import NextAuthProvider from "@/components/providers/next-auth-session-provider";
// import ReactQueryProvider from "@/utils/query-client-provider";
// // import SocketProvider from "@/components/providers/socket-provider";
// import PushNotificationManager from "@/components/providers/push-notification-manager";
// import { NotificationProvider } from "@/context/NotificationContext";

// export const metadata: Metadata = {
//   title: "Eventomir Admin",
//   description: "Admin management Panel",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link
//           rel="preconnect"
//           href="https://fonts.gstatic.com"
//           crossOrigin="anonymous"
//         />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//           rel="stylesheet"
//         />
//       </head>
//       <body className="font-body antialiased">
//         <NextAuthProvider>
//           <ReactQueryProvider>
//             {/* 1. WRAP APP WITH NOTIFICATION PROVIDER */}
//             {/* This ensures the Bell state is available on every page */}
//             <NotificationProvider>
//               {/* 2. SOCKET: Listens for live events when tab is OPEN */}
//               {/* <SocketProvider /> */}

//               {/* 3. PUSH MANAGER: Handles service worker for when tab is CLOSED */}
//               <PushNotificationManager />

//               {/* Main Content */}
//               <Suspense>{children}</Suspense>

//               {/* 4. TOASTER: The UI component that shows the popup */}
//               <Toaster />
//             </NotificationProvider>
//           </ReactQueryProvider>
//         </NextAuthProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/components/providers/next-auth-session-provider";
import ReactQueryProvider from "@/utils/query-client-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import PushNotificationManager from "@/components/providers/push-notification-manager";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata: Metadata = {
  title: "Eventomir Admin",
  description: "Admin management Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      translate="no"
      className="notranslate"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <NextAuthProvider>
          <ReactQueryProvider>
            {/* 1. SOCKET PROVIDER: Must be the parent (Connects to server) */}
            <SocketProvider>
              {/* 2. NOTIFICATION PROVIDER: Child (Consumes socket events) */}
              <NotificationProvider>
                {/* 3. Push Manager & UI Elements */}
                <PushNotificationManager />

                <Suspense fallback={null}>{children}</Suspense>

                <Toaster />
              </NotificationProvider>
            </SocketProvider>
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
