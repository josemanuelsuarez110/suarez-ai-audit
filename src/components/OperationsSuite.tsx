import {
  useMemo,
  useState,
} from 'react'

type AuditItem = {
  id: string
  auditCode?: string
  name: string
  organization?: string
  status?: string
  riskLevel?: string
  progress?: number
  updatedAt?: string
  startedAt?: string
}

type FindingItem = {
  id: string
  findingCode?: string
  title: string
  category?: string
  riskLevel?: string
  status?: string
  score?: number
  createdAt?: string
}

type TransactionItem = {
  id: string
  transactionCode?: string
  description: string
  amount: number
  currency: string
  status: string
  anomalyScore?: number | null
  isAnomaly: boolean
  transactionDate?: string
  createdAt?: string
  updatedAt?: string
}

type OrganizationItem = {
  id: string
  name: string
}

interface OperationsSuiteProps {
  audits: AuditItem[]
  findings: FindingItem[]
  transactions: TransactionItem[]
  organizations: OrganizationItem[]
  role: string | null
}

type Panel =
  | 'search'
  | 'activity'
  | 'export'
  | 'health'
  | null

type SearchResult = {
  key: string
  type: string
  code: string
  title: string
  detail: string
  severity?: string
}

function csvEscape(
  value: unknown
): string {
  const text =
    value === null ||
    value === undefined
      ? ''
      : String(value)

  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][]
) {
  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) =>
      row.map(csvEscape).join(',')
    ),
  ].join('\n')

  const blob = new Blob(
    ['\ufeff', csv],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )

  const url =
    URL.createObjectURL(blob)

  const anchor =
    document.createElement('a')

  anchor.href = url
  anchor.download = filename

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

function formatDate(
  value?: string
): string {
  if (!value) return '—'

  const date = new Date(value)

  if (
    Number.isNaN(date.getTime())
  ) {
    return '—'
  }

  return date.toLocaleString(
    'es-DO'
  )
}

