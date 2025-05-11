"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Modal({ title, children, isOpen, onClose }: Props) {
  const id = useId();
  const titleId = `${id}-modal-title`;
  const descId = `${id}-modal-description`;

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (isOpen) {
      dialogElement?.showModal();
    } else {
      dialogElement?.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="rounded-4xl m-auto max-w-[min(400px,calc(100%-4rem))] bg-white shadow-lg backdrop:bg-black/80"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="relative p-8">
        <header>
          <h2 id={titleId} className="pr-8 text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar diálogo"
            className="text-medium-grey focus-ring absolute right-6 top-6 hover:text-black"
          >
            <span className="icon-[fa6-solid--xmark] block text-2xl"></span>
          </button>
        </header>
        <div id={descId} className="mt-4">
          {children}
        </div>
      </div>
    </dialog>
  );
}
