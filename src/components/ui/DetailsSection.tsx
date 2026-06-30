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
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-line bg-surface px-5 py-4 marker:content-none">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary-dark">
            Sección {String(index).padStart(2, "0")}
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">{title}</h2>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </details>
  );
}
