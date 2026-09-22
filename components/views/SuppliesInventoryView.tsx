'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { InventoryItem, InventoryMovement } from '@/lib/types';
import { formatBRL } from '@/lib/billing-engine';
import { formatDateTime } from '@/lib/utils';
import {
  Boxes,
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  History,
  CheckCircle2,
  Package,
} from 'lucide-react';

export default function SuppliesInventoryView() {
  const { inventory, movements, registerStockMovement, addInventoryItem, searchQuery } = useSantaStore();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Movement Form State
  const [movementForm, setMovementForm] = useState({
    itemId: inventory[0]?.id || '',
    type: 'ENTRADA' as InventoryMovement['type'],
    quantity: 5,
    reason: '',
    technicianName: '',
  });

  // Add Item Form State
  const [itemForm, setItemForm] = useState({
    sku: '',
    description: '',
    category: 'TONER' as InventoryItem['category'],
    manufacturer: 'HP',
    compatibleModels: '',
    currentQuantity: 10,
    minQuantity: 5,
    maxQuantity: 50,
    unitCost: 150,
    locationWarehouse: 'Almoxarifado Matriz',
  });

  const filteredInventory = inventory.filter((item) => {
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    const term = (search.trim() || searchQuery.trim()).toLowerCase();
    if (term) {
      return (
        item.sku.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.manufacturer.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.itemId || movementForm.quantity <= 0) return;

    registerStockMovement({
      itemId: movementForm.itemId,
      type: movementForm.type,
      quantity: Number(movementForm.quantity),
      reason: movementForm.reason || 'Movimentação operacional de rotina',
      technicianName: movementForm.technicianName || undefined,
    });

    setShowMovementModal(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.sku || !itemForm.description) return;

    addInventoryItem({
      ...itemForm,
      compatibleModels: itemForm.compatibleModels,
      location: itemForm.locationWarehouse,
      unit: 'UN',
      supplier: 'Distribuidor Autorizado',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Suprimentos & Almoxarifado</h1>
          <p className="text-xs text-slate-500">
            Controle de saldo de toners, cilindros, fusores e peças sobressalentes com ponto de reposição.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <History className="h-3.5 w-3.5" />
            Histórico ({movements.length})
          </button>
          <button
            onClick={() => setShowMovementModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Lançar Movimento
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo SKU
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU, descrição do toner ou peça..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 focus:outline-none"
        >
          <option value="ALL">Todas as Categorias</option>
          <option value="TONER">Toners & Cartuchos</option>
          <option value="CILINDRO">Cilindros Fotocondutores</option>
          <option value="FUSOR">Unidades Fusoras</option>
          <option value="PECA">Peças Mecânicas (Roletes/Engrenagens)</option>
        </select>
      </div>

      {/* Main Stock Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">SKU / Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Modelos Compatíveis</th>
                <th className="px-4 py-3 text-center">Mín / Máx</th>
                <th className="px-4 py-3 text-center">Saldo Físico</th>
                <th className="px-4 py-3 text-right">Custo Unit.</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isBelowMin = item.currentQuantity < item.minQuantity;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900">{item.sku}</div>
                      <div className="text-slate-600 font-medium">{item.description}</div>
                      <div className="text-[10px] text-slate-400">{item.location || item.locationWarehouse || 'Almoxarifado'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      {Array.isArray(item.compatibleModels) ? (item.compatibleModels as string[]).join(', ') : item.compatibleModels}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 font-mono">
                      {item.minQuantity} / {item.maxQuantity} un
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono font-bold text-xs ${
                          isBelowMin
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isBelowMin && <AlertTriangle className="h-3 w-3 text-red-600" />}
                        {item.currentQuantity} un
                      </span>
                      {isBelowMin && (
                        <div className="text-[10px] font-semibold text-red-600 mt-0.5">Comprar Reposição</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatBRL(item.unitCost)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setMovementForm({ ...movementForm, itemId: item.id });
                          setShowMovementModal(true);
                        }}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Ajustar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRegisterMovement}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-900">Lançamento de Movimentação de Estoque</h2>
            <p className="text-xs text-slate-500">Entrada de compras, baixa de uso ou devolução.</p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Item / SKU</label>
                <select
                  value={movementForm.itemId}
                  onChange={(e) => setMovementForm({ ...movementForm, itemId: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.sku} - {i.description} (Saldo: {i.currentQuantity} un)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Tipo de Movimento</label>
                <select
                  value={movementForm.type}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, type: e.target.value as InventoryMovement['type'] })
                  }
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="ENTRADA">ENTRADA (Compra de Fornecedor / NF)</option>
                  <option value="CONSUMO">CONSUMO / SAÍDA (Atendimento Técnico / OS)</option>
                  <option value="DEVOLUCAO">DEVOLUÇÃO (Retorno ao Almoxarifado)</option>
                  <option value="AJUSTE">AJUSTE (Inventário Físico / Correção)</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Motivo / Justificativa</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Reposição de compras NF 19482"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Movement History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Livro de Movimentações de Estoque</h2>
                <p className="text-xs text-slate-500">Rastreabilidade completa de entradas e saídas físicas.</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto text-xs">
              {movements.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {m.type}: {m.quantity} un • {m.itemDescription}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Motivo: {m.reason} {m.technicianName && `(Técnico: ${m.technicianName})`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-slate-700 text-[11px]">
                      {m.previousQuantity} ➔ {m.newQuantity} un
                    </div>
                    <div className="text-[10px] text-slate-400">{formatDateTime(m.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddItem}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-900">Cadastrar Novo Item no Catálogo</h2>
            <p className="text-xs text-slate-500">Defina o SKU, compatibilidades e estoques de segurança.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Código SKU</label>
                <input
                  type="text"
                  required
                  placeholder="ex: TN-3472"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Categoria</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as InventoryItem['category'] })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="TONER">Toner</option>
                  <option value="CILINDRO">Cilindro</option>
                  <option value="FUSOR">Fusor</option>
                  <option value="PECA">Peça Mecânica</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="font-medium text-slate-700">Descrição Completa</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Cartucho de Toner Preto Alto Rendimento 12.000 pág"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div className="col-span-2">
                <label className="font-medium text-slate-700">Modelos Compatíveis (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="ex: Kyocera M3655idn, Brother L6902DW"
                  value={itemForm.compatibleModels}
                  onChange={(e) => setItemForm({ ...itemForm, compatibleModels: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Saldo Inicial</label>
                <input
                  type="number"
                  value={itemForm.currentQuantity}
                  onChange={(e) => setItemForm({ ...itemForm, currentQuantity: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Estoque Mínimo (Alerta)</label>
                <input
                  type="number"
                  value={itemForm.minQuantity}
                  onChange={(e) => setItemForm({ ...itemForm, minQuantity: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Salvar SKU
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
