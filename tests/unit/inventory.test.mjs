import { test } from 'node:test';
import assert from 'node:assert';

function applyMovement(currentQuantity, minQuantity, type, quantity) {
  let newQty = currentQuantity;
  if (type === 'ENTRADA' || type === 'REPOSICAO' || type === 'DEVOLUCAO') {
    newQty += quantity;
  } else {
    newQty = Math.max(0, newQty - quantity);
  }
  const isBelowMin = newQty < minQuantity;
  return { newQty, isBelowMin };
}

test('Estoque: entrada aumenta o saldo físico', () => {
  const result = applyMovement(10, 5, 'ENTRADA', 15);
  assert.strictEqual(result.newQty, 25);
  assert.strictEqual(result.isBelowMin, false);
});

test('Estoque: saída que cruza o limite mínimo dispara flag de reposição', () => {
  const result = applyMovement(8, 6, 'CONSUMO', 4);
  assert.strictEqual(result.newQty, 4);
  assert.strictEqual(result.isBelowMin, true);
});
