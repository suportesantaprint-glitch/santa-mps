import { test } from 'node:test';
import assert from 'node:assert';

const PERMISSIONS = {
  ADMIN: ['ALL'],
  GESTOR: ['DASHBOARD', 'FINANCEIRO', 'CONTRATOS', 'CLIENTES', 'OPERACAO'],
  GERENCIA: ['DASHBOARD', 'EQUIPE', 'CLIENTES', 'CONTRATOS', 'CHAMADOS', 'OS', 'RELATORIOS'],
  SUPORTE: ['CHAMADOS', 'IMPRESSORAS', 'CLIENTES', 'OS'],
  TECNICO: ['MINHAS_ATIVIDADES', 'ROTAS', 'OS'],
  FATURAMENTO: ['CONTRATOS', 'CONTADORES', 'PRODUCAO', 'FECHAMENTO', 'FATURAMENTO', 'RELATORIOS_FIN'],
  SUPRIMENTOS: ['ESTOQUE', 'TONER', 'PECAS', 'REQUISICOES'],
  ESTOQUISTA: ['ESTOQUE_OPERACIONAL'],
  CLIENTE: ['PORTAL_CLIENTE'],
};

function hasPermission(role, module) {
  const perms = PERMISSIONS[role] || [];
  if (perms.includes('ALL')) return true;
  return perms.includes(module);
}

test('Permissões: Administrador possui acesso irrestrito', () => {
  assert.strictEqual(hasPermission('ADMIN', 'FATURAMENTO'), true);
  assert.strictEqual(hasPermission('ADMIN', 'ROTAS'), true);
  assert.strictEqual(hasPermission('ADMIN', 'ANYTHING'), true);
});

test('Permissões: Técnico acessa somente OS e Rotas, sem acesso ao Faturamento', () => {
  assert.strictEqual(hasPermission('TECNICO', 'OS'), true);
  assert.strictEqual(hasPermission('TECNICO', 'ROTAS'), true);
  assert.strictEqual(hasPermission('TECNICO', 'FATURAMENTO'), false);
});

test('Permissões: Cliente tem acesso isolado ao Portal do Cliente', () => {
  assert.strictEqual(hasPermission('CLIENTE', 'PORTAL_CLIENTE'), true);
  assert.strictEqual(hasPermission('CLIENTE', 'ESTOQUE'), false);
  assert.strictEqual(hasPermission('CLIENTE', 'FECHAMENTO'), false);
});
