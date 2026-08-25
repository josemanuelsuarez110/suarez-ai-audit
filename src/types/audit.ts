export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type AuditStatus =
  | 'draft'
  | 'in_progress'
  | 'completed'

export type FindingStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'accepted'

export interface AuditFinding {
  id: string
  findingCode: string
  auditId: string
  title: string
  description: string
  category: string
  riskLevel: RiskLevel
  status: FindingStatus
  score: number
  recommendation: string
  createdAt: string
}

export interface Audit {
  id: string
  auditCode: string
  organizationId: string
  name: string
  organization: string
  type: string
  status: AuditStatus
  riskLevel: RiskLevel
  progress: number
  score: number | null
  scope: string
  objectives: string
  methodology: string
  findings: number
  criticalFindings: number
  startedAt: string
  updatedAt: string
}
