"use client";

import { Icon } from "$/components/ui/Icon";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "danger" | "none";
  isLoading?: boolean;
}

export function Button({
  className,
  children,
  type = "button",
  disabled,
  variant = "default",
  isLoading,
  ...otherProps
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "btn focus-ring",
        variant === "default" && "bg-charcoal hover:bg-charcoal/90 text-white",
        variant === "accent" && "bg-purple hover:bg-purple/90 text-white",
        variant === "danger" && "bg-red hover:bg-red/90 text-white",
        className,
      )}
      type={type}
      disabled={isLoading || disabled}
      {...otherProps}
    >
      {isLoading ? (
        <Icon className="icon-[svg-spinners--180-ring] mx-auto text-inherit" />
      ) : (
        children
      )}
    </button>
  );
}
