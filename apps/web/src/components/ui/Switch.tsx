import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { useId, useState } from "react";

interface Props
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
}: Props) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      className={clsx(
        "focus-ring inline-flex h-[1.5em] w-[2.75em] min-w-[2.75em] items-center rounded-full",
        isChecked ? "bg-purple" : "bg-light-grey",
        className,
      )}
      id={toggleId}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...props}
    >
      <span
        className={clsx(
          "inline-block h-[1em] w-[1em] rounded-full bg-white transition-transform",
          isChecked
            ? "translate-x-[calc(100%+0.45em)]"
            : "translate-x-[0.25em]",
        )}
      />
    </button>
  );
}
