import { test } from 'node:test';
import assert from 'node:assert';

function calculateSLA(openedAtISO, slaHours, currentTimestampISO) {
  const openTime = new Date(openedAtISO).getTime();
  const now = currentTimestampISO ? new Date(currentTimestampISO).getTime() : Date.now();
  const diffMs = Math.max(0, now - openTime);
  const elapsedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
  const remainingHours = Number(Math.max(0, slaHours - elapsedHours).toFixed(1));
  const percentConsumed = Math.min(100, Math.round((elapsedHours / slaHours) * 100));
  const isBreached = elapsedHours > slaHours;
  const isNearBreach = !isBreached && percentConsumed >= 75;

  return {
    elapsedHours,
    remainingHours: isBreached ? 0 : remainingHours,
    percentConsumed,
    isBreached,
    isNearBreach,
  };
}

test('SLA: dentro do prazo com consumo normal', () => {
  const opened = '2026-09-18T08:00:00Z';
  const now = '2026-09-18T09:00:00Z'; // 1h decorrida de 4h
  const sla = calculateSLA(opened, 4, now);
  assert.strictEqual(sla.elapsedHours, 1);
  assert.strictEqual(sla.remainingHours, 3);
  assert.strictEqual(sla.percentConsumed, 25);
  assert.strictEqual(sla.isBreached, false);
  assert.strictEqual(sla.isNearBreach, false);
});

test('SLA: alerta quando atinge mais de 75% do tempo estipulado', () => {
  const opened = '2026-09-18T08:00:00Z';
  const now = '2026-09-18T11:15:00Z'; // 3.25h decorridas de 4h = ~81%
  const sla = calculateSLA(opened, 4, now);
  assert.strictEqual(sla.isNearBreach, true);
  assert.strictEqual(sla.isBreached, false);
});

test('SLA: estouro de prazo após tempo limite esgotado', () => {
  const opened = '2026-09-18T08:00:00Z';
  const now = '2026-09-18T13:00:00Z'; // 5h decorridas de 4h
  const sla = calculateSLA(opened, 4, now);
  assert.strictEqual(sla.isBreached, true);
  assert.strictEqual(sla.remainingHours, 0);
});
