import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  deleteConsolidationRecord,
  getConsolidationRecords,
  recordMatches,
  updateConsolidationRecord,
} from '../services/consolidation.service'

import type {
  ConsolidationRecord,
  ConsolidationTable,
} from '../services/consolidation.service'

import {
  formatPlatformDate,
  labelPriority,
  labelStatus,
} from '../lib/platform-utils'

interface Props {
  canWrite: boolean
  canDelete: boolean
}

const tableLabels:
Record<ConsolidationTable, string> = {
  audit_evidence:
    'Evidencias',

  remediation_plans:
    'Remediación',

  audit_tasks:
    'Tareas',

  compliance_controls:
    'Compliance',

  enterprise_risks:
    'Risk Register',

  third_parties:
    'Third Parties',

  audit_incidents:
    'Incidentes',
}

function statusesFor(
  table: ConsolidationTable
): string[] {
  switch (table) {
    case 'audit_evidence':
      return [
        'pending',
        'verified',
        'rejected',
      ]

    case 'remediation_plans':
      return [
        'open',
        'in_progress',
        'blocked',
        'completed',
        'cancelled',
      ]

    case 'audit_tasks':
      return [
        'todo',
        'in_progress',
        'blocked',
        'completed',
      ]

    case 'compliance_controls':
      return [
        'not_assessed',
        'compliant',
        'partial',
        'non_compliant',
        'not_applicable',
      ]

    case 'enterprise_risks':
      return [
        'open',
        'monitoring',
        'treated',
        'closed',
      ]

    case 'third_parties':
      return [
        'pending',
        'in_review',
        'approved',
        'restricted',
        'rejected',
      ]

    case 'audit_incidents':
      return [
        'open',
        'investigating',
        'contained',
        'resolved',
        'closed',
      ]
  }
}

