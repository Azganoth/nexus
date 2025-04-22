"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

export const toast = (
  message: ToastProps["message"],
  options: { duration?: number } & Omit<ToastProps, "id" | "message"> = {},
) => {
  const { duration, ...props } = options;
  sonnerToast.custom((id) => <Toast id={id} message={message} {...props} />, {
    duration,
  });
};

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
        <span
          className={clsx(
            "block text-xl",
            variant === "success" &&
              "icon-[fa6-solid--circle-chevron-down] text-green",
            variant === "warning" &&
              "icon-[fa6-solid--circle-exclamation] text-yellow",
            variant === "error" && "icon-[fa6-solid--circle-xmark] text-red",
          )}
        ></span>
      )}
      <div role="status" className="font-semibold">
        {message}
      </div>
      <button className="text-light-grey ml-auto text-lg" onClick={dismiss}>
        <span className="icon-[fa6-solid--xmark] block"></span>
      </button>
    </div>
  );
}
