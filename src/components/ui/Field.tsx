import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  const descriptionId = htmlFor && (hint || error) ? `${htmlFor}-desc` : undefined;

  const child =
    descriptionId && isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-describedby": descriptionId,
          "aria-invalid": error ? true : undefined,
        })
      : children;

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (requerido)</span>}
      </label>
      {child}
      {error ? (
        <p id={descriptionId} role="alert" className="text-xs text-accent">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
