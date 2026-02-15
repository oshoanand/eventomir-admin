"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";

// Define the shape of the Action used in your app
type ToastAction = {
  label: string;
  onClick: () => void;
};

// Combine Sonner's native props with your custom variants
type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  action?: ToastAction; // Explicitly adding this for type safety
} & ExternalToast;

function toast({ title, description, variant, action, ...props }: ToastProps) {
  // 1. Handle "Destructive" (Error) Variant
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      action: action, // Pass the action object directly
      ...props,
    });
  }

  // 2. Handle "Success" Variant (Green)
  if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      action: action,
      ...props,
    });
  }

  // 3. Default Variant (Standard/Black)
  return sonnerToast(title, {
    description,
    action: action,
    ...props,
  });
}

function useToast() {
  return {
    toast,
    // Sonner handles dismiss via ID, which toast() returns
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
