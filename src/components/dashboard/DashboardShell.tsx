"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DashboardRole } from "@/proxy";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSOPs() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l3.5-4 3 2.5L12 5l2 2.5" />
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
    </svg>
  );
}
function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <circle cx="12" cy="5" r="2" />
      <path d="M14.5 13.5c0-2.2-1.3-4-3-4.5" />
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
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms ease" }}>
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
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 250ms ease" }}>
      <path d="M9 3L5 7l4 4" />
    </svg>
  );
}

// ── Nav structure ─────────────────────────────────────────────────────────────

// s= query param values used for navigation
export type SectionParam =
  | "sops"
  | "indicadores"
  | "equipo"
  | "config"
  | "clientes_relaciones"
  | "clientes_lista"
  | "clientes_comerciales"
  | "clientes_grupos"
  | "clientes_burbujas";

type NavLeaf = { kind: "leaf"; s: SectionParam; label: string; icon: React.ReactNode };
type NavGroup = { kind: "group"; key: string; label: string; icon: React.ReactNode; children: { s: SectionParam; label: string }[] };
type NavItem = NavLeaf | NavGroup;

const ALL_NAV: NavItem[] = [
  { kind: "leaf", s: "sops", label: "SOPs recibidos", icon: <IconSOPs /> },
  { kind: "leaf", s: "indicadores", label: "Indicadores", icon: <IconChart /> },
  {
    kind: "group", key: "comerciales", label: "Gestión comerciales", icon: <IconTeam />,
    children: [{ s: "equipo", label: "Equipo Turinza" }],
  },
  { kind: "leaf", s: "config", label: "Datos generales", icon: <IconSettings /> },
  {
    kind: "group", key: "clientes", label: "Clientes", icon: <IconClients />,
    children: [
      { s: "clientes_relaciones", label: "Relaciones" },
      { s: "clientes_lista", label: "Catálogo" },
      { s: "clientes_comerciales", label: "Comerciales" },
      { s: "clientes_grupos", label: "Grupos" },
      { s: "clientes_burbujas", label: "Burbujas" },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  role,
  active,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  role: DashboardRole;
  active: SectionParam;
  onNavigate: (s: SectionParam) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (active.startsWith("clientes_")) s.add("clientes");
    if (active === "equipo") s.add("comerciales");
    return s;
  });

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function navigate(s: SectionParam) {
    onNavigate(s);
    onCloseMobile();
  }

  const isActive = (s: SectionParam) => active === s;
  const isGroupActive = (children: { s: SectionParam }[]) => children.some((c) => c.s === active);

  const navItems: NavItem[] = role === "admin" ? ALL_NAV : ALL_NAV.slice(0, 1);

  const body = (
    <div className="flex flex-1 flex-col" style={{ background: "#004F78" }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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

      {/* Nav items */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          if (item.kind === "leaf") {
            const act = isActive(item.s);
            return (
              <button key={item.s} onClick={() => navigate(item.s)} title={collapsed ? item.label : undefined}
                className={["group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-150",
                  act ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.10] hover:text-white/90"].join(" ")}>
                {act && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" aria-hidden="true" />}
                <span className="ml-px flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="flex-1 truncate text-sm font-medium">{item.label}</span>}
              </button>
            );
          }
          const grpAct = isGroupActive(item.children);
          const open = openGroups.has(item.key);
          return (
            <div key={item.key}>
              <button
                onClick={() => collapsed ? navigate(item.children[0].s) : toggleGroup(item.key)}
                title={collapsed ? item.label : undefined}
                className={["group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-150",
                  grpAct && !open ? "bg-white/10 text-white" : grpAct ? "text-white/80" : "text-white/55 hover:bg-white/[0.10] hover:text-white/90"].join(" ")}>
                {grpAct && !open && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" aria-hidden="true" />}
                <span className="ml-px flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                    <span className="text-white/30"><IconChevron open={open} /></span>
                  </>
                )}
              </button>
              {!collapsed && open && (
                <div className="mb-1 ml-4 mt-0.5 space-y-0.5 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.10)" }}>
                  {item.children.map((child) => {
                    const childAct = isActive(child.s);
                    return (
                      <button key={child.s} onClick={() => navigate(child.s)}
                        className={["relative flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-all duration-150",
                          childAct ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/[0.10] hover:text-white/70"].join(" ")}>
                        {childAct && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-primary" aria-hidden="true" />}
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

      {/* Collapse toggle (admin only) */}
      {role === "admin" && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="px-2 py-3">
          <button onClick={onToggleCollapse} title={collapsed ? "Expandir menú" : "Contraer menú"}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-white/35 transition-all duration-150 hover:bg-white/[0.10] hover:text-white/70">
            <span className="ml-px flex-shrink-0"><IconArrow collapsed={collapsed} /></span>
            {!collapsed && <span className="text-xs font-medium">Contraer</span>}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onCloseMobile} />}
      {/* Mobile sidebar */}
      <aside className={["fixed inset-y-0 left-0 z-30 w-56 transition-transform duration-200 lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full"].join(" ")}>
        {body}
      </aside>
      {/* Desktop sidebar */}
      <aside className={["hidden flex-col flex-shrink-0 transition-all duration-200 ease-in-out lg:flex", collapsed ? "w-[52px]" : "w-[220px]"].join(" ")}>
        {body}
      </aside>
    </>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function ShellInner({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // On sub-pages (/dashboard/[id]) always show "sops" as active
  const isSubPage = pathname !== "/dashboard";
  const section = (isSubPage ? "sops" : (searchParams.get("s") ?? "sops")) as SectionParam;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function navigate(s: SectionParam) {
    const url = s === "sops" ? "/dashboard" : `/dashboard?s=${s}`;
    router.push(url);
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        role={role}
        active={section}
        onNavigate={navigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        {/* Mobile hamburger topbar */}
        <div className="flex items-center gap-2 border-b border-line/60 bg-white px-4 py-2.5 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface hover:text-navy"
          >
            <IconMenu />
          </button>
          <span className="text-sm font-semibold text-navy">Panel interno</span>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  return <ShellInner role={role}>{children}</ShellInner>;
}
