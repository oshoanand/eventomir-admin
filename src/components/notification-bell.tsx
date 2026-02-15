"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Package, Truck, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { NotificationItem } from "@/types/notification";

const NotificationBell: React.FC = () => {
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
    return new Date(dateInput).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Notifications</span>
            <span className="text-xs text-gray-500">
              {notifications.length} recent
            </span>
          </div>

          <div className="max-h-[20rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-gray-300" />
                <p>All caught up!</p>
              </div>
            ) : (
              notifications.map((notif: NotificationItem, index: number) => (
                <div
                  key={notif.id || index}
                  className="p-3 border-b border-gray-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex gap-3">
                    {/* --- ICON BASED ON TYPE --- */}
                    <div
                      className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === "TOKEN"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {notif.type === "TOKEN" ? (
                        <Package size={16} />
                      ) : (
                        <Truck size={16} />
                      )}
                    </div>

                    {/* --- CONTENT --- */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {notif.type === "TOKEN"
                            ? "Token Generated"
                            : "New Job Posted"}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* --- CONDITIONAL RENDERING --- */}
                      {notif.type === "TOKEN" ? (
                        // Token Specific UI
                        <>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Code:{" "}
                            <span className="font-mono bg-gray-100 px-1 rounded">
                              {notif.tokenCode}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Order: {notif.orderNumber}
                          </p>
                        </>
                      ) : (
                        // Job Specific UI
                        <>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {notif.location}
                          </p>
                          <p className="text-xs font-medium text-green-600 mt-1">
                            {notif.cost}₽
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
