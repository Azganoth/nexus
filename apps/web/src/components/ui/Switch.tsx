import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { useId, useState } from "react";

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "checked"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Switch({
  id,
  className,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  ...props
}: SwitchProps) {
  const autoId = useId();
  const toggleId = id ?? autoId;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    const newValue = !isChecked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <button
      className={clsx(
        "focus-ring inline-flex h-[1.5em] w-[2.75em] min-w-[2.75em] items-center rounded-full transition-all disabled:cursor-not-allowed",
        isChecked
          ? "bg-purple hover:bg-purple/90"
          : "bg-stardust hover:bg-slate/50",
        className,
      )}
      id={toggleId}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-disabled={disabled}
      onClick={handleToggle}
      disabled={disabled}
      {...props}
    >
      <span
        className={clsx(
          "ease-spring inline-block h-[1em] w-[1em] rounded-full bg-white transition-transform duration-300",
          isChecked
            ? "translate-x-[calc(100%+0.45em)]"
            : "translate-x-[0.25em]",
        )}
      />
    </button>
  );
}
