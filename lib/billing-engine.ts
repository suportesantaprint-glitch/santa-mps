import { Contract, CounterValidationStatus, MeterReading, Printer } from './types';

/**
 * Regra de Ouro da Produção (README Seção 19 e 20):
 * Produção = contador atual - contador anterior
 * O sistema deve impedir automaticamente contador atual < contador anterior
 * sem registrar ocorrência de inconsistência.
 */
export function calculateProduction(
  currentCounter: number,
  previousCounter: number
): {
  production: number;
  isValid: boolean;
  validationStatus: CounterValidationStatus;
  inconsistencyReason?: string;
} {
  if (currentCounter < 0 || previousCounter < 0) {
    return {
      production: 0,
      isValid: false,
      validationStatus: 'INCONSISTENTE',
      inconsistencyReason: 'Contador negativo detectado.',
    };
  }

  if (currentCounter < previousCounter) {
    return {
      production: 0,
      isValid: false,
      validationStatus: 'INCONSISTENTE',
      inconsistencyReason: `Contador atual (${currentCounter}) menor que o anterior (${previousCounter}) - Possível troca de placa ou reinício não documentado.`,
    };
  }

  const diff = currentCounter - previousCounter;

  // Detecção de salto anormal: se a produção for superior a 150.000 páginas em uma única leitura
  if (diff > 150000) {
    return {
      production: diff,
      isValid: true,
      validationStatus: 'ATENÇÃO',
      inconsistencyReason: `Salto anormal de produção (${diff.toLocaleString('pt-BR')} páginas). Requer validação do gestor.`,
    };
  }

  return {
    production: diff,
    isValid: true,
    validationStatus: 'NORMAL',
  };
}

/**
 * Cálculo de Franquia, Excedente e Faturamento Mensal (README Seções 41 e 42):
 * Excedente = Math.max(0, Producao - Franquia)
 * Total = Valor Mensal + (Excedente P&B * Custo P&B) + (Excedente Color * Custo Color) + Acréscimos - Descontos
 */
export function calculateContractBilling(
  contract: Pick<
    Contract,
    'type' | 'monthlyFixedFee' | 'franchiseMonoPages' | 'franchiseColorPages' | 'costPerMonoSurplus' | 'costPerColorSurplus' | 'costMinimum'
  >,
  monoProduction: number,
  colorProduction: number,
  adjustments: number = 0
): {
  monoFranchise: number;
  colorFranchise: number;
  monoSurplus: number;
  colorSurplus: number;
  monoSurplusTotal: number;
  colorSurplusTotal: number;
  monthlyFixedFee: number;
  totalAmount: number;
} {
  const monoFranchise = contract.franchiseMonoPages || 0;
  const colorFranchise = contract.franchiseColorPages || 0;

  const monoSurplus = Math.max(0, monoProduction - monoFranchise);
  const colorSurplus = Math.max(0, colorProduction - colorFranchise);

  const monoSurplusTotal = monoSurplus * (contract.costPerMonoSurplus || 0);
  const colorSurplusTotal = colorSurplus * (contract.costPerColorSurplus || 0);

  let subtotal = 0;

  if (contract.type === 'LOCAÇÃO' || contract.type === 'MENSALIDADE') {
    subtotal = contract.monthlyFixedFee;
  } else if (contract.type === 'BILHETAGEM') {
    // Bilhetagem pura: paga por cada página
    subtotal = (monoProduction * contract.costPerMonoSurplus) + (colorProduction * contract.costPerColorSurplus);
  } else {
    // FRANQUIA, PÁGINA EXCEDENTE ou HÍBRIDO
    subtotal = contract.monthlyFixedFee + monoSurplusTotal + colorSurplusTotal;
  }

  // Garantir custo mínimo contratual
  if (contract.costMinimum && subtotal < contract.costMinimum) {
    subtotal = contract.costMinimum;
  }

  const totalAmount = Math.max(0, subtotal + adjustments);

  return {
    monoFranchise,
    colorFranchise,
    monoSurplus,
    colorSurplus,
    monoSurplusTotal: Number(monoSurplusTotal.toFixed(2)),
    colorSurplusTotal: Number(colorSurplusTotal.toFixed(2)),
    monthlyFixedFee: contract.monthlyFixedFee,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * Pendências de Fechamento (README Seção 44):
 * Detectar:
 * - impressora sem contador
 * - contador desatualizado (> 30 dias)
 * - contador inconsistente
 * Não permitir congelamento enquanto existirem pendências bloqueantes.
 */
export function checkClosingBlockers(
  printers: Printer[],
  meters: MeterReading[]
): {
  canFreeze: boolean;
  blockingIssues: Array<{ printerCode: string; clientName: string; reason: string }>;
} {
  const issues: Array<{ printerCode: string; clientName: string; reason: string }> = [];

  for (const printer of printers) {
    if (printer.status === 'DESCARTADA' || printer.status === 'EM_ESTOQUE') {
      continue;
    }

    if (!printer.lastCounters || printer.lastCounters.total === 0) {
      issues.push({
        printerCode: printer.code,
        clientName: printer.location || 'Cliente não atribuído',
        reason: 'Equipamento sem contador registrado no período.',
      });
      continue;
    }

    // Verificar se há leitura recente marcada como inconsistente
    const printerMeters = meters.filter((m) => m.printerId === printer.id);
    const hasInconsistent = printerMeters.some((m) => m.validationStatus === 'INCONSISTENTE');
    if (hasInconsistent) {
      issues.push({
        printerCode: printer.code,
        clientName: printer.location || 'Cliente',
        reason: 'Possui leituras com inconsistência grave pendente de aprovação.',
      });
    }
  }

  return {
    canFreeze: issues.length === 0,
    blockingIssues: issues,
  };
}

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}
