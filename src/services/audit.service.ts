import { supabase } from '../lib/supabase'
import type { Audit, AuditFinding } from '../types/audit'

type AuditRow = {
  id: string
  audit_code: string
  organization_id: string
  name: string
  type: string
  status: Audit['status']
  risk_level: Audit['riskLevel']
  progress: number
  score: number | null
  scope: string | null
  objectives: string | null
  methodology: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

type FindingRow = {
  id: string
  finding_code: string
  audit_id: string
  title: string
  description: string | null
  category: string
  risk_level: AuditFinding['riskLevel']
  status: AuditFinding['status']
  score: number | null
  recommendation: string | null
  assigned_to: string | null
  due_date: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

type OrganizationRow = {
  id: string
  name: string
  legal_name: string | null
  industry: string | null
  tax_id: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export async function getAudits(): Promise<Audit[]> {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    )
  }

  const { data, error } = await supabase
    .from('audits')
    .select(`
      id,
      audit_code,
      organization_id,
      name,
      type,
      status,
      risk_level,
      progress,
      score,
      scope,
      objectives,
      methodology,
      started_at,
      completed_at,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const audits = (data ?? []) as AuditRow[]

  if (audits.length === 0) {
    return []
  }

  const organizationIds = [
    ...new Set(audits.map((audit) => audit.organization_id)),
  ]

  const auditIds = audits.map((audit) => audit.id)

  const [organizationsResult, findingsResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, legal_name, industry, tax_id, contact_name, contact_email, contact_phone, active, created_at, updated_at')
      .in('id', organizationIds),

    supabase
      .from('findings')
      .select(`
        id,
        finding_code,
        audit_id,
        title,
        description,
        category,
        risk_level,
        status,
        score,
        recommendation,
        assigned_to,
        due_date,
        resolved_at,
        created_at,
        updated_at
      `)
      .in('audit_id', auditIds),
  ])

  if (organizationsResult.error) {
    throw organizationsResult.error
  }

  if (findingsResult.error) {
    throw findingsResult.error
  }

  const organizations = (organizationsResult.data ?? []) as OrganizationRow[]
  const findings = (findingsResult.data ?? []) as FindingRow[]

  const organizationsById = new Map(
    organizations.map((organization) => [
      organization.id,
      organization,
    ])
  )

  const findingsByAuditId = new Map<string, FindingRow[]>()

  for (const finding of findings) {
    const current = findingsByAuditId.get(finding.audit_id) ?? []
    current.push(finding)
    findingsByAuditId.set(finding.audit_id, current)
  }

  return audits.map((audit) => {
    const auditFindings = findingsByAuditId.get(audit.id) ?? []

    const criticalFindings = auditFindings.filter(
      (finding) => finding.risk_level === 'critical'
    ).length

    const organization = organizationsById.get(audit.organization_id)

    return {
      id: audit.id,
      auditCode: audit.audit_code,
      organizationId: audit.organization_id,
      name: audit.name,
      organization: organization?.name ?? 'Organización no disponible',
      type: audit.type,
      status: audit.status,
      riskLevel: audit.risk_level,
      progress: audit.progress,
      score: audit.score,
      scope: audit.scope ?? '',
      objectives: audit.objectives ?? '',
      methodology: audit.methodology ?? '',
      findings: auditFindings.length,
      criticalFindings,
      startedAt: audit.started_at ?? audit.created_at,
      updatedAt: audit.updated_at,
    }
  })
}

export async function getFindings(): Promise<AuditFinding[]> {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    )
  }

  const { data, error } = await supabase
    .from('findings')
    .select(`
      id,
      finding_code,
      audit_id,
      title,
      description,
      category,
      risk_level,
      status,
      score,
      recommendation,
      assigned_to,
      due_date,
      resolved_at,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const findings = (data ?? []) as FindingRow[]

  return findings.map((finding) => ({
    id: finding.id,
    findingCode: finding.finding_code,
    auditId: finding.audit_id,
    title: finding.title,
    description: finding.description ?? '',
    category: finding.category,
    riskLevel: finding.risk_level,
    status: finding.status,
    score: finding.score ?? 0,
    recommendation: finding.recommendation ?? '',
    createdAt: finding.created_at,
  }))
}


export type OrganizationOption = {
  id: string
  name: string
}

export type CreateAuditInput = {
  organizationId: string
  name: string
  type: string
  status: 'draft' | 'in_progress' | 'completed'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  scope?: string
  objectives?: string
  methodology?: string
}

export async function getOrganizations(): Promise<OrganizationOption[]> {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    )
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('active', true)
    .order('name')

  if (error) {
    throw error
  }

  return (data ?? []) as OrganizationOption[]
}

export async function createAudit(
  input: CreateAuditInput
): Promise<void> {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    )
  }

  const { error } = await supabase
    .from('audits')
    .insert({
      audit_code: null,
      organization_id: input.organizationId,
      name: input.name.trim(),
      type: input.type.trim(),
      status: input.status,
      risk_level: input.riskLevel,
      progress: input.progress,
      scope: input.scope?.trim() || null,
      objectives: input.objectives?.trim() || null,
      methodology: input.methodology?.trim() || null,
    })

  if (error) {
    throw error
  }
}


