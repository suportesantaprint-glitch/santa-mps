import { test } from 'node:test';
import assert from 'node:assert';

function calculateProduction(currentCounter, previousCounter) {
  if (currentCounter < 0 || previousCounter < 0) {
    return { production: 0, isValid: false, validationStatus: 'INCONSISTENTE' };
  }
  if (currentCounter < previousCounter) {
    return {
      production: 0,
      isValid: false,
      validationStatus: 'INCONSISTENTE',
      inconsistencyReason: 'Contador atual menor que anterior',
    };
  }
  const diff = currentCounter - previousCounter;
  if (diff > 150000) {
    return {
      production: diff,
      isValid: true,
      validationStatus: 'ATENÇÃO',
    };
  }
  return {
    production: diff,
    isValid: true,
    validationStatus: 'NORMAL',
  };
}

test('Produção de Contador: diferença normal entre leituras sucessivas', () => {
  const result = calculateProduction(150000, 140000);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.production, 10000);
  assert.strictEqual(result.validationStatus, 'NORMAL');
});

test('Detecção de Inconsistência: impede contador atual menor que anterior (Rollback)', () => {
  const result = calculateProduction(135000, 140000);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.production, 0);
  assert.strictEqual(result.validationStatus, 'INCONSISTENTE');
});

test('Detecção de Salto Anormal: leitura superior a 150k páginas sinaliza ATENÇÃO', () => {
  const result = calculateProduction(360000, 150000);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.production, 210000);
  assert.strictEqual(result.validationStatus, 'ATENÇÃO');
});
