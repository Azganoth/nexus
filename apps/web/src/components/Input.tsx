"use client";

import clsx from "clsx";
import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, onChange, ...props }, ref) => {
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
            "border-light-grey hover:border-medium-grey relative grid rounded-lg border bg-white px-4 py-2 -outline-offset-2",
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
            className="text-md placeholder:text-medium-grey peer mt-[var(--text-xxs--line-height)] w-full outline-none"
            aria-invalid={!!error}
            aria-describedby={
              error && props.id ? `${props.id}-error` : undefined
            }
            onChange={handleChange}
            {...props}
          />
          {label && (
            <label
              className={clsx(
                "text-medium-grey text-xxs absolute left-4 top-0 origin-top translate-y-2 font-bold transition-[translate,font-size]",
                isEmpty &&
                  "peer-not-focus:peer-not-placeholder-shown:text-md peer-not-focus:peer-not-placeholder-shown:translate-y-4",
              )}
              htmlFor={props.id}
            >
              {label}
            </label>
          )}
        </div>
        <div className="mt-1 min-h-[var(--text-xs--line-height)] px-4">
          {error && (
            <span
              className="text-red block text-xs font-bold"
              id={props.id ? `${props.id}-error` : undefined}
              role="alert"
            >
              {error}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
