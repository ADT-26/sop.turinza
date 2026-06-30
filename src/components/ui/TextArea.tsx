import { forwardRef, type TextareaHTMLAttributes } from "react";

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        {...props}
        className={`w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/40 aria-invalid:border-accent ${className ?? ""}`}
      />
    );
  },
);
