// import * as React from "react";
// import {
//   SidebarProvider,
//   Sidebar,
//   SidebarInset,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { SidebarNav } from "@/components/sidebar-nav";
// import { Separator } from "@/components/ui/separator";
// import NotificationBell from "@/components/notification-bell";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SidebarProvider>
//       <Sidebar collapsible="icon">
//         <SidebarNav />
//       </Sidebar>
//       <SidebarInset>
//         {/* Modern Top Header */}
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
//           {/* Left Side: Trigger & Separator */}
//           <div className="flex items-center gap-2">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//           </div>

//           {/* Right Side: Notification Bell */}
//           {/* ml-auto pushes this div to the far right */}
//           <div className="ml-auto flex items-center gap-2">
//             <NotificationBell />
//           </div>
//         </header>

//         {/* Main Content Area */}
//         <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import NotificationBell from "@/components/notification-bell";
import { UserNav } from "@/components/user-nav"; // Import the new component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        {/* Modern Top Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4 bg-background">
          {/* Left Side: Trigger & Separator */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>

          {/* Right Side: Notification Bell & User Nav */}
          {/* ml-auto pushes this div to the far right */}
          <div className="ml-auto flex items-center gap-4">
            <NotificationBell />
            <UserNav />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
