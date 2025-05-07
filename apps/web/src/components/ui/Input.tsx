"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import clsx from "clsx";
import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ id, className, label, error, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement | null>(null);

    const focus = useCallback(() => {
      internalRef.current?.focus();
    }, []);

    // Keep track of value emptiness for label positioning
    const [isEmpty, setIsEmpty] = useState(
      !(props.value ?? props.defaultValue),
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setIsEmpty(!e.target.value);
        onChange?.(e);
      },
      [onChange],
    );

    return (
      <div className={className} role="group">
        <div
          className={clsx(
            "border-light-grey hover:border-medium-grey relative grid cursor-text rounded-lg border bg-white px-4 py-2 -outline-offset-2",
            error
              ? "outline-red outline-2"
              : "outline-black focus-within:outline-2",
          )}
          onClick={focus}
          data-testid="input-container"
        >
          <input
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              internalRef.current = node;
            }}
            id={id}
            className="text-md placeholder:text-medium-grey peer mt-[var(--text-xxs--line-height)] w-full outline-none"
            aria-invalid={!!error}
            aria-describedby={`${id}-error`}
            onChange={handleChange}
            {...props}
          />
          {label && (
            <label
              className={clsx(
                "text-medium-grey text-xxs absolute left-4 top-0 origin-top translate-y-2 cursor-text font-bold transition-[translate,font-size]",
                isEmpty &&
                  "peer-not-focus:peer-not-placeholder-shown:text-md peer-not-focus:peer-not-placeholder-shown:translate-y-4",
              )}
              htmlFor={id}
            >
              {label}
            </label>
          )}
        </div>
        <ErrorHint className="mt-1 px-2" id={id} message={error} />
      </div>
    );
  },
);

Input.displayName = "Input";
