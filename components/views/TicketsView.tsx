'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { Ticket, TicketPriority, TicketStatus } from '@/lib/types';
import { calculateSLA } from '@/lib/sla-engine';
import { formatDateTime } from '@/lib/utils';
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { NavTab } from '../Sidebar';

export default function TicketsView({ onNavigate }: { onNavigate?: (tab: NavTab) => void }) {
  const {
    tickets,
    clients,
    printers,
    technicians,
    addTicket,
    updateTicketStatus,
    createOSFromTicket,
    searchQuery,
  } = useSantaStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOSModal, setShowOSModal] = useState(false);
  const [selectedTicketForOS, setSelectedTicketForOS] = useState<Ticket | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>(technicians[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form State
  const [ticketForm, setTicketForm] = useState({
    clientId: clients[0]?.id || '',
    printerId: printers[0]?.id || '',
    requesterName: '',
    requesterEmail: '',
    category: 'DEFEITO' as Ticket['category'],
    priority: 'NORMAL' as TicketPriority,
    description: '',
  });

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    const term = (search.trim() || searchQuery.trim()).toLowerCase();
    if (term) {
      return (
        t.code.toLowerCase().includes(term) ||
        t.clientName.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.requesterName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.description || !ticketForm.requesterName) return;

    addTicket({
      clientId: ticketForm.clientId,
      printerId: ticketForm.printerId || undefined,
      requesterName: ticketForm.requesterName,
      requesterEmail: ticketForm.requesterEmail,
      category: ticketForm.category,
      priority: ticketForm.priority,
      description: ticketForm.description,
    });

    setShowAddModal(false);
  };

  const handleOpenOSModal = (ticket: Ticket) => {
    setSelectedTicketForOS(ticket);
    setShowOSModal(true);
  };

  const handleGenerateOS = () => {
    if (!selectedTicketForOS) return;
    createOSFromTicket(selectedTicketForOS.id, selectedTechId, scheduledDate);
    setShowOSModal(false);
    if (onNavigate) {
      onNavigate('os');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Help Desk & Chamados Técnicos</h1>
          <p className="text-xs text-slate-500">
            Triagem, priorização por SLA e conversão em Ordens de Serviço (OS) de campo.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Abrir Chamado
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
            placeholder="Buscar por chamado, cliente, solicitante ou descrição..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ABERTO">ABERTO</option>
            <option value="TRIAGEM">TRIAGEM</option>
            <option value="AGENDADO">AGENDADO</option>
            <option value="EM_ATENDIMENTO">EM ATENDIMENTO</option>
            <option value="RESOLVIDO">RESOLVIDO</option>
            <option value="FECHADO">FECHADO</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todas Prioridades</option>
            <option value="CRITICA">CRÍTICA (SLA 4h)</option>
            <option value="ALTA">ALTA (SLA 8h)</option>
            <option value="NORMAL">NORMAL (SLA 24h)</option>
            <option value="BAIXA">BAIXA (SLA 48h)</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            Nenhum chamado encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const sla = calculateSLA(ticket.openedAt, ticket.slaHours);
            const isResolved = ticket.status === 'RESOLVIDO' || ticket.status === 'FECHADO';

            return (
              <div
                key={ticket.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 md:flex-row md:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{ticket.code}</span>
                    <span className="font-semibold text-slate-900 text-sm">{ticket.clientName}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        ticket.priority === 'CRITICA'
                          ? 'bg-red-100 text-red-700'
                          : ticket.priority === 'ALTA'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {ticket.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{ticket.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>
                      Solicitante: <strong>{ticket.requesterName}</strong>
                    </span>
                    {ticket.printerModel && (
                      <span>
                        Equipamento: <strong>{ticket.printerModel}</strong> ({ticket.printerSerial})
                      </span>
                    )}
                    <span>
                      Aberto em: {formatDateTime(ticket.openedAt)}
                    </span>
                    {ticket.assignedTechnicianName && (
                      <span>
                        Técnico: <strong className="text-indigo-600">{ticket.assignedTechnicianName}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* SLA & Action Controls */}
                <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-3 md:border-none md:pt-0">
                  <div className="flex items-center gap-2">
                    {!isResolved && (
                      <div
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                          sla.isBreached
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : sla.isNearBreach
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {sla.isBreached
                            ? `SLA Estourado (+${(sla.elapsedHours - ticket.slaHours).toFixed(1)}h)`
                            : `SLA: ${sla.remainingHours}h restantes (${sla.percentConsumed}%)`}
                        </span>
                      </div>
                    )}
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'AGENDADO'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    {ticket.status === 'ABERTO' && (
                      <button
                        onClick={() => handleOpenOSModal(ticket)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        Gerar OS de Campo
                      </button>
                    )}
                    {ticket.status !== 'RESOLVIDO' && ticket.status !== 'FECHADO' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'RESOLVIDO')}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Generate Service Order (OS) Modal */}
      {showOSModal && selectedTicketForOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Gerar Ordem de Serviço (OS)</h2>
            <p className="text-xs text-slate-500">
              Vincular chamado {selectedTicketForOS.code} a um técnico de campo.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Técnico de Campo Responsável</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-800"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} • {t.activeRouteCount} OS em rota ({t.vehiclePlate || 'Carro'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Data Agendada para Atendimento</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200">
                Uma nova parada de atendimento será inserida automaticamente na rota GPS do técnico selecionado.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowOSModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateOS}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Confirmar e Gerar OS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-900">Abertura de Chamado Help Desk</h2>
            <p className="text-xs text-slate-500">Registre a solicitação de suporte técnico ou suprimento.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Cliente Solicitante</label>
                <select
                  value={ticketForm.clientId}
                  onChange={(e) => setTicketForm({ ...ticketForm, clientId: e.target.value })}
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
                <label className="font-medium text-slate-700">Equipamento (Opcional)</label>
                <select
                  value={ticketForm.printerId}
                  onChange={(e) => setTicketForm({ ...ticketForm, printerId: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="">Não vinculado a equipamento específico</option>
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.model} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Nome do Solicitante</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Carlos Alberto"
                  value={ticketForm.requesterName}
                  onChange={(e) => setTicketForm({ ...ticketForm, requesterName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">E-mail para Retorno</label>
                <input
                  type="email"
                  placeholder="carlos@empresa.com.br"
                  value={ticketForm.requesterEmail}
                  onChange={(e) => setTicketForm({ ...ticketForm, requesterEmail: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Categoria</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value as Ticket['category'] })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="DEFEITO">Defeito Mecânico / Eletrônico</option>
                  <option value="ATOLAMENTO">Atolamento Frequente de Papel</option>
                  <option value="QUALIDADE">Falha de Qualidade / Manchas</option>
                  <option value="SUPRIMENTO">Reposição de Toner / Suprimento</option>
                  <option value="CONECTIVIDADE">Conectividade de Rede / Offline</option>
                  <option value="CONFIGURAÇÃO">Configuração / Driver / Scan</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Prioridade (SLA)</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as TicketPriority })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="CRITICA">Crítica - Parada Total (4 Horas)</option>
                  <option value="ALTA">Alta - Degradação Severa (8 Horas)</option>
                  <option value="NORMAL">Normal - Padrão (24 Horas)</option>
                  <option value="BAIXA">Baixa - Preventiva (48 Horas)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="font-medium text-slate-700">Descrição Detalhada do Problema</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Relate com clareza o sintoma, mensagens de erro no painel ou histórico do problema..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"
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
                Registrar Chamado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
