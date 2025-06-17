"use client";

import { Icon } from "$/components/ui/Icon";
import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface ModalProps extends HTMLAttributes<HTMLDialogElement> {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Modal({
  title,
  children,
  isOpen,
  onClose,
  ...otherProps
}: ModalProps) {
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
      className="rounded-4xl starting:opacity-0 starting:scale-90 m-auto w-full max-w-[min(400px,calc(100%-4rem))] bg-white shadow-lg transition-[opacity,scale] duration-300 backdrop:bg-black/80 backdrop:backdrop-blur"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      {...otherProps}
    >
      <div className="relative p-8 pt-6">
        <header className="flex items-center justify-between">
          <h2 id={titleId} className="text-center text-xl font-semibold">
            {title}
          </h2>
          <button
            className="text-slate btn-icon focus-ring hover:text-charcoal"
            type="button"
            onClick={onClose}
            aria-label="Fechar diálogo"
          >
            <Icon className="icon-[fa6-solid--xmark] text-2xl" />
          </button>
        </header>
        <div id={descId} className="mt-4">
          {children}
        </div>
      </div>
    </dialog>
  );
}
