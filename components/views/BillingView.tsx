'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { Invoice } from '@/lib/types';
import { formatBRL } from '@/lib/billing-engine';
import { formatDate } from '@/lib/utils';
import {
  DollarSign,
  Play,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  Printer,
} from 'lucide-react';

export default function BillingView() {
  const { invoices, generateMonthlyClosing, freezeMonthlyInvoices, syncWithOracle } = useSantaStore();

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [closingResult, setClosingResult] = useState<{
    canFreeze: boolean;
    blockers: string[];
    invoicesGenerated: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const monthInvoices = invoices.filter((inv) => inv.periodMonth === selectedMonth);
  const allFrozen = monthInvoices.length > 0 && monthInvoices.every((inv) => inv.isFrozen);
  const totalBilled = monthInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  const handleRunClosing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = generateMonthlyClosing(selectedMonth);
      setClosingResult(result);
      setIsProcessing(false);
    }, 400);
  };

  const handleFreeze = () => {
    freezeMonthlyInvoices(selectedMonth);
    setClosingResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Faturamento & Fechamento de Ciclo</h1>
          <p className="text-xs text-slate-500">
            Regra de ouro: Produção = Leitura Atual - Leitura Anterior. Bloqueios de consistência e congelamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setClosingResult(null);
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800"
          >
            <option value="2026-09">Competência 2026-09 (Setembro)</option>
            <option value="2026-08">Competência 2026-08 (Agosto)</option>
            <option value="2026-07">Competência 2026-07 (Julho)</option>
          </select>

          <button
            onClick={handleRunClosing}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Processar Fechamento
          </button>

          {monthInvoices.length > 0 && !allFrozen && (
            <button
              onClick={handleFreeze}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
            >
              <Lock className="h-3.5 w-3.5" />
              Congelar & Homologar Faturas
            </button>
          )}
        </div>
      </div>

      {/* Closing Feedback / Blockers */}
      {closingResult && (
        <div
          className={`rounded-xl border p-4 text-xs ${
            closingResult.canFreeze
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {closingResult.canFreeze ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pré-fechamento concluído com sucesso ({closingResult.invoicesGenerated} faturas apuradas)
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Bloqueio de Fechamento: Existem pendências de contadores que impedem a homologação
              </>
            )}
          </div>
          {!closingResult.canFreeze && (
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {closingResult.blockers.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Financial Overview KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase">Faturamento do Mês</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono">{formatBRL(totalBilled)}</div>
          <p className="mt-1 text-[11px] text-slate-400">{monthInvoices.length} faturas emitidas no período</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase">Status do Ciclo</span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                allFrozen
                  ? 'bg-emerald-100 text-emerald-800'
                  : monthInvoices.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {allFrozen ? 'CONGELADO & HOMOLOGADO' : monthInvoices.length > 0 ? 'EM CONFERÊNCIA' : 'NÃO INICIADO'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {allFrozen ? 'Faturas travadas contra alterações posteriores' : 'Aguardando validação do faturista'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase">ERP Corporativo</span>
          <div className="mt-1 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Integrado ao Oracle ERP 19c
          </div>
          <button
            onClick={() => syncWithOracle()}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
          >
            Sincronizar Lote Financeiro ➔
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Fatura / Contrato</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Produção P&B / Franquia</th>
                <th className="px-4 py-3">Excedente Faturado</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhuma fatura encontrada para esta competência. Clique em &quot;Processar Fechamento&quot; acima.
                  </td>
                </tr>
              ) : (
                monthInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900">{inv.code}</div>
                      <div className="text-[11px] text-slate-500">{inv.contractCode}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{inv.clientName}</td>
                    <td className="px-4 py-3 font-mono">
                      {inv.monoProduction.toLocaleString('pt-BR')} /{' '}
                      {inv.monoFranchise > 0 ? `${inv.monoFranchise.toLocaleString('pt-BR')}` : 'Sem'} pág
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {inv.monoSurplus > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          +{inv.monoSurplus.toLocaleString('pt-BR')} pág ({formatBRL(inv.monoSurplusTotal)})
                        </span>
                      ) : (
                        <span className="text-slate-400">Sem excedente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatBRL(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === 'PAGA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'FATURADA'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Demonstrativo
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail / Statement Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{selectedInvoice.code}</span>
                <h2 className="text-base font-bold text-slate-900">Demonstrativo de Bilhetagem & Locação</h2>
                <p className="text-xs text-slate-500">{selectedInvoice.clientName}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Competência:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.periodLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data de Vencimento:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(selectedInvoice.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contrato Vinculado:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedInvoice.contractCode}</span>
                </div>
              </div>

              {/* Memory of calculation */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Locação / Mensalidade Fixa de Franquia:</span>
                  <span className="font-mono font-medium">{formatBRL(selectedInvoice.monthlyFixedFee)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Produção Monocromática Apurada:</span>
                  <span className="font-mono">{selectedInvoice.monoProduction.toLocaleString('pt-BR')} páginas</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Franquia Contratada P&B:</span>
                  <span className="font-mono">{selectedInvoice.monoFranchise.toLocaleString('pt-BR')} páginas</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Excedente P&B Apurado:</span>
                  <span className="font-mono font-semibold text-amber-800">
                    {selectedInvoice.monoSurplus.toLocaleString('pt-BR')} páginas = {formatBRL(selectedInvoice.monoSurplusTotal)}
                  </span>
                </div>

                {selectedInvoice.colorSurplus > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Excedente Colorido:</span>
                    <span className="font-mono font-semibold text-blue-800">
                      {selectedInvoice.colorSurplus.toLocaleString('pt-BR')} páginas = {formatBRL(selectedInvoice.colorSurplusTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total a Faturar:</span>
                  <span className="font-mono text-emerald-600">{formatBRL(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir Fatura
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
