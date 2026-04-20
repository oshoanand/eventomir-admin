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
  Calendar,
  Handshake,
  Ticket,
  MessageCircleMore,
  Tags,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/utils/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  // Global Chat State
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);
  const connectSocket = useChatStore((state) => state.connectSocket);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      connectSocket(session.user.id as string);
    }
  }, [status, session, connectSocket]);

  const menuGroups = [
    {
      label: "Platform",
      items: [{ href: "/dashboard", icon: LayoutDashboard, label: "Главная" }],
    },
    ...(userRole === "administrator" || userRole === "support"
      ? [
          {
            label: "Администрирование",
            items: [
              { href: "/users/manage", icon: Users, label: "Пользователи" },
              { href: "/bookings", icon: Ticket, label: "Бронирование" },
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
        { href: "/promo", icon: Tags, label: "Промо-код" },
        { href: "/events", icon: Calendar, label: "Ближайшие" },
      ],
    },
    {
      label: "Коммуникация",
      items: [
        { href: "/blog", icon: Paperclip, label: "Блог" },
        { href: "/chat", icon: MessageCircleMore, label: "Чат" },
        { href: "/notifications", icon: BellRing, label: "Уведомления" },
        { href: "/support", icon: Headset, label: "Поддержка" },
      ],
    },
  ];

  return (
    <>
      <SidebarHeader className="bg-slate-50/50 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <Link href="/dashboard" className="gap-3">
                <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                  <Command className="size-3.5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold tracking-tight text-foreground">
                    Eventomir Admin
                  </span>
                  <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">
                    Management Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 custom-scrollbar">
        {menuGroups.map((group, index) => (
          <SidebarGroup
            key={group.label}
            className={cn("py-1.5", index === 0 ? "pt-0" : "")}
          >
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1 px-2 h-auto group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>

            <SidebarMenu>
              {group.items.map((item) => {
                const isChat = item.label === "Чат";
                const isActive = pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "relative transition-all duration-200 rounded-md",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 transition-all",
                            isActive
                              ? "text-primary stroke-[2.5px]"
                              : "text-slate-500",
                          )}
                        />

                        <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>

                        {/* FULL BADGE: Visible only when expanded */}
                        {isChat && totalUnreadCount > 0 && (
                          <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground shadow-sm group-data-[collapsible=icon]:hidden">
                            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                          </span>
                        )}

                        {/* DOT BADGE: Visible only when collapsed */}
                        {isChat && totalUnreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 hidden size-2 rounded-full bg-destructive group-data-[collapsible=icon]:block" />
                        )}
                      </Link>
                    </SidebarMenuButton>
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
