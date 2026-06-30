const BADGE_STYLES: Record<string, string> = {
  Abierto: "bg-primary/10 text-primary-dark border-primary/30",
  "En revisión": "bg-amber-50 text-amber-700 border-amber-200",
  Obsoleto: "bg-gray-100 text-gray-500 border-gray-200",
  Aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Alta: "bg-accent/10 text-accent border-accent/30",
  Media: "bg-amber-50 text-amber-700 border-amber-200",
  Baja: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function Badge({ children }: { children: string }) {
  const style = BADGE_STYLES[children] ?? "bg-surface text-ink-muted border-line";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {children}
    </span>
  );
}
