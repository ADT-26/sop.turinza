import type { ReactNode } from "react";

interface DetailsSectionProps {
  index: number;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

// Variante colapsable de SectionCard para listas largas de solo lectura
// (datos del cliente en el panel admin): usa <details> nativo, así que
// funciona sin JS y trae soporte de teclado de fábrica.
export function DetailsSection({ index, title, defaultOpen, children }: DetailsSectionProps) {
  return (
    <details
      className="group overflow-hidden rounded-md border border-line bg-white shadow-sm"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 hover:bg-surface marker:content-none">
        <span
          className="select-none font-mono text-3xl font-black leading-none text-navy/10 shrink-0 w-10 text-right tabular-nums"
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
          className="h-4 w-4 shrink-0 text-navy/25 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-line space-y-5 px-5 py-5">{children}</div>
    </details>
  );
}