export function OperationsSuite({
  audits,
  findings,
  transactions,
  organizations,
  role,
}: OperationsSuiteProps) {
  const [panel, setPanel] =
    useState<Panel>(null)

  const [query, setQuery] =
    useState('')

  const searchResults =
    useMemo<SearchResult[]>(
      () => {
        const normalized =
          query
            .trim()
            .toLowerCase()

        if (!normalized) {
          return []
        }

        const results:
          SearchResult[] = []

        audits.forEach((audit) => {
          const searchable = [
            audit.auditCode,
            audit.name,
            audit.organization,
            audit.status,
            audit.riskLevel,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (
            searchable.includes(
              normalized
            )
          ) {
            results.push({
              key: `audit-${audit.id}`,
              type: 'Auditoría',
              code:
                audit.auditCode ??
                audit.id,
              title: audit.name,
              detail:
                `${audit.organization ?? 'Sin organización'} · ${audit.status ?? 'Sin estado'}`,
              severity:
                audit.riskLevel,
            })
          }
        })

        findings.forEach(
          (finding) => {
            const searchable = [
              finding.findingCode,
              finding.title,
              finding.category,
              finding.status,
              finding.riskLevel,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()

            if (
              searchable.includes(
                normalized
              )
            ) {
              results.push({
                key:
                  `finding-${finding.id}`,
                type: 'Hallazgo',
                code:
                  finding.findingCode ??
                  finding.id,
                title:
                  finding.title,
                detail:
                  `${finding.category ?? 'Sin categoría'} · Score ${finding.score ?? 0}`,
                severity:
                  finding.riskLevel,
              })
            }
          }
        )

        transactions.forEach(
          (transaction) => {
            const searchable = [
              transaction.transactionCode,
              transaction.description,
              transaction.status,
              transaction.currency,
              transaction.anomalyScore,
            ]
              .filter(
                (value) =>
                  value !== null &&
                  value !== undefined
              )
              .join(' ')
              .toLowerCase()

            if (
              searchable.includes(
                normalized
              )
            ) {
              results.push({
                key:
                  `transaction-${transaction.id}`,
                type:
                  'Transacción',
                code:
                  transaction.transactionCode ??
                  transaction.id,
                title:
                  transaction.description,
                detail:
                  `${transaction.amount.toLocaleString('es-DO')} ${transaction.currency} · ${transaction.status}`,
                severity:
                  transaction.isAnomaly
                    ? 'critical'
                    : undefined,
              })
            }
          }
        )

        organizations.forEach(
          (organization) => {
            if (
              organization.name
                .toLowerCase()
                .includes(normalized)
            ) {
              results.push({
                key:
                  `organization-${organization.id}`,
                type:
                  'Organización',
                code:
                  organization.id,
                title:
                  organization.name,
                detail:
                  'Organización registrada',
              })
            }
          }
        )

        return results.slice(
          0,
          50
        )
      },
      [
        query,
        audits,
        findings,
        transactions,
        organizations,
      ]
    )

  const activities =
    useMemo(() => {
      const items: Array<{
        key: string
        type: string
        title: string
        detail: string
        date?: string
        critical?: boolean
      }> = []

      transactions.forEach(
        (transaction) => {
          items.push({
            key:
              `trx-${transaction.id}`,
            type:
              transaction.isAnomaly
                ? 'Alerta'
                : 'Transacción',
            title:
              transaction.transactionCode ??
              transaction.description,
            detail:
              transaction.isAnomaly
                ? `Anomalía · Score ${transaction.anomalyScore ?? 0}`
                : `${transaction.amount.toLocaleString('es-DO')} ${transaction.currency}`,
            date:
              transaction.updatedAt ??
              transaction.createdAt ??
              transaction.transactionDate,
            critical:
              transaction.isAnomaly,
          })
        }
      )

      findings.forEach(
        (finding) => {
          items.push({
            key:
              `finding-${finding.id}`,
            type: 'Hallazgo',
            title:
              finding.findingCode ??
              finding.title,
            detail:
              `${finding.title} · ${finding.riskLevel ?? 'sin riesgo'}`,
            date:
              finding.createdAt,
            critical:
              finding.riskLevel ===
              'critical',
          })
        }
      )

      audits.forEach(
        (audit) => {
          items.push({
            key:
              `audit-${audit.id}`,
            type: 'Auditoría',
            title:
              audit.auditCode ??
              audit.name,
            detail:
              `${audit.name} · ${audit.status ?? 'sin estado'}`,
            date:
              audit.updatedAt ??
              audit.startedAt,
            critical:
              audit.riskLevel ===
              'critical',
          })
        }
      )

      return items
        .sort((a, b) => {
          const aTime = a.date
            ? new Date(
                a.date
              ).getTime()
            : 0

          const bTime = b.date
            ? new Date(
                b.date
              ).getTime()
            : 0

          return bTime - aTime
        })
        .slice(0, 25)
    }, [
      audits,
      findings,
      transactions,
    ])

  const anomalies =
    transactions.filter(
      (item) =>
        item.isAnomaly
    )

  const criticalFindings =
    findings.filter(
      (item) =>
        item.riskLevel ===
        'critical'
    )

  const reviewedTransactions =
    transactions.filter(
      (item) =>
        [
          'reviewed',
          'approved',
          'rejected',
        ].includes(item.status)
    )

  const roleLabel =
    role === 'admin'
      ? 'Administrador'
      : role === 'auditor'
        ? 'Auditor'
        : 'Consulta'

  const healthItems = [
    {
      name: 'RBAC',
      status:
        role !== null,
      detail:
        role !== null
          ? roleLabel
          : 'Sin rol',
    },
    {
      name: 'Auditorías',
      status: true,
      detail:
        `${audits.length} cargadas`,
    },
    {
      name: 'Hallazgos',
      status: true,
      detail:
        `${findings.length} cargados`,
    },
    {
      name:
        'Motor transaccional',
      status: true,
      detail:
        `${transactions.length} operaciones`,
    },
    {
      name:
        'Detección anomalías',
      status: true,
      detail:
        `${anomalies.length} detectadas`,
    },
    {
      name:
        'Workflow revisión',
      status: true,
      detail:
        `${reviewedTransactions.length} procesadas`,
    },
  ]

  return (
    <>
      <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b1928] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              Operations Suite
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              Centro operativo
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Búsqueda, actividad, exportación y supervisión del sistema
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() =>
                setPanel('search')
              }
              className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-xs font-bold text-slate-300 transition hover:border-[#c9a227]/40 hover:text-white"
            >
              Buscar
            </button>

            <button
              type="button"
              onClick={() =>
                setPanel(
                  'activity'
                )
              }
              className="relative rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-xs font-bold text-slate-300 transition hover:border-[#c9a227]/40 hover:text-white"
            >
              Actividad

              {anomalies.length >
                0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-black text-white">
                  {
                    anomalies.length
                  }
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setPanel('export')
              }
              className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-xs font-bold text-slate-300 transition hover:border-[#c9a227]/40 hover:text-white"
            >
              Exportar
            </button>

            <button
              type="button"
              onClick={() =>
                setPanel('health')
              }
              className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-xs font-bold text-slate-300 transition hover:border-[#c9a227]/40 hover:text-white"
            >
              Sistema
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-[#07111f] p-4">
            <div className="text-2xl font-black text-white">
              {
                audits.length
              }
            </div>

            <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
              Auditorías
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#07111f] p-4">
            <div className="text-2xl font-black text-white">
              {
                findings.length
              }
            </div>

            <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
              Hallazgos
            </div>
          </div>

          <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4">
            <div className="text-2xl font-black text-red-300">
              {
                criticalFindings.length
              }
            </div>

            <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
              Críticos
            </div>
          </div>

          <div className="rounded-xl border border-[#c9a227]/10 bg-[#c9a227]/[0.03] p-4">
            <div className="text-2xl font-black text-[#e1c45a]">
              {
                anomalies.length
              }
            </div>

            <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
              Anomalías
            </div>
          </div>
        </div>
      </section>

      {panel && (
        <div className="fixed inset-0 z-[240] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1928] p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Operations Suite
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  {panel ===
                  'search'
                    ? 'Buscador global'
                    : panel ===
                        'activity'
                      ? 'Centro de actividad'
                      : panel ===
                          'export'
                        ? 'Exportación de datos'
                        : 'Salud del sistema'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPanel(null)
                  setQuery('')
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            {panel ===
              'search' && (
              <div className="p-6">
                <input
                  autoFocus
                  value={query}
                  onChange={(
                    event
                  ) =>
                    setQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Buscar código, auditoría, hallazgo, transacción, organización..."
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-5 py-4 text-sm text-white outline-none focus:border-[#c9a227]"
                />

                <div className="mt-5 space-y-3">
                  {searchResults.map(
                    (result) => (
                      <div
                        key={
                          result.key
                        }
                        className="rounded-xl border border-white/10 bg-[#07111f] p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase text-slate-500">
                            {
                              result.type
                            }
                          </span>

                          <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                            {
                              result.code
                            }
                          </span>

                          {result.severity ===
                            'critical' && (
                            <span className="rounded-full bg-red-400/10 px-2 py-1 text-[9px] font-bold uppercase text-red-300">
                              Crítico
                            </span>
                          )}
                        </div>

                        <div className="mt-2 font-bold text-white">
                          {
                            result.title
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {
                            result.detail
                          }
                        </div>
                      </div>
                    )
                  )}

                  {query &&
                    searchResults.length ===
                      0 && (
                      <div className="py-12 text-center text-sm text-slate-500">
                        No se encontraron resultados.
                      </div>
                    )}

                  {!query && (
                    <div className="py-12 text-center text-sm text-slate-500">
                      Escribe para buscar en toda la plataforma.
                    </div>
                  )}
                </div>
              </div>
            )}

            {panel ===
              'activity' && (
              <div className="p-6">
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-[#07111f] p-4">
                    <div className="text-xl font-black text-white">
                      {
                        activities.length
                      }
                    </div>
                    <div className="text-[9px] uppercase text-slate-600">
                      Actividades recientes
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4">
                    <div className="text-xl font-black text-red-300">
                      {
                        anomalies.length
                      }
                    </div>
                    <div className="text-[9px] uppercase text-slate-600">
                      Alertas
                    </div>
                  </div>

                  <div className="rounded-xl border border-orange-400/10 bg-orange-400/[0.03] p-4">
                    <div className="text-xl font-black text-orange-300">
                      {
                        criticalFindings.length
                      }
                    </div>
                    <div className="text-[9px] uppercase text-slate-600">
                      Hallazgos críticos
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/5 rounded-2xl border border-white/10">
                  {activities.map(
                    (activity) => (
                      <div
                        key={
                          activity.key
                        }
                        className="flex gap-4 p-4"
                      >
                        <div
                          className={[
                            'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                            activity.critical
                              ? 'bg-red-400'
                              : 'bg-[#c9a227]',
                          ].join(
                            ' '
                          )}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                              {
                                activity.type
                              }
                            </span>

                            {activity.critical && (
                              <span className="text-[9px] font-bold uppercase text-red-300">
                                Prioridad
                              </span>
                            )}
                          </div>

                          <div className="mt-1 font-bold text-white">
                            {
                              activity.title
                            }
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {
                              activity.detail
                            }
                          </div>

                          <div className="mt-2 text-[9px] text-slate-600">
                            {formatDate(
                              activity.date
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {panel ===
              'export' && (
              <div className="grid gap-4 p-6 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'auditorias.csv',
                      [
                        'Código',
                        'Nombre',
                        'Organización',
                        'Estado',
                        'Riesgo',
                        'Progreso',
                      ],
                      audits.map(
                        (audit) => [
                          audit.auditCode ??
                            '',
                          audit.name,
                          audit.organization ??
                            '',
                          audit.status ??
                            '',
                          audit.riskLevel ??
                            '',
                          audit.progress ??
                            0,
                        ]
                      )
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#07111f] p-6 text-left transition hover:border-[#c9a227]/40"
                >
                  <div className="text-lg font-black text-white">
                    Auditorías
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    {
                      audits.length
                    } registros
                  </div>

                  <div className="mt-6 text-xs font-bold text-[#c9a227]">
                    Descargar CSV
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'hallazgos.csv',
                      [
                        'Código',
                        'Título',
                        'Categoría',
                        'Riesgo',
                        'Estado',
                        'Score',
                      ],
                      findings.map(
                        (
                          finding
                        ) => [
                          finding.findingCode ??
                            '',
                          finding.title,
                          finding.category ??
                            '',
                          finding.riskLevel ??
                            '',
                          finding.status ??
                            '',
                          finding.score ??
                            0,
                        ]
                      )
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#07111f] p-6 text-left transition hover:border-[#c9a227]/40"
                >
                  <div className="text-lg font-black text-white">
                    Hallazgos
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    {
                      findings.length
                    } registros
                  </div>

                  <div className="mt-6 text-xs font-bold text-[#c9a227]">
                    Descargar CSV
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'transacciones.csv',
                      [
                        'Código',
                        'Descripción',
                        'Monto',
                        'Moneda',
                        'Estado',
                        'Anomaly Score',
                        'Anomalía',
                        'Fecha',
                      ],
                      transactions.map(
                        (
                          transaction
                        ) => [
                          transaction.transactionCode ??
                            '',
                          transaction.description,
                          transaction.amount,
                          transaction.currency,
                          transaction.status,
                          transaction.anomalyScore ??
                            0,
                          transaction.isAnomaly
                            ? 'Sí'
                            : 'No',
                          transaction.transactionDate ??
                            '',
                        ]
                      )
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#07111f] p-6 text-left transition hover:border-[#c9a227]/40"
                >
                  <div className="text-lg font-black text-white">
                    Transacciones
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    {
                      transactions.length
                    } registros
                  </div>

                  <div className="mt-6 text-xs font-bold text-[#c9a227]">
                    Descargar CSV
                  </div>
                </button>
              </div>
            )}

            {panel ===
              'health' && (
              <div className="p-6">
                <div className="mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.03] p-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Operational Status
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    Sistema operativo
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Rol actual: {
                      roleLabel
                    }
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {healthItems.map(
                    (item) => (
                      <div
                        key={
                          item.name
                        }
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07111f] p-4"
                      >
                        <div>
                          <div className="font-bold text-white">
                            {
                              item.name
                            }
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {
                              item.detail
                            }
                          </div>
                        </div>

                        <div
                          className={[
                            'rounded-full px-3 py-1 text-[9px] font-black uppercase',
                            item.status
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-red-400/10 text-red-300',
                          ].join(
                            ' '
                          )}
                        >
                          {item.status
                            ? 'OK'
                            : 'Error'}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
