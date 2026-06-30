export function Header() {
  return (
    <header className="border-b border-primary-dark bg-primary-dark">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo-Turniza_5.gif" alt="Turinza" className="h-10 w-auto" />
          <div>
            <p className="text-base font-bold leading-tight tracking-tight text-white">
              SOP de Cliente Logístico
            </p>
            <p className="text-xs text-white/80">Sistema Integrado de Gestión</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded border border-white/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/90 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-light" aria-hidden="true" />
          Doc. controlado · OP-F00 · v.01
        </div>
      </div>
    </header>
  );
}
