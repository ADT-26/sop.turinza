"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import type { SopResumen } from "@/lib/sopStore";
import type { DashboardRole } from "@/proxy";
import { EliminarSopButton } from "@/components/dashboard/EliminarSopButton";
import { EquipoTurinzaEditor } from "@/components/dashboard/EquipoTurinzaEditor";
import { ConfigDocumentoEditor } from "@/components/dashboard/ConfigDocumentoEditor";
import { ClientesEditor } from "@/components/dashboard/ClientesEditor";
import type { ClientesSubTab } from "@/components/dashboard/ClientesEditor";

type View =
  | "sops"
  | "equipo"
  | "config"
  | "clientes_relaciones"
  | "clientes_lista"
  | "clientes_comerciales"
  | "clientes_grupos"
  | "clientes_burbujas";

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IconSOPs() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
    </svg>
  );
}

function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <circle cx="12" cy="5" r="2" />
      <path d="M14.5 13.5c0-2-1.2-3.7-3-4.3" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.76 3.76l1.06 1.06M11.18 11.18l1.06 1.06M3.76 12.24l1.06-1.06M11.18 4.82l1.06-1.06" />
    </svg>
  );
}

function IconClients() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4.5" width="12" height="9.5" rx="1.5" />
      <path d="M5.5 4.5V3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v1M2 8.5h12" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms ease" }}
    >
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M2 5h14M2 9h14M2 13h14" />
    </svg>
  );
}

function IconArrow({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 250ms ease" }}
    >
      <path d="M9 3L5 7l4 4" />
    </svg>
  );
}

// ── Sidebar component ─────────────────────────────────────────────────────────

type NavLeaf = { kind: "leaf"; view: View; label: string; icon: React.ReactNode };
type NavGroup = {
  kind: "group";
  key: string;
  label: string;
  icon: React.ReactNode;
  children: { view: View; label: string }[];
};
type NavItem = NavLeaf | NavGroup;

