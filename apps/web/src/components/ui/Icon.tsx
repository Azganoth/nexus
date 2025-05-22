import clsx from "clsx";
import type { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  inline?: boolean;
}

export function Icon({ className, inline = false, ...otherProps }: IconProps) {
  return (
    <span
      className={clsx(!inline && "block", className)}
      aria-hidden="true"
      {...otherProps}
    />
  );
}
