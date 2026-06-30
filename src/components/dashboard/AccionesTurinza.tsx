import type { ReactNode } from "react";
import { NivelClienteEditor } from "./NivelClienteEditor";
import { FirmaTurinzaEditor } from "./FirmaTurinzaEditor";
import { ContactosInternosEditor } from "./ContactosInternosEditor";
import type { SopFormValues } from "@/lib/schemas";

function Tarea({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-white">
        {numero}
      </div>
      <div className="flex-1 space-y-3">
        <p className="text-sm font-semibold text-ink">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

// Las 3 únicas cosas que el cliente NO diligencia y le tocan a Turinza al
// revisar el SOP. Se agrupan en un solo panel con el rojo institucional
// (--color-accent, tomado del logo de Turinza) vs. el resto de la página,
// que es el contenido azul/neutro de solo lectura enviado por el cliente.
export function AccionesTurinza({ id, data }: { id: string; data: SopFormValues }) {
  return (
    <section className="overflow-hidden rounded-md border border-accent/25 bg-accent/5 shadow-sm">
      <header className="border-b border-accent/20 px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
          Acciones de Turinza
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">Pendientes por diligenciar</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Estos 3 campos no los llena el cliente — los completa Turinza al revisar el SOP recibido.
        </p>
      </header>
      <div className="divide-y divide-accent/15 px-5">
        <Tarea numero={1} titulo="Nivel Cliente">
          <NivelClienteEditor id={id} valorInicial={data.resumenEjecutivo.nivelCliente} />
        </Tarea>
        <Tarea numero={2} titulo="Contactos internos Turinza / Cuenta">
          <ContactosInternosEditor id={id} valorInicial={data.contactos.internos} />
        </Tarea>
        <Tarea numero={3} titulo="Revisó / Aprobó Turinza">
          <div className="grid gap-4 sm:grid-cols-2">
            <FirmaTurinzaEditor
              id={id}
              campo="revisoTurinza"
              titulo="Revisó Turinza"
              valorInicial={data.aprobaciones.revisoTurinza}
            />
            <FirmaTurinzaEditor
              id={id}
              campo="aproboTurinza"
              titulo="Aprobó Turinza"
              valorInicial={data.aprobaciones.aproboTurinza}
            />
          </div>
        </Tarea>
      </div>
    </section>
  );
}
