import { supabase } from '../lib/supabase'
import type { Audit, AuditFinding } from '../types/audit'

export interface AuditReportSummary {
  totalFindings: number
  criticalFindings: number
  highFindings: number
  totalRisks: number
}

export function buildAuditSummary(
  audit: Audit,
  findings: AuditFinding[] = [],
): AuditReportSummary {
  const auditFindings = findings.filter(
    (finding) => finding.auditId === audit.id,
  )

  return {
    totalFindings: audit.findings,
    criticalFindings: audit.criticalFindings,
    highFindings: auditFindings.filter(
      (finding) => finding.riskLevel === 'high',
    ).length,
    totalRisks: auditFindings.length,
  }
}


export interface ExecutiveAuditReport {
  audit: Audit
  findings: AuditFinding[]
  executiveSummary: string
  conclusion: string
  actionPlan: AuditFinding[]
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    open: number
    investigating: number
    resolved: number
    accepted: number
    averageScore: number
  }
}

export function buildExecutiveAuditReport(
  audit: Audit,
  findings: AuditFinding[],
): ExecutiveAuditReport {
  const auditFindings = findings.filter(
    (finding) => finding.auditId === audit.id,
  )

  const totalScore = auditFindings.reduce(
    (total, finding) => total + finding.score,
    0,
  )

  const critical = auditFindings.filter(
    (finding) => finding.riskLevel === 'critical',
  ).length

  const high = auditFindings.filter(
    (finding) => finding.riskLevel === 'high',
  ).length

  const unresolved = auditFindings.filter(
    (finding) =>
      finding.status === 'open' ||
      finding.status === 'investigating',
  ).length

  const executiveSummary =
    auditFindings.length === 0
      ? `La auditoría ${audit.auditCode} no presenta hallazgos registrados actualmente.`
      : `La auditoría ${audit.auditCode} presenta ${auditFindings.length} hallazgo(s), con ${critical} crítico(s) y ${high} de riesgo alto. ` +
        `${unresolved} hallazgo(s) permanecen abiertos o bajo investigación. ` +
        `El progreso general de la auditoría es de ${audit.progress}% y su clasificación global de riesgo es ${audit.riskLevel}.`

  const conclusion =
    critical > 0
      ? 'Se requiere atención inmediata sobre los hallazgos críticos antes del cierre de la auditoría.'
      : high > 0
        ? 'La auditoría presenta riesgos relevantes que requieren planes de remediación y seguimiento.'
        : auditFindings.length > 0
          ? 'Los hallazgos identificados presentan un nivel de exposición controlable mediante las acciones recomendadas.'
          : 'No existen hallazgos registrados que impidan el cierre técnico de la auditoría.'

  const priorityOrder = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  const actionPlan = [...auditFindings]
    .filter(
      (finding) =>
        finding.status !== 'resolved' &&
        finding.status !== 'accepted',
    )
    .sort(
      (a, b) =>
        priorityOrder[b.riskLevel] -
        priorityOrder[a.riskLevel],
    )

  return {
    audit,
    findings: auditFindings,
    executiveSummary,
    conclusion,
    actionPlan,
    summary: {
      total: auditFindings.length,

      critical: auditFindings.filter(
        (finding) => finding.riskLevel === 'critical',
      ).length,

      high: auditFindings.filter(
        (finding) => finding.riskLevel === 'high',
      ).length,

      medium: auditFindings.filter(
        (finding) => finding.riskLevel === 'medium',
      ).length,

      low: auditFindings.filter(
        (finding) => finding.riskLevel === 'low',
      ).length,

      open: auditFindings.filter(
        (finding) => finding.status === 'open',
      ).length,

      investigating: auditFindings.filter(
        (finding) => finding.status === 'investigating',
      ).length,

      resolved: auditFindings.filter(
        (finding) => finding.status === 'resolved',
      ).length,

      accepted: auditFindings.filter(
        (finding) => finding.status === 'accepted',
      ).length,

      averageScore:
        auditFindings.length > 0
          ? Number(
              (totalScore / auditFindings.length).toFixed(1)
            )
          : 0,
    },
  }
}


export type ReportStatus =
  | 'draft'
  | 'generated'
  | 'approved'

export interface StoredReport {
  id: string
  reportCode: string
  auditId: string
  title: string
  executiveSummary: string
  conclusion: string
  status: ReportStatus
  auditorName: string
  approverName: string
  generatedAt: string | null
  approvedAt: string | null
  totalFindings: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  auditScore: number | null
}

export type SaveReportInput = {
  audit: Audit
  findings: AuditFinding[]
  auditorName?: string
}

export async function saveReportDraft(
  input: SaveReportInput
): Promise<StoredReport> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const report = buildExecutiveAuditReport(
    input.audit,
    input.findings
  )

  const { data, error } = await supabase
    .from('reports')
    .insert({
      report_code: null,
      audit_id: input.audit.id,
      title: `Informe Ejecutivo - ${input.audit.auditCode}`,
      executive_summary: report.executiveSummary,
      conclusion: report.conclusion,
      total_findings: report.summary.total,
      critical_findings: report.summary.critical,
      high_findings: report.summary.high,
      medium_findings: report.summary.medium,
      low_findings: report.summary.low,
      total_risks: report.summary.total,
      audit_score:
        input.audit.score ?? report.summary.averageScore,
      status: 'draft',
      auditor_name: input.auditorName?.trim() || null,
    })
    .select(`
      id,
      report_code,
      audit_id,
      title,
      executive_summary,
      conclusion,
      status,
      auditor_name,
      approver_name,
      generated_at,
      approved_at,
      total_findings,
      critical_findings,
      high_findings,
      medium_findings,
      low_findings,
      audit_score
    `)
    .single()

  if (error) {
    throw new Error(
      [error.code, error.message, error.details, error.hint]
        .filter(Boolean)
        .join(' | ')
    )
  }

  return mapStoredReport(data)
}

export async function generateStoredReport(
  id: string,
  userId: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase
    .from('reports')
    .update({
      status: 'generated',
      generated_at: new Date().toISOString(),
      generated_by: userId,
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function approveStoredReport(
  id: string,
  _userId: string,
  approverName: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase.rpc(
    'approve_report',
    {
      p_report_id: id,
      p_approver_name: approverName,
    }
  )

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

export async function getReports(): Promise<StoredReport[]> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('reports')
    .select(`
      id,
      report_code,
      audit_id,
      title,
      executive_summary,
      conclusion,
      status,
      auditor_name,
      approver_name,
      generated_at,
      approved_at,
      total_findings,
      critical_findings,
      high_findings,
      medium_findings,
      low_findings,
      audit_score
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapStoredReport)
}

function mapStoredReport(row: any): StoredReport {
  return {
    id: row.id,
    reportCode: row.report_code,
    auditId: row.audit_id,
    title: row.title,
    executiveSummary: row.executive_summary ?? '',
    conclusion: row.conclusion ?? '',
    status: row.status,
    auditorName: row.auditor_name ?? '',
    approverName: row.approver_name ?? '',
    generatedAt: row.generated_at,
    approvedAt: row.approved_at,
    totalFindings: row.total_findings,
    criticalFindings: row.critical_findings,
    highFindings: row.high_findings,
    mediumFindings: row.medium_findings,
    lowFindings: row.low_findings,
    auditScore:
      row.audit_score === null ? null : Number(row.audit_score),
  }
}
