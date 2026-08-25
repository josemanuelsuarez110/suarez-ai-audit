import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  createAuditIncident,
  createEnterpriseRisk,
  createThirdParty,
  getAuditIncidents,
  getEnterpriseRisks,
  getThirdParties,
} from '../services/enterprise.service'

import type {
  AuditIncident,
  EnterpriseRisk,
  ThirdParty,
} from '../services/enterprise.service'

type AuditOption = {
  id: string
  auditCode?: string
  name: string
  organizationId?: string
}

type OrganizationOption = {
  id: string
  name: string
}

type TransactionOption = {
  id: string
  transactionCode?: string
  description: string
}

interface Props {
  audits: AuditOption[]
  organizations: OrganizationOption[]
  transactions: TransactionOption[]
  canWrite: boolean
}

type Tab =
  | 'risks'
  | 'vendors'
  | 'incidents'
  | 'kpis'

export function EnterpriseRiskSuite({
  audits,
  organizations,
  transactions,
  canWrite,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const [tab, setTab] =
    useState<Tab>('risks')

  const [risks, setRisks] =
    useState<EnterpriseRisk[]>([])

  const [vendors, setVendors] =
    useState<ThirdParty[]>([])

  const [incidents, setIncidents] =
    useState<AuditIncident[]>([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [showForm, setShowForm] =
    useState(false)

  const [form, setForm] =
    useState({
      title: '',
      description: '',
      category: '',
      owner: '',
      auditId: '',
      organizationId: '',
      transactionId: '',
      likelihood: 3,
      impact: 3,
      residualLikelihood: 2,
      residualImpact: 2,
      treatment: 'mitigate',
      criticality: 'medium',
      riskScore: 0,
      severity: 'medium',
      financialImpact: 0,
      date: '',
      email: '',
      country: '',
    })

  async function load() {
    try {
      setLoading(true)
      setError(null)

      const [
        riskData,
        vendorData,
        incidentData,
      ] = await Promise.all([
        getEnterpriseRisks(),
        getThirdParties(),
        getAuditIncidents(),
      ])

      setRisks(riskData)
      setVendors(vendorData)
      setIncidents(
        incidentData
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
      void load()
    }
  }, [open])

  function newRecord() {
    setForm({
      title: '',
      description: '',
      category: '',
      owner: '',
      auditId:
        audits[0]?.id ?? '',
      organizationId:
        organizations[0]?.id ??
        '',
      transactionId: '',
      likelihood: 3,
      impact: 3,
      residualLikelihood: 2,
      residualImpact: 2,
      treatment: 'mitigate',
      criticality: 'medium',
      riskScore: 0,
      severity: 'medium',
      financialImpact: 0,
      date: '',
      email: '',
      country: '',
    })

    setShowForm(true)
  }

  async function save() {
    if (!form.title.trim()) {
      setError(
        'El título o nombre es obligatorio.'
      )
      return
    }

    try {
      setError(null)

      if (tab === 'risks') {
        await createEnterpriseRisk({
          auditId:
            form.auditId || null,
          organizationId:
            form.organizationId ||
            null,
          title: form.title,
          description:
            form.description,
          category:
            form.category,
          ownerName:
            form.owner,
          likelihood:
            form.likelihood,
          impact:
            form.impact,
          residualLikelihood:
            form.residualLikelihood,
          residualImpact:
            form.residualImpact,
          treatment:
            form.treatment,
          targetDate:
            form.date || null,
        })
      }

      if (tab === 'vendors') {
        await createThirdParty({
          organizationId:
            form.organizationId ||
            null,
          name: form.title,
          category:
            form.category,
          contactName:
            form.owner,
          email: form.email,
          country:
            form.country,
          criticality:
            form.criticality,
          riskScore:
            form.riskScore,
          nextAssessmentDate:
            form.date || null,
        })
      }

      if (tab === 'incidents') {
        await createAuditIncident({
          auditId:
            form.auditId || null,
          organizationId:
            form.organizationId ||
            null,
          relatedTransactionId:
            form.transactionId ||
            null,
          title: form.title,
          description:
            form.description,
          category:
            form.category,
          severity:
            form.severity,
          ownerName:
            form.owner,
          financialImpact:
            form.financialImpact,
        })
      }

      setShowForm(false)
      await load()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar.'
      )
    }
  }

  const criticalRisks =
    risks.filter(
      (item) =>
        item.inherentScore >= 20
    )

  const highRiskVendors =
    vendors.filter(
      (item) =>
        item.riskScore >= 70
    )

  const openIncidents =
    incidents.filter(
      (item) =>
        ![
          'resolved',
          'closed',
        ].includes(item.status)
    )

  const criticalIncidents =
    incidents.filter(
      (item) =>
        item.severity ===
        'critical'
    )

  const totalIncidentImpact =
    incidents.reduce(
      (total, item) =>
        total +
        item.financialImpact,
      0
    )

  const avgVendorRisk =
    vendors.length > 0
      ? Math.round(
          vendors.reduce(
            (total, item) =>
              total +
              item.riskScore,
            0
          ) /
            vendors.length
        )
      : 0

  const avgResidualRisk =
    risks.length > 0
      ? (
          risks.reduce(
            (total, item) =>
              total +
              item.residualScore,
            0
          ) /
          risks.length
        ).toFixed(1)
      : '0.0'

  const riskReduction =
    useMemo(() => {
      if (!risks.length) {
        return 0
      }

      const inherent =
        risks.reduce(
          (total, item) =>
            total +
            item.inherentScore,
          0
        )

      const residual =
        risks.reduce(
          (total, item) =>
            total +
            item.residualScore,
          0
        )

      if (!inherent) return 0

      return Math.round(
        ((inherent - residual) /
          inherent) *
          100
      )
    }, [risks])

  return (
    <>
      <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b1928] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              Enterprise Risk Suite
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              Riesgo corporativo e incidentes
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Registro de riesgos, terceros, incidentes y KPIs ejecutivos
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(true)
            }
            className="rounded-xl bg-[#c9a227] px-5 py-3 text-xs font-black text-[#07111f]"
          >
            Abrir Enterprise Risk
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric
            label="Riesgos críticos"
            value={
              criticalRisks.length
            }
          />

          <Metric
            label="Vendors alto riesgo"
            value={
              highRiskVendors.length
            }
          />

          <Metric
            label="Incidentes abiertos"
            value={
              openIncidents.length
            }
          />

          <Metric
            label="Reducción riesgo"
            value={`${riskReduction}%`}
          />
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[270] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928]">

            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1928] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                    Enterprise Risk
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-white">
                    Riesgo corporativo
                  </h2>
                </div>

                <div className="flex gap-2">
                  {canWrite &&
                    tab !== 'kpis' && (
                    <button
                      onClick={
                        newRecord
                      }
                      className="rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-black text-[#07111f]"
                    >
                      Nuevo registro
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setOpen(false)
                    }
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ['risks','Risk Register'],
                  ['vendors','Third Parties'],
                  ['incidents','Incidentes'],
                  ['kpis','Executive KPIs'],
                ].map(
                  ([value,label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setTab(
                          value as Tab
                        )
                      }
                      className={[
                        'rounded-xl px-4 py-2 text-xs font-bold',
                        tab === value
                          ? 'bg-[#c9a227] text-[#07111f]'
                          : 'border border-white/10 text-slate-400',
                      ].join(' ')}
                    >
                      {label}
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
                Cargando...
              </div>
            ) : (
              <div className="p-6">

                {tab === 'risks' && (
                  <Cards
                    empty="No existen riesgos registrados."
                    items={risks.map(
                      (item) => ({
                        key: item.id,
                        code:
                          item.riskCode,
                        title:
                          item.title,
                        detail:
                          `Inherente ${item.inherentScore}/25 · Residual ${item.residualScore}/25 · ${item.treatment}`,
                      })
                    )}
                  />
                )}

                {tab === 'vendors' && (
                  <Cards
                    empty="No existen terceros registrados."
                    items={vendors.map(
                      (item) => ({
                        key: item.id,
                        code:
                          item.vendorCode,
                        title:
                          item.name,
                        detail:
                          `${item.criticality} · Risk ${item.riskScore}% · ${item.assessmentStatus}`,
                      })
                    )}
                  />
                )}

                {tab === 'incidents' && (
                  <Cards
                    empty="No existen incidentes."
                    items={incidents.map(
                      (item) => ({
                        key: item.id,
                        code:
                          item.incidentCode,
                        title:
                          item.title,
                        detail:
                          `${item.severity} · ${item.status} · Impacto ${item.financialImpact.toLocaleString('es-DO')}`,
                      })
                    )}
                  />
                )}

                {tab === 'kpis' && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <Kpi
                      title="Riesgos críticos"
                      value={
                        criticalRisks.length
                      }
                    />

                    <Kpi
                      title="Riesgo residual promedio"
                      value={
                        avgResidualRisk
                      }
                    />

                    <Kpi
                      title="Reducción de exposición"
                      value={`${riskReduction}%`}
                    />

                    <Kpi
                      title="Vendor risk promedio"
                      value={`${avgVendorRisk}%`}
                    />

                    <Kpi
                      title="Incidentes críticos"
                      value={
                        criticalIncidents.length
                      }
                    />

                    <Kpi
                      title="Impacto financiero incidentes"
                      value={
                        totalIncidentImpact.toLocaleString(
                          'es-DO',
                          {
                            minimumFractionDigits: 2,
                          }
                        )
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center bg-black/85 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1928] p-6">

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
                placeholder={
                  tab === 'vendors'
                    ? 'Nombre del proveedor'
                    : 'Título'
                }
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
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
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
              />

              <input
                value={
                  form.category
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value,
                  })
                }
                placeholder="Categoría"
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
              />

              <input
                value={form.owner}
                onChange={(e) =>
                  setForm({
                    ...form,
                    owner:
                      e.target.value,
                  })
                }
                placeholder="Responsable / contacto"
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
              />

              {tab === 'risks' && (
                <>
                  <NumberInput
                    label="Probabilidad inherente"
                    value={
                      form.likelihood
                    }
                    setValue={(value) =>
                      setForm({
                        ...form,
                        likelihood:
                          value,
                      })
                    }
                  />

                  <NumberInput
                    label="Impacto inherente"
                    value={
                      form.impact
                    }
                    setValue={(value) =>
                      setForm({
                        ...form,
                        impact:
                          value,
                      })
                    }
                  />

                  <NumberInput
                    label="Probabilidad residual"
                    value={
                      form.residualLikelihood
                    }
                    setValue={(value) =>
                      setForm({
                        ...form,
                        residualLikelihood:
                          value,
                      })
                    }
                  />

                  <NumberInput
                    label="Impacto residual"
                    value={
                      form.residualImpact
                    }
                    setValue={(value) =>
                      setForm({
                        ...form,
                        residualImpact:
                          value,
                      })
                    }
                  />

                  <select
                    value={
                      form.treatment
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        treatment:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  >
                    <option value="mitigate">Mitigar</option>
                    <option value="accept">Aceptar</option>
                    <option value="avoid">Evitar</option>
                    <option value="transfer">Transferir</option>
                  </select>
                </>
              )}

              {tab === 'vendors' && (
                <>
                  <select
                    value={
                      form.criticality
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        criticality:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      form.riskScore
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        riskScore:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    placeholder="Risk score"
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  />

                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email:
                          e.target.value,
                      })
                    }
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  />

                  <input
                    value={
                      form.country
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        country:
                          e.target.value,
                      })
                    }
                    placeholder="País"
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  />
                </>
              )}

              {tab === 'incidents' && (
                <>
                  <select
                    value={
                      form.severity
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        severity:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>

                  <input
                    type="number"
                    value={
                      form.financialImpact
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        financialImpact:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    placeholder="Impacto financiero"
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  />

                  <select
                    value={
                      form.transactionId
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        transactionId:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
                  >
                    <option value="">
                      Sin transacción asociada
                    </option>

                    {transactions.map(
                      (transaction) => (
                        <option
                          key={
                            transaction.id
                          }
                          value={
                            transaction.id
                          }
                        >
                          {transaction.transactionCode ??
                            transaction.description}
                        </option>
                      )
                    )}
                  </select>
                </>
              )}

              <select
                value={
                  form.organizationId
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    organizationId:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
              >
                <option value="">
                  Sin organización
                </option>

                {organizations.map(
                  (organization) => (
                    <option
                      key={
                        organization.id
                      }
                      value={
                        organization.id
                      }
                    >
                      {
                        organization.name
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-slate-300"
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  void save()
                }
                className="rounded-xl bg-[#c9a227] px-5 py-3 font-black text-[#07111f]"
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

function NumberInput({
  label,
  value,
  setValue,
}: {
  label: string
  value: number
  setValue: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">
        {label} (1-5)
      </span>

      <input
        type="number"
        min="1"
        max="5"
        value={value}
        onChange={(e) =>
          setValue(
            Number(
              e.target.value
            )
          )
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white"
      />
    </label>
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

function Kpi({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f] p-6">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
        {title}
      </div>

      <div className="mt-3 text-3xl font-black text-white">
        {value}
      </div>
    </div>
  )
}

function Cards({
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
  if (!items.length) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        {empty}
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-white/10 bg-[#07111f] p-5"
        >
          <div className="font-mono text-[10px] font-bold text-[#c9a227]">
            {item.code}
          </div>

          <div className="mt-2 font-bold text-white">
            {item.title}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {item.detail}
          </div>
        </div>
      ))}
    </div>
  )
}
