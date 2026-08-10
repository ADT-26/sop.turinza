import type { ReactNode } from "react";

interface DetailsSectionProps {
  index: number;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function DetailsSection({ index, title, defaultOpen, children }: DetailsSectionProps) {
  return (
    <details
      className="group overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/20 bg-white shadow-sm transition-shadow hover:shadow-md"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3.5 hover:bg-navy/[0.02] marker:content-none">
        <span
          className="w-9 shrink-0 select-none text-right font-mono text-2xl font-black leading-none tabular-nums text-navy/[0.12]"
          aria-hidden="true"
        >
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="flex-1 text-sm font-semibold tracking-tight text-navy">{title}</h2>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0 text-navy/30 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-line space-y-5 px-5 py-5">{children}</div>
    </details>
  );
}
