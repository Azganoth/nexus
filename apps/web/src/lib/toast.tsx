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
    <div className="flex rounded-lg gap-3 bg-white shadow-2xl ring-1 ring-light-grey items-center p-4">
      {variant && (
        <span
          className={clsx(
            "text-xl block",
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
      <button className="text-light-grey text-lg ml-auto" onClick={dismiss}>
        <span className="icon-[fa6-solid--xmark] block"></span>
      </button>
    </div>
  );
}
