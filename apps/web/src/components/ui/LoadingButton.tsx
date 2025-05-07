import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean;
}

export function LoadingButton({
  className,
  children,
  disabled,
  isPending,
  ...props
}: Props) {
  return (
    <button
      className={clsx("btn", className)}
      type="submit"
      disabled={isPending || disabled}
      {...props}
    >
      {isPending ? (
        <span className="icon-[svg-spinners--180-ring] mx-auto block text-xl"></span>
      ) : (
        children
      )}
    </button>
  );
}
