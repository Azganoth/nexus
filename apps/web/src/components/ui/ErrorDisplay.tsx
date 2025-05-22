import { Link } from "$/components/ui/Link";
import clsx from "clsx";
import type { ReactNode } from "react";

const normalizeText = (text: string) => text.replaceAll("\\n", "\n");

interface ErrorDisplayProps {
  title: string;
  message?: string;
  action?: ReactNode;
}

export function ErrorDisplay({ title, message, action }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <h1
        className={clsx(
          "relative whitespace-pre-line text-center font-bold",
          "before:bg-red before:absolute before:-top-4 before:left-1/2 before:h-1.5 before:w-16 before:-translate-x-1/2 before:rounded-full before:content-['']",
          message ? "text-3xl" : "text-xl",
        )}
      >
        {normalizeText(title)}
      </h1>
      {message && (
        <p className="mt-4 whitespace-pre-line text-center font-bold">
          {normalizeText(message)}
        </p>
      )}
      {action ?? (
        <Link className="mt-8 font-bold" href="/">
          Voltar a página inicial
        </Link>
      )}
    </div>
  );
}
