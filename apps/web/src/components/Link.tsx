import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

interface CustomLinkProps extends LinkProps {
  children?: ReactNode;
  newTab?: boolean;
}

export function CustomLink({
  children,
  href,
  newTab,
  ...other
}: CustomLinkProps) {
  return (
    <Link
      href={href}
      rel={newTab ? "noreferrer" : undefined}
      target={newTab ? "_blank" : undefined}
      className="text-purple-600 hover:text-purple-500 font-bold transition-colors"
      {...other}
    >
      {children}
    </Link>
  );
}
