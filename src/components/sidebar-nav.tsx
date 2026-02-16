// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import {
//   SidebarHeader,
//   SidebarContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupLabel,
// } from "@/components/ui/sidebar";
// import {
//   LayoutDashboard,
//   ClipboardList,
//   BellRing,
//   LogOut,
//   ChevronsUpDown,
//   Command,
//   Settings,
//   User,
//   Headset,
//   Briefcase,
//   Paperclip,
//   CreditCard,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";

// // Organize menu items into groups for better UX
// const menuGroups = [
//   {
//     label: "Platform",
//     items: [
//       { href: "/dashboard", icon: LayoutDashboard, label: "Панель управления" },
//     ],
//   },

//   {
//     label: "Пользователь",
//     items: [
//       { href: "/users/performers", icon: User, label: "Исполнители" },
//       { href: "/users/customers", icon: User, label: "Клиенты" },
//     ],
//   },
//   {
//     label: "Конфигурация",
//     items: [
//       { href: "/settings", icon: Settings, label: "Настройки" },
//       { href: "/pricing", icon: CreditCard, label: "Тарифы" },
//     ],
//   },
//   {
//     label: "Коммуникация",
//     items: [
//       { href: "/blog", icon: Paperclip, label: "Блог" },
//       { href: "/notifications", icon: BellRing, label: "Уведомления" },
//       { href: "/support", icon: Headset, label: "Поддержка запросов" },
//     ],
//   },
// ];

// export function SidebarNav() {
//   const { data: session } = useSession();
//   const pathname = usePathname();

//   const handleLogout = () => {
//     signOut({ callbackUrl: "/login" });
//   };

//   return (
//     <>
//       <SidebarHeader className="bg-slate-50">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <Link href="/dashboard">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//                   <Command className="size-4" />
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">
//                     Eventomir Admin
//                   </span>
//                   <span className="truncate text-xs">Management Panel</span>
//                 </div>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent>
//         {menuGroups.map((group) => (
//           <SidebarGroup key={group.label}>
//             <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
//             <SidebarMenu>
//               {group.items.map((item) => (
//                 <SidebarMenuItem key={item.href}>
//                   <Link href={item.href} passHref legacyBehavior>
//                     <SidebarMenuButton
//                       isActive={pathname === item.href}
//                       tooltip={item.label}
//                     >
//                       <item.icon />
//                       <span>{item.label}</span>
//                     </SidebarMenuButton>
//                   </Link>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       <SidebarFooter className="bg-slate-50">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton
//                   size="lg"
//                   className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//                 >
//                   <Avatar className="h-8 w-8 rounded-lg">
//                     <AvatarImage
//                       src={session?.user.image || "/icons/icon-192x192.png"}
//                       alt={session?.user.name || "User"}
//                     />
//                     <AvatarFallback className="rounded-lg">
//                       {session?.user.name?.charAt(0) || "A"}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-semibold">
//                       {session?.user.name || "Admin User"}
//                     </span>
//                     <span className="truncate text-xs">
//                       {session?.user.email || "admin@zepo.com"}
//                     </span>
//                   </div>
//                   <ChevronsUpDown className="ml-auto size-4" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//                 side="bottom"
//                 align="end"
//                 sideOffset={4}
//               >
//                 <DropdownMenuLabel className="p-0 font-normal">
//                   <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                     <Avatar className="h-8 w-8 rounded-lg">
//                       <AvatarImage
//                         src={session?.user.image || "/icons/icon-192x192.png"}
//                         alt={session?.user.name || "User"}
//                       />
//                       <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//                     </Avatar>
//                     <div className="grid flex-1 text-left text-sm leading-tight">
//                       <span className="truncate font-semibold">
//                         {session?.user.name}
//                       </span>
//                       <span className="truncate text-xs">
//                         {session?.user.email}
//                       </span>
//                     </div>
//                   </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 {/* <DropdownMenuItem>
//                   <Settings className="mr-2 h-4 w-4" />
//                   Settings
//                 </DropdownMenuItem> */}
//                 <DropdownMenuItem>
//                   <User className="mr-2 h-4 w-4" />
//                   Профиль
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={handleLogout}
//                   className="text-red-600 focus:text-red-600"
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   выйти
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BellRing,
  Command,
  Settings,
  User,
  Headset,
  Paperclip,
  CreditCard,
} from "lucide-react";

// Organize menu items into groups for better UX
const menuGroups = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Панель управления" },
    ],
  },
  {
    label: "Пользователь",
    items: [
      { href: "/users/performers", icon: User, label: "Исполнители" },
      { href: "/users/customers", icon: User, label: "Заказчик" },
    ],
  },
  {
    label: "Конфигурация",
    items: [
      { href: "/settings", icon: Settings, label: "Настройки" },
      { href: "/pricing", icon: CreditCard, label: "Тарифы" },
    ],
  },
  {
    label: "Коммуникация",
    items: [
      { href: "/blog", icon: Paperclip, label: "Блог" },
      { href: "/notifications", icon: BellRing, label: "Уведомления" },
      { href: "/support", icon: Headset, label: "Поддержка запросов" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="bg-slate-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Eventomir Admin
                  </span>
                  <span className="truncate text-xs">Management Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* Footer removed from here */}
    </>
  );
}
