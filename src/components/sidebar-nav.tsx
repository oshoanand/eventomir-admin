"use client";

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
  Users, // Icon for User Management
  Shield,
  Square,
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role; // "admin", "support", etc.

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
              }, // CRUD Page
              {
                href: "/bookings",
                icon: Square,
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
                  <Link href={item.href}>
                    {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */}
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
    </>
  );
}
