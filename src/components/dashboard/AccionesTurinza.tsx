import type { ReactNode } from "react";
import { NivelClienteEditor } from "./NivelClienteEditor";
import { FirmaTurinzaEditor } from "./FirmaTurinzaEditor";
import { ContactosInternosEditor } from "./ContactosInternosEditor";
import { AsistentesReunionEditor } from "./AsistentesReunionEditor";
import { InstructivoOdooEditor } from "./InstructivoOdooEditor";
import type { SopFormValues } from "@/lib/schemas";

function Tarea({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line border-l-4 border-l-accent bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-line/60 bg-accent/[0.03] px-4 py-2.5">
        <span className="font-mono text-xs font-bold tabular-nums text-accent">
          {String(numero).padStart(2, "0")}
        </span>
        <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

export function AccionesTurinza({ id, data }: { id: string; data: SopFormValues }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line shadow-sm">
      <header className="bg-primary-dark px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Turinza · Por completar
            </p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight text-white">Pendientes por diligenciar</h2>
          </div>
          <span className="shrink-0 rounded-full border border-accent/40 bg-accent/20 px-3 py-1 font-mono text-xs font-semibold text-white/80">
            5 tareas
          </span>
        </div>
        <p className="mt-2 text-sm text-white/55">
          Estos campos no los llena el cliente — los completa Turinza al revisar el SOP recibido.
        </p>
      </header>

      <div className="space-y-3 bg-[#EEF1F6] p-4">
        <Tarea numero={1} titulo="Nivel Cliente">
          <NivelClienteEditor id={id} valorInicial={data.resumenEjecutivo.nivelCliente} />
        </Tarea>
        <Tarea numero={2} titulo="Asistentes reunión operativa">
          <AsistentesReunionEditor id={id} valorInicial={data.resumenEjecutivo.asistentesReunionOperativa} />
        </Tarea>
        <Tarea numero={3} titulo="Instructivo Odoo para el cliente">
          <InstructivoOdooEditor id={id} valorInicial={data.preferencias.trazabilidad.instructivoOdooCliente} />
        </Tarea>
        <Tarea numero={4} titulo="Contactos internos Turinza / Cuenta">
          <ContactosInternosEditor id={id} valorInicial={data.contactos.internos} />
        </Tarea>
        <Tarea numero={5} titulo="Revisó / Aprobó Turinza">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FirmaTurinzaEditor id={id} campo="revisoTurinzaComercial" titulo="Revisó Turinza (Comercial)" valorInicial={data.aprobaciones.revisoTurinzaComercial} />
            <FirmaTurinzaEditor id={id} campo="revisoTurinza" titulo="Revisó Turinza (Operación)" valorInicial={data.aprobaciones.revisoTurinza} />
            <FirmaTurinzaEditor id={id} campo="aproboTurinza" titulo="Aprobó Turinza" valorInicial={data.aprobaciones.aproboTurinza} />
          </div>
        </Tarea>
      </div>
    </section>
  );
}
