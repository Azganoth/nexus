import { ErrorHint } from "$/components/ui/ErrorHint";
import { Switch, type SwitchProps } from "$/components/ui/Switch";
import clsx from "clsx";
import { isValidElement, useId, type ReactNode } from "react";

interface LabeledSwitchProps extends SwitchProps {
  label: string;
  description?: ReactNode;
  position?: "left" | "right";
  error?: string;
}

export function LabeledSwitch({
  label,
  description,
  position = "left",
  error,
  id,
  className,
  ...switchProps
}: LabeledSwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const descriptionId = `${switchId}-description`;
  const errorId = error ? `${switchId}-error` : undefined;

  return (
    <div
      className={clsx(
        "flex gap-4",
        position === "right" && "flex-row-reverse",
        className,
      )}
    >
      <Switch
        id={switchId}
        aria-describedby={clsx(descriptionId, errorId)}
        {...switchProps}
      />
      <div className="grow">
        <label className="font-medium" htmlFor={switchId}>
          {label}
        </label>
        {description &&
          (isValidElement(description) ? (
            description
          ) : (
            <p className="text-dark-grey text-sm" id={descriptionId}>
              {description}
            </p>
          ))}
        <ErrorHint id={errorId} error={error} />
      </div>
    </div>
  );
}
