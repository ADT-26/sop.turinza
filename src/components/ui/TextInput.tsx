import { forwardRef, type InputHTMLAttributes } from "react";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/40 aria-invalid:border-accent ${className ?? ""}`}
      />
    );
  },
);
