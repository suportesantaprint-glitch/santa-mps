import { TicketPriority } from './types';

export interface SLACalculation {
  slaHours: number;
  elapsedHours: number;
  remainingHours: number;
  percentConsumed: number;
  isBreached: boolean;
  isNearBreach: boolean;
  statusLabel: 'DENTRO DO PRAZO' | 'PRÓXIMO DO LIMITE' | 'SLA ESTOURADO';
  badgeColor: string;
}

export function getDefaultSLAHoursByPriority(priority: TicketPriority): number {
  switch (priority) {
    case 'CRITICA':
      return 4;
    case 'ALTA':
      return 8;
    case 'NORMAL':
      return 24;
    case 'BAIXA':
      return 48;
    default:
      return 24;
  }
}

export function calculateSLA(
  openedAtISO: string,
  slaHours: number,
  currentTimestampISO?: string
): SLACalculation {
  const openTime = new Date(openedAtISO).getTime();
  const now = currentTimestampISO ? new Date(currentTimestampISO).getTime() : Date.now();

  const diffMs = Math.max(0, now - openTime);
  const elapsedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
  const remainingHours = Number(Math.max(0, slaHours - elapsedHours).toFixed(1));

  const percentConsumed = Math.min(100, Math.round((elapsedHours / slaHours) * 100));
  const isBreached = elapsedHours > slaHours;
  const isNearBreach = !isBreached && percentConsumed >= 75;

  let statusLabel: 'DENTRO DO PRAZO' | 'PRÓXIMO DO LIMITE' | 'SLA ESTOURADO' = 'DENTRO DO PRAZO';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (isBreached) {
    statusLabel = 'SLA ESTOURADO';
    badgeColor = 'text-red-700 bg-red-50 border-red-200';
  } else if (isNearBreach) {
    statusLabel = 'PRÓXIMO DO LIMITE';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  return {
    slaHours,
    elapsedHours,
    remainingHours: isBreached ? 0 : remainingHours,
    percentConsumed,
    isBreached,
    isNearBreach,
    statusLabel,
    badgeColor,
  };
}
