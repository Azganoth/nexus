"use client";

import { toast } from "$/components/ui/Toast";
import { WEB_URL } from "$/lib/constants";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  className?: string;
  username: string;
}

export function ProfileShare({ className, username }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const url = new URL(`/p/${username}`, WEB_URL);

  const copy = async () => {
    if (isCopied) return; // Prevent multiple clicks while copying

    try {
      await window.navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
      toast.success("Link para página de perfil copiado!");

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao copiar link. Tente novamente.");
    }
  };

  return (
    <div
      className={clsx(
        "flex min-w-[300px] max-w-[600px] rounded-full bg-white px-4 py-2 shadow-md ring-2 ring-black",
        className,
      )}
      role="group"
    >
      <span className="grow truncate font-bold" aria-label="URL do perfil">
        {url.pathname}
      </span>
      <button
        className={clsx(
          "focus-ring transition-colors duration-200",
          isCopied
            ? "text-green cursor-not-allowed"
            : "text-medium-grey hover:text-black",
        )}
        type="button"
        onClick={copy}
        aria-label={
          isCopied
            ? "Link copiado com sucesso"
            : "Copiar link do perfil para compartilhar"
        }
        aria-pressed={isCopied}
      >
        <span
          className={clsx(
            "block text-lg",
            isCopied ? "icon-[fa6-solid--check]" : "icon-[fa6-solid--copy]",
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
