import clsx from "clsx";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  NextLinkProps;

interface LinkProps extends AnchorProps {
  children: ReactNode;
  newTab?: boolean;
  variant?: "default" | "none";
}

export function Link({
  className,
  children,
  href,
  newTab,
  variant = "default",
  ...other
}: LinkProps) {
  return (
    <NextLink
      href={href}
      rel={newTab ? "noreferrer" : undefined}
      target={newTab ? "_blank" : undefined}
      className={clsx(
        "focus-ring",
        variant === "default" &&
          "text-comet hover:text-purple underline transition-colors",
        className,
      )}
      {...other}
    >
      {children}
    </NextLink>
  );
}
