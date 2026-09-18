import { test } from 'node:test';
import assert from 'node:assert';

function calculateContractBilling(contract, monoProduction, colorProduction, adjustments = 0) {
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
    subtotal = monoProduction * contract.costPerMonoSurplus + colorProduction * contract.costPerColorSurplus;
  } else {
    subtotal = contract.monthlyFixedFee + monoSurplusTotal + colorSurplusTotal;
  }

  if (contract.costMinimum && subtotal < contract.costMinimum) {
    subtotal = contract.costMinimum;
  }

  return {
    monoSurplus,
    colorSurplus,
    monoSurplusTotal: Number(monoSurplusTotal.toFixed(2)),
    colorSurplusTotal: Number(colorSurplusTotal.toFixed(2)),
    totalAmount: Number((subtotal + adjustments).toFixed(2)),
  };
}

test('Faturamento Franquia: produção dentro da franquia não gera excedente', () => {
  const contract = {
    type: 'FRANQUIA',
    monthlyFixedFee: 4850.0,
    franchiseMonoPages: 40000,
    franchiseColorPages: 0,
    costPerMonoSurplus: 0.045,
    costPerColorSurplus: 0,
    costMinimum: 4850.0,
  };
  const result = calculateContractBilling(contract, 38000, 0);
  assert.strictEqual(result.monoSurplus, 0);
  assert.strictEqual(result.monoSurplusTotal, 0);
  assert.strictEqual(result.totalAmount, 4850.0);
});

test('Faturamento Franquia Excedente: calcula páginas adicionais multiplicadas pela tarifa', () => {
  const contract = {
    type: 'FRANQUIA',
    monthlyFixedFee: 4850.0,
    franchiseMonoPages: 40000,
    franchiseColorPages: 0,
    costPerMonoSurplus: 0.045,
    costPerColorSurplus: 0,
    costMinimum: 4850.0,
  };
  // 48.200 páginas produzidas: 8.200 excedentes * 0.045 = 369.00
  const result = calculateContractBilling(contract, 48200, 0);
  assert.strictEqual(result.monoSurplus, 8200);
  assert.strictEqual(result.monoSurplusTotal, 369.0);
  assert.strictEqual(result.totalAmount, 5219.0); // 4850 + 369 = 5219.00
});

test('Faturamento Híbrido com P&B e Colorido', () => {
  const contract = {
    type: 'HÍBRIDO',
    monthlyFixedFee: 2900.0,
    franchiseMonoPages: 10000,
    franchiseColorPages: 3000,
    costPerMonoSurplus: 0.05,
    costPerColorSurplus: 0.28,
    costMinimum: 2900.0,
  };
  // 11.400 mono (1.400 excedente * 0.05 = 70.00)
  // 3.850 color (850 excedente * 0.28 = 238.00)
  // Total = 2900 + 70 + 238 = 3208.00
  const result = calculateContractBilling(contract, 11400, 3850);
  assert.strictEqual(result.monoSurplus, 1400);
  assert.strictEqual(result.colorSurplus, 850);
  assert.strictEqual(result.monoSurplusTotal, 70.0);
  assert.strictEqual(result.colorSurplusTotal, 238.0);
  assert.strictEqual(result.totalAmount, 3208.0);
});
