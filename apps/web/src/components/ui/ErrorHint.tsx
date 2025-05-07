import clsx from "clsx";

interface Props {
  id?: string;
  className?: string;
  message?: string;
}

export function ErrorHint({ id, className, message }: Props) {
  return (
    <div
      className={clsx(
        "text-red min-h-[var(--text-sm--line-height)] whitespace-pre-line text-sm font-bold",
        className,
      )}
    >
      {message && (
        <span
          className="block"
          id={id ? `${id}-error` : undefined}
          role="alert"
        >
          {message}
        </span>
      )}
    </div>
  );
}
