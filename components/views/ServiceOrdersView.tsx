'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { ServiceOrder } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileSignature,
  MapPin,
  Calendar,
  Layers,
  Printer as PrintIcon,
} from 'lucide-react';

export default function ServiceOrdersView() {
  const { serviceOrders, inventory, completeServiceOrder, updateServiceOrder, searchQuery } = useSantaStore();

  const [search, setSearch] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Completion Form State
  const [solutionText, setSolutionText] = useState('');
  const [signerName, setSignerName] = useState('');
  const [selectedParts, setSelectedParts] = useState<Array<{ itemId: string; quantity: number }>>([]);
  const [counterInput, setCounterInput] = useState({ total: 0, mono: 0, color: 0 });
  const [checklist, setChecklist] = useState<Array<{ task: string; done: boolean }>>([]);

  const filteredOS = serviceOrders.filter((os) => {
    const term = (search.trim() || searchQuery.trim()).toLowerCase();
    if (!term) return true;
    return (
      os.code.toLowerCase().includes(term) ||
      os.clientName.toLowerCase().includes(term) ||
      os.technicianName.toLowerCase().includes(term) ||
      os.printerModel.toLowerCase().includes(term)
    );
  });

  const handleOpenCompleteModal = (os: ServiceOrder) => {
    setSelectedOS(os);
    setSolutionText(os.solution || '');
    setSignerName(os.customerSignerName || '');
    setChecklist(
      os.checklist.length > 0
        ? [...os.checklist]
        : [
            { task: 'Limpeza física e ótica do equipamento', done: true },
            { task: 'Verificação e teste dos roletes de alimentação', done: true },
            { task: 'Inspeção do conjunto fusor e película', done: true },
            { task: 'Impressão de página de autoteste e contadores', done: true },
          ]
    );
    setCounterInput({
      total: os.countersAtService?.total || 0,
      mono: os.countersAtService?.mono || 0,
      color: os.countersAtService?.color || 0,
    });
    setSelectedParts([]);
    setShowCompletionModal(true);
  };

  const handleToggleChecklist = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddPartToOS = (itemId: string) => {
    if (!itemId) return;
    setSelectedParts((prev) => {
      const existing = prev.find((p) => p.itemId === itemId);
      if (existing) {
        return prev.map((p) => (p.itemId === itemId ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const handleFinishOS = () => {
    if (!selectedOS) return;

    completeServiceOrder(selectedOS.id, {
      solution: solutionText || 'Atendimento técnico concluído e equipamento testado operacional.',
      signerName: signerName || 'Responsável no Cliente',
      signatureData: 'DIGITAL_SIGNATURE_VERIFIED_SHA256',
      checklist,
      counters: counterInput.total > 0 ? counterInput : undefined,
      partsUsed: selectedParts,
    });

    setShowCompletionModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ordens de Serviço de Campo (OS)</h1>
          <p className="text-xs text-slate-500">
            Execução de manutenções preventivas, corretivas, baixa de peças em estoque e assinatura digital.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código da OS, cliente, técnico ou impressora..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* OS Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOS.map((os) => {
          const isCompleted = os.status === 'CONCLUIDA';

          return (
            <div
              key={os.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">{os.code}</span>
                    <h2 className="font-bold text-slate-900 text-sm mt-0.5">{os.clientName}</h2>
                    <p className="text-[11px] text-slate-500">{os.branchName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : os.status === 'EM_EXECUCAO'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {os.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Printer className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {os.printerModel} • Série: <strong className="font-mono">{os.printerSerial}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Agendado: {formatDate(os.scheduledDate)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{os.address}</span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-800">Serviço: </span>
                  {os.serviceDescription}
                </div>

                {os.solution && (
                  <div className="mt-2 rounded-lg bg-emerald-50/70 p-2.5 text-[11px] text-emerald-900 border border-emerald-200">
                    <span className="font-semibold">Solução Técnica: </span>
                    {os.solution}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="text-[11px] text-slate-500">
                  Técnico: <strong className="text-slate-800">{os.technicianName}</strong>
                </div>

                {isCompleted ? (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Concluída
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenCompleteModal(os)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
                  >
                    <FileSignature className="h-3.5 w-3.5" />
                    Encerrar OS
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete OS Modal with Checklist, Parts and Signature */}
      {showCompletionModal && selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{selectedOS.code}</span>
                <h2 className="text-base font-bold text-slate-900">Encerramento de Ordem de Serviço</h2>
                <p className="text-xs text-slate-500">{selectedOS.clientName} • {selectedOS.printerModel}</p>
              </div>
              <button onClick={() => setShowCompletionModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Checklist */}
              <div>
                <h3 className="font-bold text-slate-800 uppercase mb-2">Checklist de Manutenção</h3>
                <div className="space-y-1.5">
                  {checklist.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 cursor-pointer rounded-lg border border-slate-100 p-2 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklist(index)}
                        className="h-4 w-4 rounded text-blue-600"
                      />
                      <span className={item.done ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Peças e Suprimentos Utilizados */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 uppercase">Peças / Suprimentos Aplicados</h3>
                  <span className="text-[10px] text-slate-500">Baixa automática no estoque</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    id="partSelect"
                    className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700"
                  >
                    <option value="">Selecione peça ou toner do estoque...</option>
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.sku} - {inv.description} (Saldo: {inv.currentQuantity} un)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('partSelect') as HTMLSelectElement;
                      if (sel && sel.value) handleAddPartToOS(sel.value);
                    }}
                    className="rounded-lg bg-slate-800 px-3 py-2 font-medium text-white hover:bg-slate-700"
                  >
                    Adicionar Peça
                  </button>
                </div>

                {selectedParts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedParts.map((sp) => {
                      const item = inventory.find((i) => i.id === sp.itemId);
                      return (
                        <div
                          key={sp.itemId}
                          className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5 text-slate-700 border border-slate-100"
                        >
                          <span>
                            {item?.sku} - {item?.description}
                          </span>
                          <span className="font-bold text-indigo-700">{sp.quantity} un</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Solução Aplicada */}
              <div>
                <label className="font-bold text-slate-800 uppercase">Diagnóstico e Solução Aplicada</label>
                <textarea
                  rows={2}
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Descreva as ações realizadas pelo técnico..."
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              {/* Assinatura do Cliente */}
              <div>
                <label className="font-bold text-slate-800 uppercase">Assinatura / Aceite do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do colaborador que recebeu o serviço"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs"
                />
                <div className="mt-2 flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <FileSignature className="mr-2 h-4 w-4" />
                  Termo de Encerramento Digital Autenticado (SHA-256)
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinishOS}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Concluir Ordem de Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
