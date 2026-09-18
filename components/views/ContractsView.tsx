'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { Contract } from '@/lib/types';
import { formatBRL } from '@/lib/billing-engine';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Printer,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function ContractsView() {
  const { contracts, clients, printers, addContract } = useSantaStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Contract Form State
  const [contractForm, setContractForm] = useState({
    code: 'CTR-2026-0950',
    clientId: clients[0]?.id || '',
    type: 'FRANQUIA' as Contract['type'],
    billingPeriod: 'MENSAL',
    billingDay: 5,
    monthlyFixedFee: 3500,
    franchiseMonoPages: 25000,
    franchiseColorPages: 0,
    costPerMonoSurplus: 0.045,
    costPerColorSurplus: 0.28,
    costMinimum: 3500,
    slaResponseHours: 4,
    adjustmentIndex: 'IPCA',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2028-12-31',
    autoRenew: true,
  });

  const filteredContracts = contracts.filter((c) => {
    if (filterType !== 'ALL' && c.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.clientName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === contractForm.clientId);
    const clientPrinters = printers.filter((p) => p.clientId === contractForm.clientId);

    addContract({
      ...contractForm,
      clientName: client?.tradeName || 'Cliente',
      printerIds: clientPrinters.map((p) => p.id),
      status: 'ATIVO',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contratos & Franquias de Impressão</h1>
          <p className="text-xs text-slate-500">
            Regras de franquia de páginas, custo de excedentes, vigência e termos de faturamento.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Contrato
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código ou cliente..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 focus:outline-none"
        >
          <option value="ALL">Todas Modalidades</option>
          <option value="FRANQUIA">Franquia de Páginas</option>
          <option value="BILHETAGEM">Bilhetagem Pura (Custo por Página)</option>
          <option value="LOCAÇÃO">Locação Fixa</option>
          <option value="HÍBRIDO">Modelo Híbrido</option>
        </select>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContracts.map((ctr) => (
          <div
            key={ctr.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600">{ctr.code}</span>
                  <h2 className="font-bold text-slate-900 text-sm mt-0.5">{ctr.clientName}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {ctr.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Modalidade:</span>
                  <strong className="text-slate-800">{ctr.type}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mensalidade Fixa:</span>
                  <strong className="text-slate-900 font-mono">{formatBRL(ctr.monthlyFixedFee)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dia de Faturamento:</span>
                  <strong className="text-slate-800">Dia {ctr.billingDay} de cada mês</strong>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Franquia P&B:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {ctr.franchiseMonoPages ? `${ctr.franchiseMonoPages.toLocaleString('pt-BR')} pág` : 'Ilimitado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tarifa Excedente P&B:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatBRL(ctr.costPerMonoSurplus)} / pág
                  </span>
                </div>
                {ctr.franchiseColorPages !== undefined && ctr.franchiseColorPages > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Franquia Color:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {ctr.franchiseColorPages.toLocaleString('pt-BR')} pág
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarifa Excedente Color:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatBRL(ctr.costPerColorSurplus || 0)} / pág
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Printer className="h-3.5 w-3.5 text-blue-600" />
                <span>{ctr.printerIds.length} Equipamentos Vinculados</span>
              </div>
              <span>Reajuste: {ctr.adjustmentIndex}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateContract}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-900">Novo Contrato de Outsourcing</h2>
            <p className="text-xs text-slate-500">Configure as regras de bilhetagem e valores pactuados.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Código do Contrato</label>
                <input
                  type="text"
                  required
                  value={contractForm.code}
                  onChange={(e) => setContractForm({ ...contractForm, code: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Cliente</label>
                <select
                  value={contractForm.clientId}
                  onChange={(e) => setContractForm({ ...contractForm, clientId: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Modalidade</label>
                <select
                  value={contractForm.type}
                  onChange={(e) => setContractForm({ ...contractForm, type: e.target.value as Contract['type'] })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="FRANQUIA">Franquia com Excedente</option>
                  <option value="BILHETAGEM">Bilhetagem Pura</option>
                  <option value="LOCAÇÃO">Locação Fixa</option>
                  <option value="HÍBRIDO">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Mensalidade Fixa (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={contractForm.monthlyFixedFee}
                  onChange={(e) => setContractForm({ ...contractForm, monthlyFixedFee: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Franquia P&B (Páginas)</label>
                <input
                  type="number"
                  value={contractForm.franchiseMonoPages}
                  onChange={(e) => setContractForm({ ...contractForm, franchiseMonoPages: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Tarifa Excedente P&B (R$)</label>
                <input
                  type="number"
                  step="0.001"
                  value={contractForm.costPerMonoSurplus}
                  onChange={(e) => setContractForm({ ...contractForm, costPerMonoSurplus: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Franquia Color (Páginas)</label>
                <input
                  type="number"
                  value={contractForm.franchiseColorPages}
                  onChange={(e) => setContractForm({ ...contractForm, franchiseColorPages: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Tarifa Excedente Color (R$)</label>
                <input
                  type="number"
                  step="0.001"
                  value={contractForm.costPerColorSurplus}
                  onChange={(e) => setContractForm({ ...contractForm, costPerColorSurplus: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Dia Vencimento Fatura</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={contractForm.billingDay}
                  onChange={(e) => setContractForm({ ...contractForm, billingDay: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Índice Reajuste</label>
                <select
                  value={contractForm.adjustmentIndex}
                  onChange={(e) => setContractForm({ ...contractForm, adjustmentIndex: e.target.value as 'IPCA' })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="IPCA">IPCA</option>
                  <option value="IGP-M">IGP-M</option>
                  <option value="INPC">INPC</option>
                </select>
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
                Salvar Contrato
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
