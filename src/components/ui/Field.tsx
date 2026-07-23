import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  nota?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  nota,
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
      {nota && (
        <details className="mt-0.5">
          <summary className="flex w-fit cursor-pointer list-none select-none items-center gap-1 text-xs text-ink-muted hover:text-ink">
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="7" />
              <path d="M8 7v5M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <span>Ver nota del formato</span>
          </summary>
          <p className="mt-1 border-l-2 border-primary/30 pl-2 text-xs text-ink-muted/80 whitespace-pre-line">
            {nota}
          </p>
        </details>
      )}
    </div>
  );
}