export type UpdateAuditInput = {
  id: string
  organizationId: string
  name: string
  type: string
  status: 'draft' | 'in_progress' | 'completed'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  score?: number | null
  scope?: string
  objectives?: string
  methodology?: string
}

export async function updateAudit(
  input: UpdateAuditInput
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const progress = Math.max(0, Math.min(100, input.progress))

  const { error } = await supabase
    .from('audits')
    .update({
      organization_id: input.organizationId,
      name: input.name.trim(),
      type: input.type.trim(),
      status: input.status,
      risk_level: input.riskLevel,
      progress,
      score: input.score ?? null,
      scope: input.scope?.trim() || null,
      objectives: input.objectives?.trim() || null,
      methodology: input.methodology?.trim() || null,
      completed_at:
        input.status === 'completed'
          ? new Date().toISOString()
          : null,
    })
    .eq('id', input.id)

  if (error) {
    throw error
  }
}


export type CreateFindingInput = {
  auditId: string
  title: string
  description: string
  category: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'accepted'
  score: number
  recommendation: string
}

export async function createFinding(
  input: CreateFindingInput
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase
    .from('findings')
    .insert({
      finding_code: null,
      audit_id: input.auditId,
      title: input.title.trim(),
      description: input.description.trim() || null,
      category: input.category.trim(),
      risk_level: input.riskLevel,
      status: input.status,
      score: input.score,
      recommendation: input.recommendation.trim() || null,
    })

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ].filter(Boolean).join(' | ')
    )
  }
}

export type UpdateFindingInput = {
  id: string
  auditId: string
  title: string
  description: string
  category: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'accepted'
  score: number
  recommendation: string
}

export async function updateFinding(
  input: UpdateFindingInput
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase
    .from('findings')
    .update({
      audit_id: input.auditId,
      title: input.title.trim(),
      description: input.description.trim() || null,
      category: input.category.trim(),
      risk_level: input.riskLevel,
      status: input.status,
      score: input.score,
      recommendation: input.recommendation.trim() || null,
      resolved_at:
        input.status === 'resolved'
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ].filter(Boolean).join(' | ')
    )
  }
}



// ============================================================
// ORGANIZATIONS CRUD
// ============================================================

export type Organization = {
  id: string
  name: string
  legalName: string
  industry: string
  taxId: string
  contactName: string
  contactEmail: string
  contactPhone: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateOrganizationInput = {
  name: string
  legalName?: string
  industry?: string
  taxId?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

export type UpdateOrganizationInput = {
  id: string
  name: string
  legalName?: string
  industry?: string
  taxId?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  active: boolean
}

export async function getAllOrganizations(): Promise<Organization[]> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      legal_name,
      industry,
      tax_id,
      contact_name,
      contact_email,
      contact_phone,
      active,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((organization) => ({
    id: organization.id,
    name: organization.name,
    legalName: organization.legal_name ?? '',
    industry: organization.industry ?? '',
    taxId: organization.tax_id ?? '',
    contactName: organization.contact_name ?? '',
    contactEmail: organization.contact_email ?? '',
    contactPhone: organization.contact_phone ?? '',
    active: organization.active,
    createdAt: organization.created_at,
    updatedAt: organization.updated_at,
  }))
}


export async function createOrganization(
  input: CreateOrganizationInput
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  if (!input.name.trim()) {
    throw new Error('El nombre de la organización es obligatorio.')
  }

  const { error } = await supabase
    .from('organizations')
    .insert({
      name: input.name.trim(),
      legal_name: input.legalName?.trim() || null,
      industry: input.industry?.trim() || null,
      tax_id: input.taxId?.trim() || null,
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      active: true,
    })

  if (error) {
    throw error
  }
}


export async function updateOrganization(
  input: UpdateOrganizationInput
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  if (!input.name.trim()) {
    throw new Error('El nombre de la organización es obligatorio.')
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      name: input.name.trim(),
      legal_name: input.legalName?.trim() || null,
      industry: input.industry?.trim() || null,
      tax_id: input.taxId?.trim() || null,
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)

  if (error) {
    throw error
  }
}


export async function setOrganizationActive(
  id: string,
  active: boolean
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}
