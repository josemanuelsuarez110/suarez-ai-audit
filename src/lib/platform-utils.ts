export const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  open: 'Abierto',
  in_progress: 'En progreso',
  investigating: 'Investigando',
  blocked: 'Bloqueado',

  flagged: 'Marcado',
  reviewed: 'Revisado',
  approved: 'Aprobado',
  rejected: 'Rechazado',

  completed: 'Completado',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  cancelled: 'Cancelado',

  monitoring: 'Monitoreo',
  treated: 'Tratado',

  verified: 'Verificado',

  todo: 'Pendiente',

  not_assessed: 'No evaluado',
  compliant: 'Cumple',
  partial: 'Cumplimiento parcial',
  non_compliant: 'No cumple',
  not_applicable: 'No aplica',

  in_review: 'En revisión',
  restricted: 'Restringido',
}

export const priorityLabels: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
}

export function labelStatus(
  status?: string | null
): string {
  if (!status) return 'Sin estado'

  return (
    statusLabels[status] ??
    status
  )
}

export function labelPriority(
  value?: string | null
): string {
  if (!value) return 'Sin prioridad'

  return (
    priorityLabels[value] ??
    value
  )
}

export function formatPlatformDate(
  value?: string | null
): string {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString(
    'es-DO'
  )
}

export function isOverdue(
  value?: string | null
): boolean {
  if (!value) return false

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  return date.getTime() <
    Date.now()
}
