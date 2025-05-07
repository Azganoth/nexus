import clsx from "clsx";
import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  LinkProps;

interface Props extends AnchorProps {
  children: ReactNode;
  newTab?: boolean;
  variant?: "default" | "unstyled";
}

export function Link({
  className,
  children,
  href,
  newTab,
  variant = "default",
  ...other
}: Props) {
  return (
    <NextLink
      href={href}
      rel={newTab ? "noreferrer" : undefined}
      target={newTab ? "_blank" : undefined}
      className={clsx(
        variant === "default" && "text-dark-grey hover:text-purple underline",
        className,
      )}
      {...other}
    >
      {children}
    </NextLink>
  );
}
