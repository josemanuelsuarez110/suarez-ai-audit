import { supabase } from '../lib/supabase'

export type ConsolidationTable =
  | 'audit_evidence'
  | 'remediation_plans'
  | 'audit_tasks'
  | 'compliance_controls'
  | 'enterprise_risks'
  | 'third_parties'
  | 'audit_incidents'

export interface ConsolidationRecord {
  id: string
  table: ConsolidationTable
  code: string
  title: string
  status: string
  detail: string
  owner: string
  createdAt: string | null
  raw: Record<string, unknown>
}

function client() {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado.'
    )
  }

  return supabase
}

function asText(
  value: unknown
): string {
  return value === null ||
    value === undefined
    ? ''
    : String(value)
}

export async function getConsolidationRecords():
Promise<ConsolidationRecord[]> {
  const db = client()

  const [
    evidence,
    remediation,
    tasks,
    compliance,
    risks,
    vendors,
    incidents,
  ] = await Promise.all([
    db
      .from('audit_evidence')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),

    db
      .from('remediation_plans')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),

    db
      .from('audit_tasks')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),

    db
      .from('compliance_controls')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),

    db
      .from('enterprise_risks')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),

    db
      .from('third_parties')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),

    db
      .from('audit_incidents')
      .select('*')
      .order('created_at', {
        ascending: false,
      }),
  ])

  const results = [
    evidence,
    remediation,
    tasks,
    compliance,
    risks,
    vendors,
    incidents,
  ]

  const failed =
    results.find(
      (item) => item.error
    )

  if (failed?.error) {
    throw failed.error
  }

  const records:
    ConsolidationRecord[] = []

  for (
    const row of
      evidence.data ?? []
  ) {
    records.push({
      id: row.id,
      table: 'audit_evidence',
      code:
        row.evidence_code,
      title: row.title,
      status: row.status,
      detail:
        `${row.evidence_type} · ${row.reference ?? 'Sin referencia'}`,
      owner:
        row.source ?? '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  for (
    const row of
      remediation.data ?? []
  ) {
    records.push({
      id: row.id,
      table:
        'remediation_plans',
      code:
        row.remediation_code,
      title: row.title,
      status: row.status,
      detail:
        `${row.priority} · ${row.completion_percentage ?? 0}%`,
      owner:
        row.owner_name ?? '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  for (
    const row of
      tasks.data ?? []
  ) {
    records.push({
      id: row.id,
      table: 'audit_tasks',
      code: row.task_code,
      title: row.title,
      status: row.status,
      detail:
        `${row.priority} · ${row.due_date ?? 'Sin vencimiento'}`,
      owner:
        row.assigned_name ?? '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  for (
    const row of
      compliance.data ?? []
  ) {
    records.push({
      id: row.id,
      table:
        'compliance_controls',
      code:
        row.control_code,
      title: row.title,
      status: row.status,
      detail:
        `${row.framework} · ${row.compliance_score ?? 0}%`,
      owner: '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  for (
    const row of
      risks.data ?? []
  ) {
    records.push({
      id: row.id,
      table:
        'enterprise_risks',
      code: row.risk_code,
      title: row.title,
      status: row.status,
      detail:
        `Riesgo ${row.inherent_score ?? 0}/25 · Residual ${row.residual_score ?? 0}/25`,
      owner:
        row.owner_name ?? '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  for (
    const row of
      vendors.data ?? []
  ) {
    records.push({
      id: row.id,
      table: 'third_parties',
      code:
        row.vendor_code,
      title: row.name,
      status:
        row.assessment_status,
      detail:
        `${row.criticality} · Risk ${row.risk_score ?? 0}%`,
      owner:
        row.contact_name ?? '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  for (
    const row of
      incidents.data ?? []
  ) {
    records.push({
      id: row.id,
      table:
        'audit_incidents',
      code:
        row.incident_code,
      title: row.title,
      status: row.status,
      detail:
        `${row.severity} · Impacto ${row.financial_impact ?? 0}`,
      owner:
        row.owner_name ?? '',
      createdAt:
        row.created_at,
      raw: row,
    })
  }

  return records
}

export async function updateConsolidationRecord(
  record: ConsolidationRecord,
  values: {
    title: string
    status?: string
    owner?: string
  }
): Promise<void> {
  const db = client()

  const payload:
    Record<string, unknown> = {
      updated_at:
        new Date().toISOString(),
  }

  switch (record.table) {
    case 'audit_evidence':
      payload.title =
        values.title
      payload.status =
        values.status
      payload.source =
        values.owner || null
      break

    case 'remediation_plans':
      payload.title =
        values.title
      payload.status =
        values.status
      payload.owner_name =
        values.owner || null
      break

    case 'audit_tasks':
      payload.title =
        values.title
      payload.status =
        values.status
      payload.assigned_name =
        values.owner || null
      break

    case 'compliance_controls':
      payload.title =
        values.title
      payload.status =
        values.status
      break

    case 'enterprise_risks':
      payload.title =
        values.title
      payload.status =
        values.status
      payload.owner_name =
        values.owner || null
      break

    case 'third_parties':
      payload.name =
        values.title
      payload.assessment_status =
        values.status
      payload.contact_name =
        values.owner || null
      break

    case 'audit_incidents':
      payload.title =
        values.title
      payload.status =
        values.status
      payload.owner_name =
        values.owner || null
      break
  }

  const { error } = await db
    .from(record.table)
    .update(payload)
    .eq('id', record.id)

  if (error) {
    throw error
  }
}

export async function deleteConsolidationRecord(
  record: ConsolidationRecord
): Promise<void> {
  const db = client()

  const { error } = await db
    .from(record.table)
    .delete()
    .eq('id', record.id)

  if (error) {
    throw error
  }
}

export function recordMatches(
  record: ConsolidationRecord,
  query: string
): boolean {
  const normalized =
    query
      .trim()
      .toLowerCase()

  if (!normalized) return true

  return [
    record.code,
    record.title,
    record.status,
    record.detail,
    record.owner,
    record.table,
    ...Object.values(
      record.raw
    ).map(asText),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized)
}
