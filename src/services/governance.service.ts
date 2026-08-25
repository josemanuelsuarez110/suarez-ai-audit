import { supabase } from '../lib/supabase'

export interface Evidence {
  id: string
  evidenceCode: string
  auditId: string | null
  findingId: string | null
  title: string
  description: string
  evidenceType: string
  source: string
  fileUrl: string
  reference: string
  status: string
  createdAt: string
}

export interface RemediationPlan {
  id: string
  remediationCode: string
  findingId: string
  title: string
  description: string
  ownerName: string
  priority: string
  status: string
  targetDate: string | null
  completionPercentage: number
}

export interface AuditTask {
  id: string
  taskCode: string
  auditId: string | null
  findingId: string | null
  title: string
  description: string
  assignedName: string
  priority: string
  status: string
  dueDate: string | null
}

export interface ComplianceControl {
  id: string
  controlCode: string
  auditId: string | null
  framework: string
  controlReference: string
  title: string
  description: string
  status: string
  complianceScore: number
  evidenceRequired: boolean
}

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado.'
    )
  }

  return supabase
}

export async function getEvidence():
Promise<Evidence[]> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('audit_evidence')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    evidenceCode: row.evidence_code,
    auditId: row.audit_id,
    findingId: row.finding_id,
    title: row.title,
    description: row.description ?? '',
    evidenceType: row.evidence_type,
    source: row.source ?? '',
    fileUrl: row.file_url ?? '',
    reference: row.reference ?? '',
    status: row.status,
    createdAt: row.created_at,
  }))
}

export async function createEvidence(
  input: Omit<
    Evidence,
    'id' |
    'evidenceCode' |
    'createdAt'
  >
) {
  const client = requireSupabase()

  const { error } = await client
    .from('audit_evidence')
    .insert({
      evidence_code: '',
      audit_id: input.auditId || null,
      finding_id: input.findingId || null,
      title: input.title,
      description: input.description || null,
      evidence_type: input.evidenceType,
      source: input.source || null,
      file_url: input.fileUrl || null,
      reference: input.reference || null,
      status: input.status,
    })

  if (error) throw error
}

export async function getRemediationPlans():
Promise<RemediationPlan[]> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('remediation_plans')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    remediationCode:
      row.remediation_code,
    findingId: row.finding_id,
    title: row.title,
    description: row.description ?? '',
    ownerName: row.owner_name ?? '',
    priority: row.priority,
    status: row.status,
    targetDate: row.target_date,
    completionPercentage:
      row.completion_percentage ?? 0,
  }))
}

export async function createRemediationPlan(
  input: Omit<
    RemediationPlan,
    'id' |
    'remediationCode'
  >
) {
  const client = requireSupabase()

  const { error } = await client
    .from('remediation_plans')
    .insert({
      remediation_code: '',
      finding_id: input.findingId,
      title: input.title,
      description:
        input.description || null,
      owner_name:
        input.ownerName || null,
      priority: input.priority,
      status: input.status,
      target_date:
        input.targetDate || null,
      completion_percentage:
        input.completionPercentage,
    })

  if (error) throw error
}

export async function getAuditTasks():
Promise<AuditTask[]> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('audit_tasks')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    taskCode: row.task_code,
    auditId: row.audit_id,
    findingId: row.finding_id,
    title: row.title,
    description: row.description ?? '',
    assignedName:
      row.assigned_name ?? '',
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
  }))
}

export async function createAuditTask(
  input: Omit<
    AuditTask,
    'id' |
    'taskCode'
  >
) {
  const client = requireSupabase()

  const { error } = await client
    .from('audit_tasks')
    .insert({
      task_code: '',
      audit_id: input.auditId || null,
      finding_id: input.findingId || null,
      title: input.title,
      description:
        input.description || null,
      assigned_name:
        input.assignedName || null,
      priority: input.priority,
      status: input.status,
      due_date:
        input.dueDate || null,
    })

  if (error) throw error
}

export async function getComplianceControls():
Promise<ComplianceControl[]> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('compliance_controls')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    controlCode: row.control_code,
    auditId: row.audit_id,
    framework: row.framework,
    controlReference:
      row.control_reference ?? '',
    title: row.title,
    description:
      row.description ?? '',
    status: row.status,
    complianceScore:
      Number(row.compliance_score ?? 0),
    evidenceRequired:
      row.evidence_required,
  }))
}

export async function createComplianceControl(
  input: Omit<
    ComplianceControl,
    'id' |
    'controlCode'
  >
) {
  const client = requireSupabase()

  const { error } = await client
    .from('compliance_controls')
    .insert({
      control_code: '',
      audit_id:
        input.auditId || null,
      framework: input.framework,
      control_reference:
        input.controlReference || null,
      title: input.title,
      description:
        input.description || null,
      status: input.status,
      compliance_score:
        input.complianceScore,
      evidence_required:
        input.evidenceRequired,
    })

  if (error) throw error
}
