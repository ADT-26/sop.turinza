const BADGE_STYLES: Record<string, string> = {
  Abierto: "bg-primary/10 text-primary-dark border-primary/30",
  "En revisión": "bg-amber-50 text-amber-700 border-amber-200",
  Obsoleto: "bg-gray-100 text-gray-500 border-gray-200",
  Aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Alta: "bg-accent/10 text-accent border-accent/30",
  Media: "bg-amber-50 text-amber-700 border-amber-200",
  Baja: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// Variante para usar sobre fondos oscuros (teal/navy):
// píldora blanca translúcida que funciona en cualquier header oscuro
const BADGE_DARK_ACCENT: Record<string, string> = {
  Aprobado: "border-emerald-300/50 bg-emerald-400/20 text-emerald-200",
  "En revisión": "border-amber-300/50 bg-amber-400/20 text-amber-200",
  Obsoleto: "border-white/20 bg-white/10 text-white/50",
  Alta: "border-accent/50 bg-accent/20 text-accent/90",
  Media: "border-amber-300/50 bg-amber-400/20 text-amber-200",
  Baja: "border-emerald-300/50 bg-emerald-400/20 text-emerald-200",
};

export function Badge({ children, dark }: { children: string; dark?: boolean }) {
  if (dark) {
    const style =
      BADGE_DARK_ACCENT[children] ?? "border-white/25 bg-white/15 text-white/85";
    return (
      <span
        className={`inline-flex items-center rounded-[4px] border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${style}`}
      >
        {children}
      </span>
    );
  }

  const style = BADGE_STYLES[children] ?? "bg-surface text-ink-muted border-line";
  return (
    <span
      className={`inline-flex items-center rounded-[4px] border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${style}`}
    >
      {children}
    </span>
  );
}
