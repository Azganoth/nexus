import clsx from "clsx";
import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  LinkProps;

export interface CustomLinkProps extends AnchorProps {
  children: ReactNode;
  newTab?: boolean;
  variant?: "default" | "unstyled";
}

export function CustomLink({
  className,
  children,
  href,
  newTab,
  variant = "default",
  ...other
}: CustomLinkProps) {
  return (
    <Link
      href={href}
      rel={newTab ? "noreferrer" : undefined}
      target={newTab ? "_blank" : undefined}
      className={clsx(
        variant === "default" && "underline text-medium-grey hover:text-purple",
        className,
      )}
      {...other}
    >
      {children}
    </Link>
  );
}
