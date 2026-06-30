import type { ReactNode } from "react";

interface SectionCardProps {
  index: number;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ index, title, description, children }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <header className="flex items-start gap-3 border-b border-line bg-surface px-5 py-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-dark text-xs font-semibold text-white">
          {index}
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
      </header>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </section>
  );
}
