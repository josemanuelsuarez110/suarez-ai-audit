export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Risk {
  id: string
  name: string
  description: string
  likelihood: number
  impact: number
  score: number
  level: RiskLevel
  mitigation?: string
}
