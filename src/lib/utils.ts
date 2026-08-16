export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatRiskLevel(level: string): string {
  const labels: Record<string, string> = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  };

  return labels[level] ?? level;
}

export function formatAuditStatus(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    in_progress: 'En progreso',
    completed: 'Completada',
    archived: 'Archivada',
  };

  return labels[status] ?? status;
}
