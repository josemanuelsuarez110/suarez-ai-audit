import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  createAuditTask,
  createComplianceControl,
  createEvidence,
  createRemediationPlan,
  getAuditTasks,
  getComplianceControls,
  getEvidence,
  getRemediationPlans,
} from '../services/governance.service'

import type {
  AuditTask,
  ComplianceControl,
  Evidence,
  RemediationPlan,
} from '../services/governance.service'

type AuditOption = {
  id: string
  auditCode?: string
  name: string
}

type FindingOption = {
  id: string
  findingCode?: string
  title: string
}

interface Props {
  audits: AuditOption[]
  findings: FindingOption[]
  canWrite: boolean
}

type Tab =
  | 'evidence'
  | 'remediation'
  | 'tasks'
  | 'compliance'

export function GovernanceSuite({
  audits,
  findings,
  canWrite,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const [tab, setTab] =
    useState<Tab>('evidence')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [evidence, setEvidence] =
    useState<Evidence[]>([])

  const [
    remediation,
    setRemediation,
  ] = useState<RemediationPlan[]>([])

  const [tasks, setTasks] =
    useState<AuditTask[]>([])

  const [
    compliance,
    setCompliance,
  ] = useState<ComplianceControl[]>([])

  const [showForm, setShowForm] =
    useState(false)

  const [form, setForm] =
    useState({
      title: '',
      description: '',
      auditId: '',
      findingId: '',
      owner: '',
      priority: 'medium',
      status: '',
      date: '',
      framework: 'ISO 27001',
      reference: '',
      score: 0,
      evidenceType: 'document',
    })

  async function loadAll() {
    try {
      setLoading(true)
      setError(null)

      const [
        evidenceData,
        remediationData,
        tasksData,
        complianceData,
      ] = await Promise.all([
        getEvidence(),
        getRemediationPlans(),
        getAuditTasks(),
        getComplianceControls(),
      ])

      setEvidence(evidenceData)
      setRemediation(
        remediationData
      )
      setTasks(tasksData)
      setCompliance(
        complianceData
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los módulos.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      void loadAll()
    }
  }, [open])

  function resetForm() {
    setForm({
      title: '',
      description: '',
      auditId:
        audits[0]?.id ?? '',
      findingId:
        findings[0]?.id ?? '',
      owner: '',
      priority: 'medium',
      status: '',
      date: '',
      framework: 'ISO 27001',
      reference: '',
      score: 0,
      evidenceType: 'document',
    })

    setShowForm(true)
  }

  async function save() {
    if (!form.title.trim()) {
      setError(
        'El título es obligatorio.'
      )
      return
    }

    try {
      setError(null)

      if (tab === 'evidence') {
        await createEvidence({
          auditId:
            form.auditId || null,
          findingId:
            form.findingId || null,
          title: form.title,
          description:
            form.description,
          evidenceType:
            form.evidenceType,
          source: form.owner,
          fileUrl: '',
          reference:
            form.reference,
          status: 'pending',
        })
      }

      if (
        tab === 'remediation'
      ) {
        if (!form.findingId) {
          throw new Error(
            'Selecciona un hallazgo.'
          )
        }

        await createRemediationPlan({
          findingId:
            form.findingId,
          title: form.title,
          description:
            form.description,
          ownerName: form.owner,
          priority:
            form.priority,
          status: 'open',
          targetDate:
            form.date || null,
          completionPercentage: 0,
        })
      }

      if (tab === 'tasks') {
        await createAuditTask({
          auditId:
            form.auditId || null,
          findingId:
            form.findingId || null,
          title: form.title,
          description:
            form.description,
          assignedName:
            form.owner,
          priority:
            form.priority,
          status: 'todo',
          dueDate:
            form.date || null,
        })
      }

      if (
        tab === 'compliance'
      ) {
        await createComplianceControl({
          auditId:
            form.auditId || null,
          framework:
            form.framework,
          controlReference:
            form.reference,
          title: form.title,
          description:
            form.description,
          status:
            'not_assessed',
          complianceScore:
            Number(form.score),
          evidenceRequired: true,
        })
      }

      setShowForm(false)
      await loadAll()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar.'
      )
    }
  }

  const overdueTasks =
    useMemo(() => {
      const today =
        new Date().getTime()

      return tasks.filter(
        (task) =>
          task.dueDate &&
          task.status !==
            'completed' &&
          new Date(
            task.dueDate
          ).getTime() < today
      ).length
    }, [tasks])

  const complianceAverage =
    compliance.length > 0
      ? Math.round(
          compliance.reduce(
            (
              total,
              control
            ) =>
              total +
              control.complianceScore,
            0
          ) /
            compliance.length
        )
      : 0

  return (
    <>
      <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b1928] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              Governance Suite
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              Auditoría, remediación y cumplimiento
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Evidencias, planes correctivos, tareas y controles regulatorios
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(true)
            }
            className="rounded-xl bg-[#c9a227] px-5 py-3 text-xs font-black text-[#07111f]"
          >
            Abrir Governance Suite
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric
            label="Evidencias"
            value={evidence.length}
          />

          <Metric
            label="Remediaciones"
            value={remediation.length}
          />

          <Metric
            label="Tareas vencidas"
            value={overdueTasks}
          />

          <Metric
            label="Compliance"
            value={`${complianceAverage}%`}
          />
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928]">

            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1928] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                    Governance Suite
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-white">
                    Gobierno de auditoría
                  </h2>
                </div>

                <div className="flex gap-2">
                  {canWrite && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-black text-[#07111f]"
                    >
                      Nuevo registro
                    </button>
                  )}

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
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <TabButton
                  active={
                    tab ===
                    'evidence'
                  }
                  onClick={() =>
                    setTab(
                      'evidence'
                    )
                  }
                >
                  Evidencias
                </TabButton>

                <TabButton
                  active={
                    tab ===
                    'remediation'
                  }
                  onClick={() =>
                    setTab(
                      'remediation'
                    )
                  }
                >
                  Remediación
                </TabButton>

                <TabButton
                  active={
                    tab === 'tasks'
                  }
                  onClick={() =>
                    setTab('tasks')
                  }
                >
                  Tareas
                </TabButton>

                <TabButton
                  active={
                    tab ===
                    'compliance'
                  }
                  onClick={() =>
                    setTab(
                      'compliance'
                    )
                  }
                >
                  Compliance
                </TabButton>
              </div>
            </div>

            {error && (
              <div className="m-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-16 text-center text-slate-500">
                Cargando...
              </div>
            ) : (
              <div className="p-6">
                {tab ===
                  'evidence' && (
                  <EvidenceList
                    items={
                      evidence
                    }
                  />
                )}

                {tab ===
                  'remediation' && (
                  <RemediationList
                    items={
                      remediation
                    }
                  />
                )}

                {tab ===
                  'tasks' && (
                  <TaskList
                    items={tasks}
                  />
                )}

                {tab ===
                  'compliance' && (
                  <ComplianceList
                    items={
                      compliance
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1928] p-6">

            <h3 className="text-xl font-black text-white">
              Nuevo registro
            </h3>

            <div className="mt-5 space-y-4">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  })
                }
                placeholder="Título"
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              />

              <textarea
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Descripción"
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              />

              <select
                value={form.auditId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    auditId:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              >
                <option value="">
                  Sin auditoría
                </option>

                {audits.map(
                  (audit) => (
                    <option
                      key={
                        audit.id
                      }
                      value={
                        audit.id
                      }
                    >
                      {audit.auditCode ??
                        audit.name}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  form.findingId
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    findingId:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              >
                <option value="">
                  Sin hallazgo
                </option>

                {findings.map(
                  (finding) => (
                    <option
                      key={
                        finding.id
                      }
                      value={
                        finding.id
                      }
                    >
                      {finding.findingCode ??
                        finding.title}
                    </option>
                  )
                )}
              </select>

              <input
                value={form.owner}
                onChange={(e) =>
                  setForm({
                    ...form,
                    owner:
                      e.target.value,
                  })
                }
                placeholder="Responsable / fuente"
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              />

              <input
                value={
                  form.reference
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    reference:
                      e.target.value,
                  })
                }
                placeholder="Referencia / control"
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
              />

              {tab ===
                'compliance' && (
                <>
                  <input
                    value={
                      form.framework
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        framework:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Framework"
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                  />

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      form.score
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        score:
                          Number(
                            e.target
                              .value
                          ),
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                  />
                </>
              )}

              {(tab ===
                'tasks' ||
                tab ===
                  'remediation') && (
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300"
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  void save()
                }
                className="rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-black text-[#07111f]"
              >
                Guardar
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl px-4 py-2 text-xs font-bold',
        active
          ? 'bg-[#c9a227] text-[#07111f]'
          : 'border border-white/10 text-slate-400',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function EvidenceList({
  items,
}: {
  items: Evidence[]
}) {
  return (
    <List
      empty="No existen evidencias."
      items={items.map(
        (item) => ({
          key: item.id,
          code:
            item.evidenceCode,
          title: item.title,
          detail:
            `${item.evidenceType} · ${item.status}`,
        })
      )}
    />
  )
}

function RemediationList({
  items,
}: {
  items: RemediationPlan[]
}) {
  return (
    <List
      empty="No existen planes."
      items={items.map(
        (item) => ({
          key: item.id,
          code:
            item.remediationCode,
          title: item.title,
          detail:
            `${item.priority} · ${item.status} · ${item.completionPercentage}%`,
        })
      )}
    />
  )
}

function TaskList({
  items,
}: {
  items: AuditTask[]
}) {
  return (
    <List
      empty="No existen tareas."
      items={items.map(
        (item) => ({
          key: item.id,
          code:
            item.taskCode,
          title: item.title,
          detail:
            `${item.assignedName || 'Sin responsable'} · ${item.status}`,
        })
      )}
    />
  )
}

function ComplianceList({
  items,
}: {
  items: ComplianceControl[]
}) {
  return (
    <List
      empty="No existen controles."
      items={items.map(
        (item) => ({
          key: item.id,
          code:
            item.controlCode,
          title:
            `${item.framework} · ${item.title}`,
          detail:
            `${item.status} · ${item.complianceScore}%`,
        })
      )}
    />
  )
}

function List({
  items,
  empty,
}: {
  items: Array<{
    key: string
    code: string
    title: string
    detail: string
  }>
  empty: string
}) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        {empty}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-white/10 bg-[#07111f] p-4"
        >
          <div className="font-mono text-[10px] font-bold text-[#c9a227]">
            {item.code}
          </div>

          <div className="mt-2 font-bold text-white">
            {item.title}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {item.detail}
          </div>
        </div>
      ))}
    </div>
  )
}