export function ConsolidationCenter({
  canWrite,
  canDelete,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const [records, setRecords] =
    useState<
      ConsolidationRecord[]
    >([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(
      null
    )

  const [query, setQuery] =
    useState('')

  const [filter, setFilter] =
    useState<
      'all' |
      ConsolidationTable
    >('all')

  const [selected, setSelected] =
    useState<
      ConsolidationRecord |
      null
    >(null)

  const [title, setTitle] =
    useState('')

  const [status, setStatus] =
    useState('')

  const [owner, setOwner] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  async function load() {
    try {
      setLoading(true)
      setError(null)

      const data =
        await getConsolidationRecords()

      setRecords(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la plataforma.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      void load()
    }
  }, [open])

  const filtered =
    useMemo(
      () =>
        records.filter(
          (record) =>
            (
              filter ===
                'all' ||
              record.table ===
                filter
            ) &&
            recordMatches(
              record,
              query
            )
        ),
      [
        records,
        filter,
        query,
      ]
    )

  const counts =
    useMemo(() => {
      const result =
        {} as Record<
          ConsolidationTable,
          number
        >

      for (
        const key of
          Object.keys(
            tableLabels
          ) as ConsolidationTable[]
      ) {
        result[key] =
          records.filter(
            (item) =>
              item.table === key
          ).length
      }

      return result
    }, [records])

  function edit(
    record:
      ConsolidationRecord
  ) {
    setSelected(record)
    setTitle(record.title)
    setStatus(record.status)
    setOwner(record.owner)
    setError(null)
  }

  async function save() {
    if (
      !selected ||
      !title.trim()
    ) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      await updateConsolidationRecord(
        selected,
        {
          title:
            title.trim(),
          status,
          owner:
            owner.trim(),
        }
      )

      setSelected(null)
      await load()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function remove(
    record:
      ConsolidationRecord
  ) {
    if (!canDelete) {
      return
    }

    if (
      !window.confirm(
        `¿Eliminar ${record.code}?`
      )
    ) {
      return
    }

    try {
      setError(null)

      await deleteConsolidationRecord(
        record
      )

      await load()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar.'
      )
    }
  }

  const criticalCount =
    records.filter(
      (record) => {
        const raw =
          record.raw

        return (
          raw.priority ===
            'critical' ||
          raw.severity ===
            'critical' ||
          raw.criticality ===
            'critical' ||
          Number(
            raw.inherent_score ??
              0
          ) >= 20
        )
      }
    ).length

  return (
    <>
      <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b1928] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              Platform Consolidation
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              Centro de consolidación
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Gestión transversal, búsqueda, edición y control de módulos empresariales
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(true)
            }
            className="rounded-xl bg-[#c9a227] px-5 py-3 text-xs font-black text-[#07111f]"
          >
            Abrir consolidación
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric
            label="Registros"
            value={
              records.length
            }
          />

          <Metric
            label="Módulos"
            value={7}
          />

          <Metric
            label="Críticos"
            value={
              criticalCount
            }
          />

          <Metric
            label="Estado"
            value="OK"
          />
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928]">

            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1928] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                    Consolidation Center
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-white">
                    Gestión transversal
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      e.target.value
                    )
                  }
                  placeholder="Buscar código, título, responsable, estado, framework, vendor..."
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
                />

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(
                      e.target.value as
                        | 'all'
                        | ConsolidationTable
                    )
                  }
                  className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                >
                  <option value="all">
                    Todos los módulos
                  </option>

                  {(
                    Object.entries(
                      tableLabels
                    ) as Array<
                      [
                        ConsolidationTable,
                        string,
                      ]
                    >
                  ).map(
                    ([
                      key,
                      label,
                    ]) => (
                      <option
                        key={key}
                        value={key}
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  Object.entries(
                    tableLabels
                  ) as Array<
                    [
                      ConsolidationTable,
                      string,
                    ]
                  >
                ).map(
                  ([
                    key,
                    label,
                  ]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFilter(
                          key
                        )
                      }
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:border-[#c9a227]/40"
                    >
                      {label}{' '}
                      {counts[key] ?? 0}
                    </button>
                  )
                )}
              </div>
            </div>

            {error && (
              <div className="m-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-16 text-center text-slate-500">
                Cargando plataforma...
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4 text-xs text-slate-500">
                  {
                    filtered.length
                  } resultado
                  {filtered.length ===
                  1
                    ? ''
                    : 's'}
                </div>

                <div className="space-y-3">
                  {filtered.map(
                    (record) => (
                      <div
                        key={`${record.table}-${record.id}`}
                        className="rounded-2xl border border-white/10 bg-[#07111f] p-5"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase text-slate-500">
                                {
                                  tableLabels[
                                    record.table
                                  ]
                                }
                              </span>

                              <span className="font-mono text-[10px] font-bold text-[#c9a227]">
                                {
                                  record.code
                                }
                              </span>

                              <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] font-bold text-slate-400">
                                {
                                  labelStatus(
                                    record.status
                                  )
                                }
                              </span>
                            </div>

                            <div className="mt-3 font-bold text-white">
                              {
                                record.title
                              }
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {
                                record.detail
                              }
                            </div>

                            {record.owner && (
                              <div className="mt-2 text-[10px] text-slate-600">
                                Responsable:{' '}
                                {
                                  record.owner
                                }
                              </div>
                            )}

                            <div className="mt-1 text-[9px] text-slate-700">
                              {formatPlatformDate(
                                record.createdAt
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {canWrite && (
                              <button
                                type="button"
                                onClick={() =>
                                  edit(
                                    record
                                  )
                                }
                                className="rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/5 px-4 py-2 text-xs font-bold text-[#e1c45a]"
                              >
                                Editar
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  void remove(
                                    record
                                  )
                                }
                                className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-xs font-bold text-red-300"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {!filtered.length && (
                    <div className="py-16 text-center text-sm text-slate-500">
                      No existen registros para los filtros seleccionados.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b1928] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              {
                tableLabels[
                  selected.table
                ]
              }
            </p>

            <h3 className="mt-1 text-xl font-black text-white">
              Editar {
                selected.code
              }
            </h3>

            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              >
                {statusesFor(
                  selected.table
                ).map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {
                        labelStatus(
                          item
                        )
                      }
                    </option>
                  )
                )}
              </select>

              {selected.table !==
                'compliance_controls' && (
                <input
                  value={owner}
                  onChange={(e) =>
                    setOwner(
                      e.target.value
                    )
                  }
                  placeholder="Responsable"
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />
              )}

              {'priority' in
                selected.raw && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-500">
                  Prioridad actual:{' '}
                  {labelPriority(
                    String(
                      selected.raw
                        .priority ??
                        ''
                    )
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setSelected(null)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  saving ||
                  !title.trim()
                }
                onClick={() =>
                  void save()
                }
                className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f] disabled:opacity-50"
              >
                {saving
                  ? 'Guardando...'
                  : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#07111f] p-4">
      <div className="text-xl font-black text-white">
        {value}
      </div>

      <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </div>
    </div>
  )
}
