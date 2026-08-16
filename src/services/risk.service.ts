import type { Risk, RiskLevel } from '../types/risk'

export function calculateRiskScore(
  likelihood: number,
  impact: number,
): number {
  return Math.max(0, Math.min(100, likelihood * impact))
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

export function createRisk(
  data: Omit<Risk, 'score' | 'level'>,
): Risk {
  const score = calculateRiskScore(data.likelihood, data.impact)

  return {
    ...data,
    score,
    level: getRiskLevel(score),
  }
}
