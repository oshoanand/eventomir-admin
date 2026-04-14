"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Users,
  Shield,
  Square,
  Calendar,
  Handshake,
  Ticket,
  MessageCircleMore,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore"; // <-- Imported the store

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  // Global Chat State
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);
  const connectSocket = useChatStore((state) => state.connectSocket);

  // Initialize socket for the admin on mount so unread count starts tracking
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      connectSocket(session.user.id as string);
    }
  }, [status, session, connectSocket]);

  // Define Groups dynamically based on Role
  const menuGroups = [
    {
      label: "Platform",
      items: [
        {
          href: "/dashboard",
          icon: LayoutDashboard,
          label: "Панель управления",
        },
      ],
    },
    // Only Admin and Support can see this group
    ...(userRole === "administrator" || userRole === "support"
      ? [
          {
            label: "Администрирование",
            items: [
              {
                href: "/users/manage",
                icon: Users,
                label: "Управление пользователями",
              },
              {
                href: "/bookings",
                icon: Ticket,
                label: "Бронирование",
              },
            ],
          },
        ]
      : []),
    {
      label: "Пользователь",
      items: [
        { href: "/users/performers", icon: User, label: "Исполнители" },
        { href: "/users/customers", icon: User, label: "Заказчик" },
        { href: "/partners", icon: Handshake, label: "Партнеры" },
      ],
    },
    {
      label: "Конфигурация",
      items: [
        { href: "/settings", icon: Settings, label: "Настройки" },
        { href: "/pricing", icon: CreditCard, label: "Тарифы" },
        { href: "/events", icon: Calendar, label: "Ближайшие" },
      ],
    },
    {
      label: "Коммуникация",
      items: [
        { href: "/blog", icon: Paperclip, label: "Блог" },
        { href: "/chat", icon: MessageCircleMore, label: "Чат" },
        { href: "/notifications", icon: BellRing, label: "Уведомления" },
        { href: "/support", icon: Headset, label: "Поддержка запросов" },
      ],
    },
  ];

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
              {group.items.map((item) => {
                const isChat = item.label === "Чат";

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="w-full">
                      <SidebarMenuButton
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.label}</span>
                        </div>

                        {/* UNREAD BADGE INDICATOR */}
                        {isChat && totalUnreadCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </>
  );
}
