"use client";

import { Icon } from "$/components/ui/Icon";
import clsx from "clsx";
import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

type ToastOptions = { duration?: number } & Omit<ToastProps, "id" | "message">;

export const toast = (
  message: ToastProps["message"],
  options: ToastOptions = {},
) => {
  const { duration, ...props } = options;
  sonnerToast.custom((id) => <Toast id={id} message={message} {...props} />, {
    duration,
  });
};

type ToastShortcut = (
  message: ToastProps["message"],
  options?: Omit<ToastOptions, "variant">,
) => void;
toast.success = ((message, options) =>
  toast(message, { ...options, variant: "success" })) as ToastShortcut;
toast.warning = ((message, options) =>
  toast(message, { ...options, variant: "warning" })) as ToastShortcut;
toast.error = ((message, options) =>
  toast(message, { ...options, variant: "error" })) as ToastShortcut;

interface ToastProps {
  id: string | number;
  message: ReactNode;
  variant?: "success" | "warning" | "error";
}

function Toast({ id, message, variant }: ToastProps) {
  const dismiss = () => {
    sonnerToast.dismiss(id);
  };

  return (
    <div className="ring-light-grey flex items-center gap-3 rounded-lg bg-white p-4 shadow-2xl ring-1">
      {variant && (
        <Icon
          className={clsx(
            "text-xl",
            variant === "success" &&
              "icon-[fa6-solid--circle-chevron-down] text-green",
            variant === "warning" &&
              "icon-[fa6-solid--circle-exclamation] text-yellow",
            variant === "error" && "icon-[fa6-solid--circle-xmark] text-red",
          )}
        />
      )}
      <div role="status" className="font-semibold">
        {message}
      </div>
      <button
        className="text-light-grey ml-auto text-lg"
        onClick={dismiss}
        aria-label="Fechar notificação"
      >
        <Icon className="icon-[fa6-solid--xmark]" />
      </button>
    </div>
  );
}
