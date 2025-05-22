import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface LoadingProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean;
}

export function LoadingButton({
  className,
  children,
  disabled,
  isPending,
  ...props
}: LoadingProps) {
  return (
    <button
      className={clsx("btn focus-ring", className)}
      type="submit"
      disabled={isPending || disabled}
      {...props}
    >
      {isPending ? (
        <Icon className="icon-[svg-spinners--180-ring] mx-auto text-xl" />
      ) : (
        children
      )}
    </button>
  );
}
