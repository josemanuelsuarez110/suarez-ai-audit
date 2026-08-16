export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Finding {
  id: string
  title: string
  description: string
  severity: FindingSeverity
  category: string
  recommendation: string
  status: 'open' | 'resolved' | 'accepted'
}
