export function Header() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Logo-Turniza_5.gif" alt="Turinza" className="h-10 w-auto" />
        <div>
          <p className="text-sm font-semibold text-ink">SOP de Cliente Logístico</p>
          <p className="text-xs text-ink-muted">OP-F00 · Sistema Integrado de Gestión</p>
        </div>
      </div>
    </header>
  );
}
