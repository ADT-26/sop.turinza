import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 px-6 py-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span>
          Documento controlado del SIG · Turinza — Toda modificación debe registrarse en el Control
          de Cambios.
        </span>
        <Link
          href="/dashboard"
          prefetch={false}
          className="shrink-0 hover:text-primary-dark hover:underline"
        >
          Panel interno
        </Link>
      </div>
    </footer>
  );
}
