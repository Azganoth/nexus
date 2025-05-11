// components/ui/Textarea.tsx
"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import clsx from "clsx";
import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  type TextareaHTMLAttributes,
} from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ id, className, label, error, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id ?? autoId;

    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const focus = useCallback(() => {
      internalRef.current?.focus();
    }, []);

    return (
      <div className={className} role="group">
        <div
          className={clsx(
            "border-light-grey hover:border-medium-grey relative rounded-lg border bg-white px-4 py-2 -outline-offset-2",
            error
              ? "outline-red outline-2"
              : "outline-black focus-within:outline-2",
          )}
          data-testid="textarea-container"
          onClick={focus}
        >
          <textarea
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              internalRef.current = node;
            }}
            id={textareaId}
            className={clsx(
              "text-md placeholder:text-medium-grey w-full resize-none outline-none",
              label && "mt-4",
            )}
            aria-invalid={!!error}
            aria-describedby={`${textareaId}-error`}
            {...props}
          />
          {label && (
            <label
              className="text-medium-grey text-xxs absolute left-4 top-2 font-bold"
              htmlFor={textareaId}
            >
              {label}
            </label>
          )}
        </div>
        <ErrorHint className="mt-1 px-2" id={textareaId} message={error} />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
