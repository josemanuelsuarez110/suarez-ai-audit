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