function Sidebar({
  view,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  sopCount,
  role,
}: {
  view: View;
  onNavigate: (v: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  sopCount: number;
  role: DashboardRole;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (view.startsWith("clientes_")) s.add("clientes");
    if (view === "equipo") s.add("comerciales");
    return s;
  });

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function navigate(v: View) {
    onNavigate(v);
    onCloseMobile();
  }

  const isActive = (v: View) => view === v;
  const isGroupActive = (children: { view: View }[]) => children.some((c) => c.view === view);

  const allNavItems: NavItem[] = [
    { kind: "leaf", view: "sops", label: "SOPs recibidos", icon: <IconSOPs /> },
    {
      kind: "group", key: "comerciales", label: "Gestión comerciales", icon: <IconTeam />,
      children: [{ view: "equipo", label: "Equipo Turinza" }],
    },
    { kind: "leaf", view: "config", label: "Datos generales", icon: <IconSettings /> },
    {
      kind: "group", key: "clientes", label: "Clientes", icon: <IconClients />,
      children: [
        { view: "clientes_relaciones", label: "Relaciones" },
        { view: "clientes_lista", label: "Catálogo" },
        { view: "clientes_comerciales", label: "Comerciales" },
        { view: "clientes_grupos", label: "Grupos" },
        { view: "clientes_burbujas", label: "Burbujas" },
      ],
    },
  ];

  // Viewer solo puede acceder a SOPs recibidos
  const navItems: NavItem[] = role === "admin"
    ? allNavItems
    : allNavItems.slice(0, 1);

  const sidebarBody = (
    <div className="flex flex-1 flex-col bg-navy">
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-accent">
          <span className="text-sm font-bold leading-none text-white">T</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-white">Turinza</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Panel interno</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          if (item.kind === "leaf") {
            const active = isActive(item.view);
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                title={collapsed ? item.label : undefined}
                className={[
                  "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/[0.07] hover:text-white/80",
                ].join(" ")}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-accent"
                    aria-hidden="true"
                  />
                )}
                <span className="ml-px flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                    {item.view === "sops" && sopCount > 0 && (
                      <span className="rounded-full bg-accent px-1.5 py-px font-mono text-[10px] font-bold leading-none text-white">
                        {sopCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          }

          // Group
          const groupActive = isGroupActive(item.children);
          const open = openGroups.has(item.key);

          return (
            <div key={item.key}>
              <button
                onClick={() => {
                  if (collapsed) {
                    navigate(item.children[0].view);
                  } else {
                    toggleGroup(item.key);
                  }
                }}
                title={collapsed ? item.label : undefined}
                className={[
                  "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-150",
                  groupActive && !open
                    ? "bg-white/10 text-white"
                    : groupActive
                    ? "text-white/80"
                    : "text-white/55 hover:bg-white/[0.07] hover:text-white/80",
                ].join(" ")}
              >
                {groupActive && !open && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-accent"
                    aria-hidden="true"
                  />
                )}
                <span className="ml-px flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                    <span className="text-white/30">
                      <IconChevron open={open} />
                    </span>
                  </>
                )}
              </button>

              {!collapsed && open && (
                <div
                  className="mb-1 ml-4 mt-0.5 space-y-0.5 pl-3"
                  style={{ borderLeft: "1px solid rgba(255,255,255,0.10)" }}
                >
                  {item.children.map((child) => {
                    const childActive = isActive(child.view);
                    return (
                      <button
                        key={child.view}
                        onClick={() => navigate(child.view)}
                        className={[
                          "relative flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-all duration-150",
                          childActive
                            ? "bg-white/10 text-white"
                            : "text-white/45 hover:bg-white/[0.07] hover:text-white/70",
                        ].join(" ")}
                      >
                        {childActive && (
                          <span
                            className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate text-[13px] font-medium">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse toggle — solo para admin */}
      {role === "admin" && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="px-2 py-3">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-white/30 transition-all duration-150 hover:bg-white/[0.07] hover:text-white/60"
          >
            <span className="ml-px flex-shrink-0">
              <IconArrow collapsed={collapsed} />
            </span>
            {!collapsed && <span className="text-xs font-medium">Contraer</span>}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile sidebar (overlay) */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-56 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {sidebarBody}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden flex-col flex-shrink-0 transition-all duration-200 ease-in-out lg:flex",
          collapsed ? "w-[52px]" : "w-[220px]",
        ].join(" ")}
      >
        {sidebarBody}
      </aside>
    </>
  );
}

// ── PendienteDot ──────────────────────────────────────────────────────────────

function PendienteDot({ sop }: { sop: SopResumen }) {
  if (sop.nivelCliente) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent"
      title="Falta asignar el Nivel Cliente"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      Pendiente
    </span>
  );
}

// ── SOPs panel ────────────────────────────────────────────────────────────────

function PanelSops({ sops, error }: { sops: SopResumen[]; error: string | null }) {
  if (error) {
    return (
      <p className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-sm text-accent">{error}</p>
    );
  }
  if (sops.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-sm text-ink-muted">
        Todavía no hay SOPs guardados.
      </p>
    );
  }
  return (
    <>
      {/* Cards: narrow screens */}
      <ul className="space-y-3 md:hidden">
        {sops.map((sop) => (
          <li key={sop.id} className="rounded-md border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/dashboard/${sop.id}`} className="font-semibold text-navy hover:underline">
                {sop.cliente}
              </Link>
              <div className="flex items-center gap-2">
                <PendienteDot sop={sop} />
                <Badge>{sop.estado}</Badge>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-muted">
              <div><dt className="text-[10px] uppercase">NIT</dt><dd className="font-mono text-ink">{sop.nit}</dd></div>
              <div><dt className="text-[10px] uppercase">Tipo operación</dt><dd className="text-ink">{sop.tipoOperacion}</dd></div>
              <div><dt className="text-[10px] uppercase">Nivel</dt><dd className="text-ink">{sop.nivelCliente}</dd></div>
              <div><dt className="text-[10px] uppercase">Fecha</dt><dd className="font-mono text-ink">{new Date(sop.createdAt).toLocaleString("es-CO")}</dd></div>
            </dl>
            <div className="mt-3 border-t border-line pt-3">
              <EliminarSopButton id={sop.id} cliente={sop.cliente} />
            </div>
          </li>
        ))}
      </ul>

      {/* Table: medium screens + */}
      <div className="hidden overflow-hidden rounded-lg border border-line bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy font-mono text-[11px] uppercase tracking-wide text-white/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">NIT</th>
              <th className="px-4 py-3 font-semibold">Tipo operación</th>
              <th className="px-4 py-3 font-semibold">Nivel</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sops.map((sop) => (
              <tr key={sop.id} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/${sop.id}`} className="font-semibold text-navy hover:underline">
                    {sop.cliente}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">{sop.nit}</td>
                <td className="px-4 py-3 text-ink-muted">{sop.tipoOperacion}</td>
                <td className="px-4 py-3 text-ink-muted">{sop.nivelCliente || <PendienteDot sop={sop} />}</td>
                <td className="px-4 py-3"><Badge>{sop.estado}</Badge></td>
                <td className="px-4 py-3 font-mono text-ink-muted">{new Date(sop.createdAt).toLocaleString("es-CO")}</td>
                <td className="px-4 py-3"><EliminarSopButton id={sop.id} cliente={sop.cliente} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── View metadata ─────────────────────────────────────────────────────────────

const VIEW_META: Record<View, { label: string; subtitle: string }> = {
  sops:                 { label: "SOPs recibidos",              subtitle: "Formularios enviados por el equipo comercial" },
  equipo:               { label: "Equipo Turinza",              subtitle: "Gestión comerciales · Directorio interno" },
  config:               { label: "Datos generales",             subtitle: "Código, versión y vigencia del documento SOP" },
  clientes_relaciones:  { label: "Relaciones cliente / comercial", subtitle: "Vínculos entre clientes, comerciales, grupos y burbujas" },
  clientes_lista:       { label: "Catálogo de clientes",        subtitle: "Razón social y NIT" },
  clientes_comerciales: { label: "Comerciales",                 subtitle: "Equipo de ventas y ejecutivos de cuenta" },
  clientes_grupos:      { label: "Grupos empresariales",        subtitle: "Agrupaciones de clientes" },
  clientes_burbujas:    { label: "Burbujas operativas",         subtitle: "Unidades de operación" },
};

const CLIENTES_VIEW_MAP: Partial<Record<View, ClientesSubTab>> = {
  clientes_relaciones:  "relaciones",
  clientes_lista:       "clientes",
  clientes_comerciales: "comerciales",
  clientes_grupos:      "grupos",
  clientes_burbujas:    "burbujas",
};

// ── Main ──────────────────────────────────────────────────────────────────────

export function DashboardTabs({
  sops,
  error,
  role,
}: {
  sops: SopResumen[];
  error: string | null;
  role: DashboardRole;
}) {
  const [view, setView] = useState<View>("sops");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Viewer solo puede ver SOPs — protección adicional en cliente
  const safeView: View = role === "viewer" ? "sops" : view;
  const meta = VIEW_META[safeView];
  const clientesSubTab = CLIENTES_VIEW_MAP[safeView];

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        view={safeView}
        onNavigate={role === "admin" ? setView : () => {}}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        sopCount={sops.length}
        role={role}
      />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#EEF1F6]">
        {/* Topbar */}
        <div className="flex items-center gap-3 border-b border-line/60 bg-white px-5 py-3.5">
          {role === "admin" && (
            <button
              className="flex-shrink-0 rounded-md p-1.5 text-ink-muted hover:bg-surface hover:text-navy lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <IconMenu />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold leading-tight text-navy">{meta.label}</h2>
            <p className="truncate text-xs text-ink-muted">{meta.subtitle}</p>
          </div>
          {safeView === "sops" && (
            <span className="flex-shrink-0 rounded-full bg-navy/8 px-2.5 py-0.5 font-mono text-xs font-semibold text-navy/70">
              {sops.length} registro{sops.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Panel */}
        <div className="flex-1 overflow-auto p-5">
          {safeView === "sops" && <PanelSops sops={sops} error={error} />}
          {safeView === "equipo" && <EquipoTurinzaEditor />}
          {safeView === "config" && <ConfigDocumentoEditor />}
          {clientesSubTab && <ClientesEditor subTab={clientesSubTab} />}
        </div>
      </div>
    </div>
  );
}
