"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  Truck,
  CheckCircle2,
  Handshake,
  Info,
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { NotificationItem } from "@/types/notification";

const NotificationBell: React.FC = () => {
  const router = useRouter();
  const { unreadCount, notifications, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBellClick = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // If opening the dropdown and there are unread items, clear the badge
    if (nextState && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to format date safely
  const formatTime = (dateInput: string | Date) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);

    // If it's today, show time. Otherwise, show date and time.
    const isToday = new Date().toDateString() === date.toDateString();
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      ...(isToday ? {} : { day: "2-digit", month: "2-digit" }),
    });
  };

  const handleNotificationClick = (link?: string) => {
    setIsOpen(false);
    if (link) {
      router.push(link);
    }
  };

  // --- Helper to get UI configuration based on Notification Type ---
  const getNotificationConfig = (notif: any) => {
    switch (notif.type) {
      case "TOKEN":
        return {
          icon: <Package size={16} />,
          colorClass: "bg-blue-100 text-blue-600",
          title: "Новый токен",
          link: "/tokens",
          body: (
            <>
              <p className="text-xs text-gray-600 mt-0.5">
                Код:{" "}
                <span className="font-mono bg-gray-100 px-1 rounded">
                  {notif.tokenCode}
                </span>
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Заказ: {notif.orderNumber}
              </p>
            </>
          ),
        };
      case "JOB":
        return {
          icon: <Truck size={16} />,
          colorClass: "bg-orange-100 text-orange-600",
          title: "Новая заявка (Работа)",
          link: "/jobs",
          body: (
            <>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {notif.location}
              </p>
              <p className="text-xs font-medium text-green-600 mt-1">
                {notif.cost}₽
              </p>
            </>
          ),
        };
      case "PARTNER_REQUEST":
        return {
          icon: <Handshake size={16} />,
          colorClass: "bg-green-100 text-emerald-600",
          title: "Новый партнер",
          link: notif.link || "/partners",
          body: (
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {notif.message}
            </p>
          ),
        };
      case "SYSTEM":
      default:
        return {
          icon: <Info size={16} />,
          colorClass: "bg-slate-100 text-slate-600",
          title: "Системное уведомление",
          link: notif.link || undefined,
          body: (
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {notif.message || "У вас новое уведомление"}
            </p>
          ),
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- Bell Icon Button --- */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={24} />

        {/* Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full min-w-[18px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Уведомления</span>
            <span className="text-xs text-gray-500">
              {notifications.length} последних
            </span>
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-gray-300" />
                <p>Уведомлений нет. Вы все прочитали!</p>
              </div>
            ) : (
              notifications.map((notif: NotificationItem, index: number) => {
                const config = getNotificationConfig(notif);

                return (
                  <div
                    key={notif.id || index}
                    onClick={() => handleNotificationClick(config.link)}
                    className="p-3 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex gap-3">
                      {/* --- DYNAMIC ICON --- */}
                      <div
                        className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${config.colorClass}`}
                      >
                        {config.icon}
                      </div>

                      {/* --- DYNAMIC CONTENT --- */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {config.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {formatTime((notif as any).createdAt)}
                          </span>
                        </div>
                        {config.body}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Отметить все как прочитанные
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
