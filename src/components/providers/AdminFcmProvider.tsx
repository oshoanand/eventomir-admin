"use client";

import useAdminFcm from "@/hooks/useAdminFcm";

export default function AdminFcmProvider() {
  useAdminFcm();
  return null; // Logic-only component
}
