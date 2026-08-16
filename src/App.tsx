import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

import { useState } from 'react';
import { mockAudits, mockFindings } from './services/audit.service';
import {
  formatAuditStatus,
  formatRiskLevel,
} from './lib/utils';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalFindings = mockAudits.reduce(
    (total, audit) => total + audit.findings,
    0
  );

  const criticalFindings = mockAudits.reduce(
    (total, audit) => total + audit.criticalFindings,
    0
  );

  const completedAudits = mockAudits.filter(
    (audit) => audit.status === 'completed'
  ).length;

  const averageProgress = Math.round(
    mockAudits.reduce((total, audit) => total + audit.progress, 0) /
      mockAudits.length
  );

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: true,
    },
    {
      label: 'Auditorías',
      icon: ClipboardCheck,
    },
    {
      label: 'Hallazgos',
      icon: FileSearch,
    },
    {
      label: 'Riesgos',
      icon: ShieldAlert,
    },
    {
      label: 'Transacciones',
      icon: BarChart3,
    },
    {
      label: 'Reportes',
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10',
          'bg-[#091522] transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg shadow-blue-950/30">
                <ShieldCheck className="h-5 w-5 text-[#c9a227]" />
              </div>

              <div>
                <div className="font-black tracking-wide text-white">
                  SUAREZ
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  AI Audit
                </div>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Plataforma
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                    item.active
                      ? 'bg-[#1e3a5f]/70 text-white shadow-inner'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-[18px] w-[18px]',
                      item.active ? 'text-[#c9a227]' : '',
                    ].join(' ')}
                  />

                  <span>{item.label}</span>

                  {item.active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Security status */}
          <div className="border-t border-white/10 p-5">
            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-xs font-bold text-emerald-300">
                  Sistema operativo
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Motor de auditoría y análisis funcionando correctamente.
              </p>
            </div>

            <div className="mt-5 text-center text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Suarez AI Audit v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#07111f]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                Executive Control Center
              </div>

              <h1 className="mt-1 text-lg font-bold text-white sm:text-xl">
                Auditoría Inteligente
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
            </button>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] text-sm font-black text-[#c9a227] sm:flex">
              JS
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          {/* Welcome */}
          <section className="mb-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-slate-500">
                  Domingo, 16 de agosto de 2026
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Panel ejecutivo
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Visión consolidada del estado de auditorías, riesgos y
                  hallazgos detectados por la plataforma.
                </p>
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-bold text-[#07111f] shadow-lg shadow-yellow-950/20 transition hover:bg-[#d8b43c]">
                <ClipboardCheck className="h-4 w-4" />
                Nueva auditoría
              </button>
            </div>
          </section>

          {/* KPI cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Auditorías activas"
              value={String(mockAudits.length)}
              description={`${completedAudits} completada`}
              icon={ClipboardCheck}
              trend="+12%"
              positive
            />

            <KpiCard
              title="Hallazgos"
              value={String(totalFindings)}
              description="Detectados actualmente"
              icon={FileSearch}
              trend="+8%"
            />

            <KpiCard
              title="Riesgos críticos"
              value={String(criticalFindings)}
              description="Requieren atención"
              icon={AlertTriangle}
              trend="Prioridad"
              danger
            />

            <KpiCard
              title="Progreso global"
              value={`${averageProgress}%`}
              description="Avance de auditorías"
              icon={TrendingUp}
              trend="+5.4%"
              positive
            />
          </section>

          {/* Main grid */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Audits */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h3 className="font-bold text-white">
                    Auditorías recientes
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Actividad de los últimos procesos
                  </p>
                </div>

                <button className="text-xs font-bold text-[#c9a227] hover:text-[#e1c45a]">
                  Ver todas
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {mockAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="group p-5 transition hover:bg-white/[0.025]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-600">
                            {audit.id}
                          </span>

                          <RiskBadge level={audit.riskLevel} />
                        </div>

                        <h4 className="mt-2 truncate font-bold text-white">
                          {audit.name}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {audit.organization} · {audit.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="min-w-[130px]">
                          <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-600">Progreso</span>
                            <span className="text-slate-300">
                              {audit.progress}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-[#c9a227] transition-all"
                              style={{ width: `${audit.progress}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight className="hidden h-4 w-4 text-slate-700 transition group-hover:text-[#c9a227] sm:block" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-medium text-slate-500">
                      <span>
                        Estado:{' '}
                        <strong className="text-slate-300">
                          {formatAuditStatus(audit.status)}
                        </strong>
                      </span>

                      <span>
                        Hallazgos:{' '}
                        <strong className="text-slate-300">
                          {audit.findings}
                        </strong>
                      </span>

                      <span>
                        Críticos:{' '}
                        <strong className="text-red-400">
                          {audit.criticalFindings}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk distribution */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1928]">
              <div className="border-b border-white/10 p-6">
                <h3 className="font-bold text-white">
                  Distribución de riesgo
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Clasificación actual de hallazgos
                </p>
              </div>

              <div className="space-y-5 p-6">
                <RiskBar
                  label="Crítico"
                  count={criticalFindings}
                  total={totalFindings}
                  color="bg-red-500"
                />

                <RiskBar
                  label="Alto"
                  count={5}
                  total={totalFindings}
                  color="bg-orange-500"
                />

                <RiskBar
                  label="Medio"
                  count={5}
                  total={totalFindings}
                  color="bg-[#c9a227]"
                />

                <RiskBar
                  label="Bajo"
                  count={1}
                  total={totalFindings}
                  color="bg-emerald-500"
                />
              </div>

              <div className="mx-6 mb-6 rounded-xl border border-[#c9a227]/10 bg-[#c9a227]/5 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />

                  <div>
                    <p className="text-xs font-bold text-white">
                      Análisis inteligente activo
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      La plataforma prioriza automáticamente los hallazgos
                      según impacto y nivel de exposición.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Findings */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b1928]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-white">
                  Hallazgos prioritarios
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Elementos que requieren revisión
                </p>
              </div>

              <button className="inline-flex items-center gap-2 self-start text-xs font-bold text-[#c9a227]">
                Ver centro de hallazgos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {mockFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="grid gap-4 p-5 transition hover:bg-white/[0.025] md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-600">
                        {finding.id}
                      </span>

                      <RiskBadge level={finding.riskLevel} />

                      <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        {finding.category}
                      </span>
                    </div>

                    <h4 className="mt-3 font-bold text-white">
                      {finding.title}
                    </h4>

                    <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                      {finding.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 md:text-right">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Score
                      </div>

                      <div className="mt-1 text-xl font-black text-white">
                        {finding.score}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Estado
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-300">
                        {finding.status === 'open' ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
                        )}

                        {finding.status === 'open'
                          ? 'Abierto'
                          : 'Investigando'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              SUAREZ AI AUDIT · Plataforma inteligente de auditoría y riesgo
            </span>

            <span>© 2026 Suarez Consulting</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  positive,
  danger,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof ClipboardCheck;
  trend: string;
  positive?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-[#0b1928] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon
            className={[
              'h-5 w-5',
              danger
                ? 'text-red-400'
                : positive
                  ? 'text-emerald-400'
                  : 'text-[#c9a227]',
            ].join(' ')}
          />
        </div>

        <span
          className={[
            'rounded-full px-2 py-1 text-[9px] font-bold',
            danger
              ? 'bg-red-400/10 text-red-300'
              : positive
                ? 'bg-emerald-400/10 text-emerald-300'
                : 'bg-white/5 text-slate-400',
          ].join(' ')}
        >
          {trend}
        </span>
      </div>

      <div className="mt-5">
        <div className="text-3xl font-black tracking-tight text-white">
          {value}
        </div>

        <div className="mt-1 text-sm font-semibold text-slate-300">
          {title}
        </div>

        <div className="mt-1 text-[10px] text-slate-600">
          {description}
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: 'border-red-400/20 bg-red-400/10 text-red-300',
    high: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
    medium: 'border-[#c9a227]/20 bg-[#c9a227]/10 text-[#d8b43c]',
    low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${styles[level]}`}
    >
      {formatRiskLevel(level)}
    </span>
  );
}

function RiskBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-500">
          {count} · {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default App;
