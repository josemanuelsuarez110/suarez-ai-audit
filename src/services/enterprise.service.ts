import { supabase } from '../lib/supabase'

export interface EnterpriseRisk {
  id: string
  riskCode: string
  auditId: string | null
  organizationId: string | null
  title: string
  description: string
  category: string
  ownerName: string
  likelihood: number
  impact: number
  inherentScore: number
  residualLikelihood: number
  residualImpact: number
  residualScore: number
  treatment: string
  status: string
  targetDate: string | null
}

export interface ThirdParty {
  id: string
  vendorCode: string
  organizationId: string | null
  name: string
  category: string
  contactName: string
  email: string
  country: string
  criticality: string
  riskScore: number
  assessmentStatus: string
  nextAssessmentDate: string | null
}

export interface AuditIncident {
  id: string
  incidentCode: string
  auditId: string | null
  organizationId: string | null
  relatedTransactionId: string | null
  title: string
  description: string
  category: string
  severity: string
  status: string
  ownerName: string
  detectedAt: string
  financialImpact: number
}

function client() {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado.'
    )
  }

  return supabase
}

export async function getEnterpriseRisks():
Promise<EnterpriseRisk[]> {
  const { data, error } = await client()
    .from('enterprise_risks')
    .select('*')
    .order('inherent_score', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    riskCode: row.risk_code,
    auditId: row.audit_id,
    organizationId:
      row.organization_id,
    title: row.title,
    description:
      row.description ?? '',
    category: row.category ?? '',
    ownerName:
      row.owner_name ?? '',
    likelihood:
      Number(row.likelihood),
    impact:
      Number(row.impact),
    inherentScore:
      Number(row.inherent_score),
    residualLikelihood:
      Number(
        row.residual_likelihood
      ),
    residualImpact:
      Number(
        row.residual_impact
      ),
    residualScore:
      Number(row.residual_score),
    treatment: row.treatment,
    status: row.status,
    targetDate:
      row.target_date,
  }))
}

export async function createEnterpriseRisk(
  input: {
    auditId?: string | null
    organizationId?: string | null
    title: string
    description?: string
    category?: string
    ownerName?: string
    likelihood: number
    impact: number
    residualLikelihood: number
    residualImpact: number
    treatment: string
    targetDate?: string | null
  }
) {
  const { error } = await client()
    .from('enterprise_risks')
    .insert({
      risk_code: '',
      audit_id:
        input.auditId || null,
      organization_id:
        input.organizationId || null,
      title: input.title,
      description:
        input.description || null,
      category:
        input.category || null,
      owner_name:
        input.ownerName || null,
      likelihood:
        input.likelihood,
      impact:
        input.impact,
      residual_likelihood:
        input.residualLikelihood,
      residual_impact:
        input.residualImpact,
      treatment:
        input.treatment,
      target_date:
        input.targetDate || null,
    })

  if (error) throw error
}


export async function getThirdParties():
Promise<ThirdParty[]> {
  const { data, error } = await client()
    .from('third_parties')
    .select('*')
    .order('risk_score', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    vendorCode:
      row.vendor_code,
    organizationId:
      row.organization_id,
    name: row.name,
    category:
      row.category ?? '',
    contactName:
      row.contact_name ?? '',
    email: row.email ?? '',
    country:
      row.country ?? '',
    criticality:
      row.criticality,
    riskScore:
      Number(row.risk_score),
    assessmentStatus:
      row.assessment_status,
    nextAssessmentDate:
      row.next_assessment_date,
  }))
}

export async function createThirdParty(
  input: {
    organizationId?: string | null
    name: string
    category?: string
    contactName?: string
    email?: string
    country?: string
    criticality: string
    riskScore: number
    nextAssessmentDate?: string | null
  }
) {
  const { error } = await client()
    .from('third_parties')
    .insert({
      vendor_code: '',
      organization_id:
        input.organizationId || null,
      name: input.name,
      category:
        input.category || null,
      contact_name:
        input.contactName || null,
      email:
        input.email || null,
      country:
        input.country || null,
      criticality:
        input.criticality,
      risk_score:
        input.riskScore,
      assessment_status:
        'pending',
      next_assessment_date:
        input.nextAssessmentDate ||
        null,
    })

  if (error) throw error
}


export async function getAuditIncidents():
Promise<AuditIncident[]> {
  const { data, error } = await client()
    .from('audit_incidents')
    .select('*')
    .order('detected_at', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    incidentCode:
      row.incident_code,
    auditId: row.audit_id,
    organizationId:
      row.organization_id,
    relatedTransactionId:
      row.related_transaction_id,
    title: row.title,
    description:
      row.description ?? '',
    category:
      row.category ?? '',
    severity:
      row.severity,
    status: row.status,
    ownerName:
      row.owner_name ?? '',
    detectedAt:
      row.detected_at,
    financialImpact:
      Number(
        row.financial_impact ?? 0
      ),
  }))
}

export async function createAuditIncident(
  input: {
    auditId?: string | null
    organizationId?: string | null
    relatedTransactionId?: string | null
    title: string
    description?: string
    category?: string
    severity: string
    ownerName?: string
    financialImpact?: number
  }
) {
  const { error } = await client()
    .from('audit_incidents')
    .insert({
      incident_code: '',
      audit_id:
        input.auditId || null,
      organization_id:
        input.organizationId || null,
      related_transaction_id:
        input.relatedTransactionId ||
        null,
      title: input.title,
      description:
        input.description || null,
      category:
        input.category || null,
      severity:
        input.severity,
      status: 'open',
      owner_name:
        input.ownerName || null,
      financial_impact:
        input.financialImpact ?? 0,
    })

  if (error) throw error
}
