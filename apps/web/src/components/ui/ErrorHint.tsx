import clsx from "clsx";
import type { HTMLAttributes } from "react";

interface ErrorHintProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
}

export function ErrorHint({ className, error, ...otherProps }: ErrorHintProps) {
  if (!error) {
    return null;
  }

  return (
    <p
      className={clsx("text-red whitespace-pre-line font-bold", className)}
      aria-live="polite"
      {...otherProps}
    >
      {error}
    </p>
  );
}
