import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-dark">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 px-6 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-white/55">
          Documento controlado del SIG · Turinza — Toda modificación debe registrarse en el Control
          de Cambios.
        </span>
        <Link
          href="/dashboard"
          prefetch={false}
          className="shrink-0 font-medium text-white/55 hover:text-white transition-colors"
        >
          Panel interno
        </Link>
      </div>
    </footer>
  );
}
