"use client";

import clsx from "clsx";
import { motion, type Transition } from "motion/react";
import type { ButtonHTMLAttributes } from "react";
import { useId, useState } from "react";

const handleTransition: Transition = {
  type: "spring",
  visualDuration: 0.25,
  bounce: 0.35,
};

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
  style,
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
        "focus-ring inline-flex h-min w-[2.75em] min-w-[2.75em] rounded-full p-1 disabled:cursor-not-allowed",
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
      style={{
        ...style,
        justifyContent: isChecked ? "flex-end" : "flex-start",
      }}
      {...props}
    >
      <motion.div
        className="h-[1em] w-[1em] rounded-full bg-white shadow-[0_0_4px_rgba(0,0,0,0.15)]"
        layout
        transition={handleTransition}
      />
    </button>
  );
}
