import type { Audit, AuditFinding } from '../types/audit';

export const mockAudits: Audit[] = [
  {
    id: 'AUD-2026-001',
    name: 'Auditoría Integral de Seguridad',
    organization: 'Empresa Demo S.A.',
    type: 'Ciberseguridad',
    status: 'in_progress',
    riskLevel: 'high',
    progress: 78,
    findings: 14,
    criticalFindings: 2,
    startedAt: '2026-08-01',
    updatedAt: '2026-08-16',
  },
  {
    id: 'AUD-2026-002',
    name: 'Evaluación Financiera',
    organization: 'Corporación Example',
    type: 'Finanzas',
    status: 'completed',
    riskLevel: 'medium',
    progress: 100,
    findings: 8,
    criticalFindings: 0,
    startedAt: '2026-07-15',
    updatedAt: '2026-08-10',
  },
  {
    id: 'AUD-2026-003',
    name: 'Compliance & Governance',
    organization: 'Grupo Empresarial DR',
    type: 'Compliance',
    status: 'in_progress',
    riskLevel: 'medium',
    progress: 54,
    findings: 11,
    criticalFindings: 1,
    startedAt: '2026-08-05',
    updatedAt: '2026-08-15',
  },
];

export const mockFindings: AuditFinding[] = [
  {
    id: 'FND-001',
    auditId: 'AUD-2026-001',
    title: 'Credenciales administrativas sin MFA',
    description:
      'Se identificaron cuentas privilegiadas que no utilizan autenticación multifactor.',
    category: 'Identity & Access',
    riskLevel: 'critical',
    status: 'open',
    score: 9.4,
    recommendation:
      'Implementar MFA obligatorio para todas las cuentas privilegiadas.',
    createdAt: '2026-08-15',
  },
  {
    id: 'FND-002',
    auditId: 'AUD-2026-001',
    title: 'Política de contraseñas insuficiente',
    description:
      'La política actual no cumple con las mejores prácticas de seguridad.',
    category: 'Security Policy',
    riskLevel: 'high',
    status: 'investigating',
    score: 7.8,
    recommendation:
      'Actualizar la política de contraseñas y aplicar controles técnicos.',
    createdAt: '2026-08-14',
  },
  {
    id: 'FND-003',
    auditId: 'AUD-2026-003',
    title: 'Documentación de controles incompleta',
    description:
      'Algunos controles operativos carecen de evidencia documental suficiente.',
    category: 'Governance',
    riskLevel: 'medium',
    status: 'open',
    score: 5.6,
    recommendation:
      'Centralizar evidencias y establecer responsables por cada control.',
    createdAt: '2026-08-13',
  },
];
