"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Icon } from "$/components/ui/Icon";
import clsx from "clsx";
import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, className, label, error, type, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;

    const internalRef = useRef<HTMLInputElement | null>(null);

    const focus = useCallback(() => {
      internalRef.current?.focus();
    }, []);

    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;

    return (
      <div className={className} data-testid="input-wrapper">
        <div
          className={clsx(
            "border-stardust hover:border-slate relative grid cursor-text rounded-lg border bg-white px-4 py-2 -outline-offset-2 transition-colors",
            error
              ? "outline-red outline-2"
              : "outline-charcoal focus-within:outline-2",
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
            id={inputId}
            className="text-md placeholder:text-slate peer mt-[var(--text-xxs--line-height)] w-full outline-none"
            type={inputType}
            placeholder=" " // NOTE: `:placeholder-shown` only works if theres a non-empty placeholder
            aria-invalid={!!error}
            aria-describedby={errorId}
            {...props}
          />
          {label && (
            <label
              className={clsx(
                "text-slate text-md absolute left-4 top-0 origin-top-left translate-y-4 cursor-text font-bold transition-[font-size,translate]",
                // Smaller label when the input is focused or has value.
                "peer-not-placeholder-shown:text-xxs peer-not-placeholder-shown:translate-y-2 peer-focus:text-xxs peer-focus:translate-y-2",
              )}
              htmlFor={inputId}
            >
              {label}
            </label>
          )}
          {isPasswordField && (
            <button
              type="button"
              className="text-slate focus-ring min-w-7.5 hover:text-charcoal btn-icon absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              <Icon
                className={`mx-auto ${
                  showPassword
                    ? "icon-[fa6-solid--eye]"
                    : "icon-[fa6-solid--eye-slash]"
                }`}
              />
            </button>
          )}
        </div>
        <ErrorHint className="px-2 text-sm" id={errorId} error={error} />
      </div>
    );
  },
);

Input.displayName = "Input";
