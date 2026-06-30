import type { ReactNode } from "react";

interface SectionCardProps {
  index: number;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ index, title, description, children }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-md border border-line bg-white shadow-sm">
      <header className="border-b border-line bg-surface px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary-dark">
          Sección {String(index).padStart(2, "0")}
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </header>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </section>
  );
}
