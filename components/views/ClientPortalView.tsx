'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { formatBRL } from '@/lib/billing-engine';
import { formatDate } from '@/lib/utils';
import {
  Printer,
  Ticket,
  FileText,
  Plus,
  Boxes,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';

export default function ClientPortalView() {
  const { clients, printers, tickets, invoices, addTicket } = useSantaStore();

  const client = clients[0]; // Portal do cliente seleciona a organização do usuário logado
  const clientPrinters = printers.filter((p) => p.clientId === client?.id);
  const clientTickets = tickets.filter((t) => t.clientId === client?.id);
  const clientInvoices = invoices.filter((i) => i.clientId === client?.id);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'SUPRIMENTO' | 'DEFEITO'>('SUPRIMENTO');
  const [ticketFeedback, setTicketFeedback] = useState<string | null>(null);

  const handleOpenTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription) return;

    addTicket({
      clientId: client?.id || 'cli-1',
      printerId: selectedPrinterId || undefined,
      requesterName: 'Dr. Fernando Prado',
      requesterEmail: 'fernando@hospitalmetropolitano.com.br',
      category: ticketCategory,
      priority: ticketCategory === 'DEFEITO' ? 'ALTA' : 'NORMAL',
      description: ticketDescription,
      origin: 'CLIENTE',
    });

    setTicketFeedback('Chamado aberto com sucesso! Nosso suporte já está ciente.');
    setTimeout(() => {
      setTicketFeedback(null);
      setShowTicketModal(false);
      setTicketDescription('');
    }, 1500);
  };

  const handleQuickTonerRequest = (printerCode: string, printerModel: string) => {
    addTicket({
      clientId: client?.id || 'cli-1',
      requesterName: 'Dr. Fernando Prado (Solicitação Rápida)',
      requesterEmail: 'fernando@hospitalmetropolitano.com.br',
      category: 'SUPRIMENTO',
      priority: 'NORMAL',
      description: `Solicitação emergencial de toner para a impressora ${printerModel} (${printerCode}).`,
      origin: 'CLIENTE',
    });
    alert(`Solicitação de toner registrada com sucesso para o equipamento ${printerCode}!`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white shadow-sm">
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20">
          Portal de Autoatendimento
        </span>
        <h1 className="mt-2 text-2xl font-bold">{client?.tradeName || 'Hospital Metropolitano'}</h1>
        <p className="mt-1 text-xs text-slate-300">
          Acompanhe suas multifuncionais instaladas, solicite cartuchos de toner e consulte faturas de bilhetagem.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowTicketModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Solicitar Atendimento / Toner
          </button>
        </div>
      </div>

      {/* Fleet Overview Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Seus Equipamentos em Operação</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientPrinters.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600">{p.code}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{p.model}</h3>
                  <p className="text-[11px] text-slate-500">{p.location}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {p.status}
                </span>
              </div>

              {/* Toners status */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Nível de Suprimentos</span>
                <div className="mt-2 space-y-2">
                  {p.supplies.map((sup, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sup.colorCode }} />
                        <span className="text-slate-700 font-medium">{sup.label}</span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          sup.percent <= 10 ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {sup.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="font-mono text-slate-600">
                  Total: <strong>{p.lastCounters?.total.toLocaleString('pt-BR')}</strong> pág
                </div>
                <button
                  onClick={() => handleQuickTonerRequest(p.code, p.model)}
                  className="rounded bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Pedir Toner
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets and Invoices Summary for Client */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chamados do Cliente */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Seus Chamados Recentes</h3>
            <span className="text-xs text-slate-500">{clientTickets.length} registros</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {clientTickets.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div>
                  <div className="font-semibold text-slate-800">
                    <span className="font-mono text-blue-600 mr-1.5">{t.code}</span>
                    {t.description}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Aberto em {formatDate(t.openedAt)}
                  </div>
                </div>
                <span className="rounded bg-blue-100 px-2 py-0.5 font-semibold text-blue-800 text-[10px]">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Faturas do Cliente */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Histórico de Faturas & Bilhetagem</h3>
            <span className="text-xs text-slate-500">{clientInvoices.length} faturas</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {clientInvoices.slice(0, 4).map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div>
                  <div className="font-bold text-slate-800">{i.periodLabel}</div>
                  <div className="text-[11px] text-slate-500">
                    {i.code} • Vence em: {formatDate(i.dueDate)}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900">{formatBRL(i.totalAmount)}</div>
                  <span className="text-[10px] font-semibold text-emerald-700">{i.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleOpenTicket}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs"
          >
            <h2 className="text-base font-bold text-slate-900">Abertura de Chamado Técnico / Suprimento</h2>
            <p className="text-slate-500">Nossa equipe responderá dentro do prazo de SLA estipulado.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="font-medium text-slate-700">Tipo de Solicitação</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="SUPRIMENTO">Reposição de Cartucho de Toner</option>
                  <option value="DEFEITO">Defeito Técnico / Equipamento Parado</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Equipamento Relacionado</label>
                <select
                  value={selectedPrinterId}
                  onChange={(e) => setSelectedPrinterId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2"
                >
                  <option value="">Selecione o equipamento...</option>
                  {clientPrinters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.model} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Descrição do Problema / Pedido</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Informe detalhes do defeito ou quantidade de cartuchos necessários..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2"
                />
              </div>
            </div>

            {ticketFeedback && (
              <div className="mt-3 rounded bg-emerald-50 p-2 text-emerald-800 font-semibold">
                {ticketFeedback}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
              >
                Enviar Chamado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
