'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { Printer, PrinterStatus } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Printer as PrinterIcon,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  HardDrive,
  Activity,
  Layers,
} from 'lucide-react';

export default function PrintersView() {
  const { printers, clients, registerMeterReading, simulateAgentCollection, addPrinter } = useSantaStore();

  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [filterClient, setFilterClient] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTech, setFilterTech] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterInput, setCounterInput] = useState({
    total: 0,
    mono: 0,
    color: 0,
  });
  const [counterFeedback, setCounterFeedback] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(
    null
  );

  // New Printer Form State
  const [newPrinterData, setNewPrinterData] = useState({
    code: '',
    serialNumber: '',
    assetTag: '',
    manufacturer: 'HP',
    model: '',
    ipAddress: '192.168.1.',
    macAddress: '00:11:22:33:44:55',
    hostname: '',
    location: '',
    clientId: clients[0]?.id || '',
    branchId: clients[0]?.branches[0]?.id || '',
    departmentId: clients[0]?.departments[0]?.id || '',
    type: 'MULTIFUNCIONAL' as const,
    technology: 'LASER' as const,
    isColor: false,
    maxPaperSize: 'A4' as const,
    connectionType: 'REDE' as const,
    status: 'ATIVA' as PrinterStatus,
    isMonitored: true,
  });

  const filteredPrinters = printers.filter((p) => {
    if (filterClient !== 'ALL' && p.clientId !== filterClient) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (filterTech !== 'ALL' && p.technology !== filterTech) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.serialNumber.toLowerCase().includes(q) ||
        p.ipAddress.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCounterModal = (p: Printer) => {
    setSelectedPrinter(p);
    setCounterInput({
      total: p.lastCounters?.total || 0,
      mono: p.lastCounters?.mono || 0,
      color: p.lastCounters?.color || 0,
    });
    setCounterFeedback(null);
    setShowCounterModal(true);
  };

  const handleSaveCounter = () => {
    if (!selectedPrinter) return;
    const result = registerMeterReading({
      printerId: selectedPrinter.id,
      counterTotal: Number(counterInput.total),
      counterMono: Number(counterInput.mono),
      counterColor: Number(counterInput.color),
      source: 'MANUAL',
    });

    if (result.success) {
      if (result.validationStatus === 'ATENÇÃO') {
        setCounterFeedback({
          msg: `Leitura registrada com alerta: ${result.inconsistencyReason}`,
          type: 'warning',
        });
      } else {
        setCounterFeedback({
          msg: `Contador salvo com sucesso! Produção calculada: ${result.productionTotal} páginas.`,
          type: 'success',
        });
      }
    } else {
      setCounterFeedback({
        msg: `BLOQUEIO DE INCONSISTÊNCIA: ${result.inconsistencyReason}`,
        type: 'error',
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Código', 'Fabricante', 'Modelo', 'Número de Série', 'Patrimônio', 'IP', 'Status', 'Contador Total', 'Cliente'];
    const rows = filteredPrinters.map((p) => {
      const client = clients.find((c) => c.id === p.clientId);
      return [
        p.code,
        p.manufacturer,
        `"${p.model}"`,
        p.serialNumber,
        p.assetTag,
        p.ipAddress,
        p.status,
        p.lastCounters?.total || 0,
        `"${client?.tradeName || p.location}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parque_impressoras_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterData.model || !newPrinterData.serialNumber) return;

    addPrinter({
      ...newPrinterData,
      installedAt: new Date().toISOString(),
      lastCommunication: new Date().toISOString(),
      supplies: [
        {
          type: 'TONER_BLACK',
          label: 'Toner Preto Original',
          percent: 100,
          status: 'NORMAL',
          estimatedPagesRemaining: 5000,
          model: 'OEM-BK',
          colorCode: '#1e293b',
        },
      ],
      lastCounters: {
        total: 0,
        mono: 0,
        color: 0,
        prints: 0,
        copies: 0,
        scans: 0,
        readAt: new Date().toISOString(),
      },
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Parque de Impressoras</h1>
          <p className="text-xs text-slate-500">
            Gerenciamento de {printers.length} equipamentos contratados, telemetria SNMP e suprimentos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={() => simulateAgentCollection()}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Coletar SNMP Geral
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Equipamento
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
            placeholder="Buscar por modelo, série, IP ou localização..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Cliente */}
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradeName}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ATIVA">ATIVA</option>
            <option value="OFFLINE">OFFLINE</option>
            <option value="EM_MANUTENÇÃO">EM MANUTENÇÃO</option>
            <option value="EM_ESTOQUE">EM ESTOQUE</option>
          </select>

          {/* Tecnologia */}
          <select
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todas Tecnologias</option>
            <option value="LASER">Laser</option>
            <option value="TANQUE_TINTA">Tanque de Tinta</option>
            <option value="CERA">Cera</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Código / Modelo</th>
                <th className="px-4 py-3">Cliente / Localização</th>
                <th className="px-4 py-3">IP / Rede</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Suprimentos</th>
                <th className="px-4 py-3 text-right">Contador Total</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrinters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum equipamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPrinters.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId);
                  const isBlackTonerLow = p.supplies.some(
                    (s) => s.type === 'TONER_BLACK' && (s.status === 'CRÍTICO' || s.status === 'BAIXO')
                  );

                  return (
                    <tr key={p.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.model}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.code} • Série: <span className="font-mono">{p.serialNumber}</span> • Pat: {p.assetTag}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{client?.tradeName || 'Avulsa'}</div>
                        <div className="text-[11px] text-slate-500">{p.location}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-800">{p.ipAddress}</div>
                        <div className="text-[10px] text-slate-400">
                          {p.isMonitored ? 'SNMP Ativo' : 'Não Monitorada'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            p.status === 'ATIVA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'OFFLINE'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.status === 'ATIVA'
                                ? 'bg-emerald-500'
                                : p.status === 'OFFLINE'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {p.supplies.map((sup, idx) => (
                            <div
                              key={idx}
                              title={`${sup.label}: ${sup.percent}%`}
                              className="group relative flex flex-col items-center"
                            >
                              <div className="h-5 w-2 rounded-full bg-slate-200 overflow-hidden flex flex-col justify-end">
                                <div
                                  style={{
                                    height: `${sup.percent}%`,
                                    backgroundColor: sup.colorCode,
                                  }}
                                  className="w-full rounded-full transition-all"
                                />
                              </div>
                              <span className="text-[9px] font-mono text-slate-500">{sup.percent}%</span>
                            </div>
                          ))}
                        </div>
                        {isBlackTonerLow && (
                          <span className="text-[10px] font-medium text-red-600">Toner Baixo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        {p.lastCounters?.total.toLocaleString('pt-BR')}
                        <div className="text-[10px] font-normal text-slate-400">
                          P&B: {p.lastCounters?.mono.toLocaleString('pt-BR')}
                          {p.isColor && ` • Color: ${p.lastCounters?.color.toLocaleString('pt-BR')}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCounterModal(p)}
                            className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Leitura
                          </button>
                          <button
                            onClick={() => setSelectedPrinter(p)}
                            className="rounded bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                          >
                            Detalhes
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printer Detail Drawer / Modal */}
      {selectedPrinter && !showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase">{selectedPrinter.code}</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedPrinter.model}</h2>
                <p className="text-xs text-slate-500">{selectedPrinter.location}</p>
              </div>
              <button
                onClick={() => setSelectedPrinter(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-400">Número de Série</span>
                <p className="font-mono font-semibold text-slate-800">{selectedPrinter.serialNumber}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-400">Patrimônio</span>
                <p className="font-mono font-semibold text-slate-800">{selectedPrinter.assetTag}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-400">Endereço IP / Host</span>
                <p className="font-mono font-semibold text-slate-800">{selectedPrinter.ipAddress} ({selectedPrinter.hostname})</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-400">Última Telemetria</span>
                <p className="font-medium text-slate-800">
                  {formatDateTime(selectedPrinter.lastCommunication)}
                </p>
              </div>
            </div>

            {/* Suprimentos Detalhados */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Níveis de Suprimentos & Peças</h3>
              <div className="space-y-2">
                {selectedPrinter.supplies.map((sup, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: sup.colorCode }} />
                      <span className="font-medium text-slate-800">{sup.label}</span>
                      <span className="text-slate-400">({sup.model})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">~{sup.estimatedPagesRemaining.toLocaleString('pt-BR')} páginas</span>
                      <span
                        className={`rounded px-2 py-0.5 font-bold ${
                          sup.percent <= 10
                            ? 'bg-red-100 text-red-700'
                            : sup.percent <= 20
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sup.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contadores */}
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-2">
                <span>Leitura Atual de Bilhetagem</span>
                <span>{selectedPrinter.lastCounters?.readAt ? formatDate(selectedPrinter.lastCounters.readAt) : 'Hoje'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded bg-white p-2">
                  <span className="text-slate-400">Total</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {selectedPrinter.lastCounters?.total.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="rounded bg-white p-2">
                  <span className="text-slate-400">P&B</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {selectedPrinter.lastCounters?.mono.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="rounded bg-white p-2">
                  <span className="text-slate-400">Color</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {selectedPrinter.lastCounters?.color.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => handleOpenCounterModal(selectedPrinter)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Lançar Contador Manual
              </button>
              <button
                onClick={() => setSelectedPrinter(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Counter Modal with Anomaly Protection */}
      {showCounterModal && selectedPrinter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Lançamento de Contadores</h2>
            <p className="text-xs text-slate-500">
              {selectedPrinter.model} ({selectedPrinter.code})
            </p>

            <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
              Contador Atual no Sistema:{' '}
              <strong className="font-mono text-slate-900">
                {selectedPrinter.lastCounters?.total.toLocaleString('pt-BR')} páginas
              </strong>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Contador Geral Total</label>
                <input
                  type="number"
                  value={counterInput.total}
                  onChange={(e) => setCounterInput({ ...counterInput, total: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Contador P&B</label>
                <input
                  type="number"
                  value={counterInput.mono}
                  onChange={(e) => setCounterInput({ ...counterInput, mono: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {selectedPrinter.isColor && (
                <div>
                  <label className="block text-xs font-medium text-slate-700">Contador Colorido</label>
                  <input
                    type="number"
                    value={counterInput.color}
                    onChange={(e) => setCounterInput({ ...counterInput, color: Number(e.target.value) })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {counterFeedback && (
              <div
                className={`mt-4 rounded-lg p-3 text-xs font-medium ${
                  counterFeedback.type === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-800'
                    : counterFeedback.type === 'warning'
                    ? 'border border-amber-200 bg-amber-50 text-amber-800'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                {counterFeedback.msg}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCounterModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCounter}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Validar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Printer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreatePrinter}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-900">Cadastrar Novo Equipamento no Parque</h2>
            <p className="text-xs text-slate-500">Adiciona multifuncional para monitoramento e faturamento.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Fabricante</label>
                <select
                  value={newPrinterData.manufacturer}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, manufacturer: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 bg-slate-50"
                >
                  <option value="HP">HP</option>
                  <option value="Kyocera">Kyocera</option>
                  <option value="Ricoh">Ricoh</option>
                  <option value="Lexmark">Lexmark</option>
                  <option value="Brother">Brother</option>
                  <option value="Canon">Canon</option>
                  <option value="Epson">Epson</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ECOSYS M3655idn"
                  value={newPrinterData.model}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, model: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Número de Série</label>
                <input
                  type="text"
                  required
                  placeholder="Série física"
                  value={newPrinterData.serialNumber}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, serialNumber: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Patrimônio</label>
                <input
                  type="text"
                  placeholder="PAT-0199"
                  value={newPrinterData.assetTag}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, assetTag: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">IP de Rede</label>
                <input
                  type="text"
                  value={newPrinterData.ipAddress}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, ipAddress: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Cliente Destino</label>
                <select
                  value={newPrinterData.clientId}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, clientId: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 bg-slate-50"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="font-medium text-slate-700">Local / Departamento</label>
                <input
                  type="text"
                  placeholder="ex: Bloco A - Sala de Faturamento"
                  value={newPrinterData.location}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, location: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkColor"
                  checked={newPrinterData.isColor}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, isColor: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label htmlFor="chkColor" className="text-slate-700">Equipamento Colorido</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkMon"
                  checked={newPrinterData.isMonitored}
                  onChange={(e) => setNewPrinterData({ ...newPrinterData, isMonitored: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label htmlFor="chkMon" className="text-slate-700">Ativar Coleta SNMP</label>
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
                Salvar Equipamento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
