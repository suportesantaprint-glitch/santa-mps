'use client';

import React from 'react';
import { useSantaStore } from '@/lib/store';
import { formatBRL } from '@/lib/billing-engine';
import { formatDate } from '@/lib/utils';
import {
  Printer,
  FileText,
  DollarSign,
  Ticket,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { NavTab } from '../Sidebar';

export default function DashboardView({ onNavigate }: { onNavigate: (tab: NavTab) => void }) {
  const { printers, contracts, tickets, alerts, inventory, invoices, simulateAgentCollection } = useSantaStore();

  const totalPrinters = printers.length;
  const activePrinters = printers.filter((p) => p.status === 'ATIVA').length;
  const offlinePrinters = printers.filter((p) => p.status === 'OFFLINE').length;

  const openTickets = tickets.filter((t) => t.status !== 'RESOLVIDO' && t.status !== 'FECHADO');
  const criticalTickets = openTickets.filter((t) => t.priority === 'CRITICA');

  const criticalToners = printers.flatMap((p) =>
    p.supplies.filter((s) => s.status === 'CRÍTICO' || s.status === 'VAZIO')
  );

  const totalMonthlyRevenue = contracts
    .filter((c) => c.status === 'ATIVO')
    .reduce((sum, c) => sum + c.monthlyFixedFee, 0);

  const totalMonoProduced = printers.reduce((acc, p) => acc + (p.lastCounters?.mono || 0), 0);
  const totalColorProduced = printers.reduce((acc, p) => acc + (p.lastCounters?.color || 0), 0);

  // Mock production history data for the bar chart
  const monthsData = [
    { month: 'Mai', mono: 92000, color: 18000 },
    { month: 'Jun', mono: 104000, color: 21000 },
    { month: 'Jul', mono: 118000, color: 24500 },
    { month: 'Ago', mono: 125000, color: 26000 },
    { month: 'Set', mono: 138000, color: 29500 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
            Painel Executivo de Outsourcing
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Centro de Operações Santa MPS</h1>
          <p className="mt-1 text-sm text-slate-300">
            Monitoramento em tempo real de {totalPrinters} multifuncionais, bilhetagem de contratos e chamados SLA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => simulateAgentCollection()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
          >
            <Activity className="h-4 w-4" />
            Disparar SNMP Daemon
          </button>
          <button
            onClick={() => onNavigate('chamados')}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 border border-white/10"
          >
            <Ticket className="h-4 w-4" />
            Novo Chamado
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Impressoras */}
        <div
          onClick={() => onNavigate('impressoras')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Parque de Impressoras</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Printer className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalPrinters}</span>
            <span className="text-xs text-emerald-600 font-medium">{activePrinters} ativas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>{offlinePrinters} offline / alerta</span>
            <span className="font-semibold text-blue-600 flex items-center">
              Ver Parque <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Faturamento Mensal */}
        <div
          onClick={() => onNavigate('faturamento')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Faturamento Base / Mês</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{formatBRL(totalMonthlyRevenue)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>{contracts.length} contratos vigentes</span>
            <span className="font-semibold text-emerald-600 flex items-center">
              Bilhetagem <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Chamados & SLA */}
        <div
          onClick={() => onNavigate('chamados')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-amber-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Help Desk & SLA</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{openTickets.length}</span>
            <span className="text-xs text-red-600 font-semibold">{criticalTickets.length} críticos</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>SLA global 96.4%</span>
            <span className="font-semibold text-amber-600 flex items-center">
              Atender <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Suprimentos Críticos */}
        <div
          onClick={() => onNavigate('estoque')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-purple-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Suprimentos em Alerta</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{criticalToners.length}</span>
            <span className="text-xs text-purple-700 font-medium">toners ≤ 10%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>{inventory.length} SKUs cadastrados</span>
            <span className="font-semibold text-purple-600 flex items-center">
              Estoque <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Production & Fleet Health Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Production Chart Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Produção Histórica de Páginas</h2>
              <p className="text-xs text-slate-500">Volume bilhetado consolidado (P&B vs Colorido)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-800" /> P&B (Mono)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Colorido
              </span>
            </div>
          </div>

          {/* Bar Visualizer */}
          <div className="mt-6 flex h-48 items-end gap-6 border-b border-slate-100 px-2 pb-3">
            {monthsData.map((d) => {
              const maxVal = 180000;
              const monoHeight = Math.round((d.mono / maxVal) * 100);
              const colorHeight = Math.round((d.color / maxVal) * 100);
              return (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-end justify-center gap-1.5 h-36">
                    <div
                      style={{ height: `${monoHeight}%` }}
                      title={`P&B: ${d.mono.toLocaleString('pt-BR')} páginas`}
                      className="w-1/2 rounded-t bg-slate-800 transition-all hover:bg-slate-700"
                    />
                    <div
                      style={{ height: `${colorHeight}%` }}
                      title={`Color: ${d.color.toLocaleString('pt-BR')} páginas`}
                      className="w-1/2 rounded-t bg-blue-600 transition-all hover:bg-blue-500"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Total Acumulado P&B:{' '}
              <strong className="text-slate-800">{totalMonoProduced.toLocaleString('pt-BR')}</strong>
            </div>
            <div>
              Total Acumulado Color:{' '}
              <strong className="text-slate-800">{totalColorProduced.toLocaleString('pt-BR')}</strong>
            </div>
          </div>
        </div>

        {/* Active Fleet Health Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">Saúde do Parque</h2>
          <p className="text-xs text-slate-500">Comunicação e suprimentos em tempo real</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Multifuncionais Ativas</span>
                <span>
                  {activePrinters} / {totalPrinters} ({Math.round((activePrinters / totalPrinters) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(activePrinters / totalPrinters) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Agentes Windows Conectados</span>
                <span>100% Online</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Conformidade de SLA</span>
                <span>96.4%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: '96.4%' }} />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Atenção Preventiva
            </div>
            <p className="mt-1 text-[11px] text-amber-800">
              Kyocera M3655idn (Farmácia Central) está com 8% de toner preto. Substituição imediata recomendada para
              evitar interrupção.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Alerts and Urgent Tickets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chamados Recentes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Chamados em Aberto</h2>
            <button
              onClick={() => onNavigate('chamados')}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Ver todos ({tickets.length})
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {tickets.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span className="font-mono text-blue-600">{t.code}</span>
                    <span>{t.clientName}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        t.priority === 'CRITICA'
                          ? 'bg-red-100 text-red-700'
                          : t.priority === 'ALTA'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 line-clamp-1">{t.description}</p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800 text-[10px]">
                    {t.status}
                  </span>
                  <div className="mt-1 text-[10px] text-slate-400">SLA: {t.slaHours}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faturas Recentes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Faturamento & Faturas Recentes</h2>
            <button
              onClick={() => onNavigate('faturamento')}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Ver fechamento ({invoices.length})
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {invoices.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span className="font-mono text-emerald-600">{inv.code}</span>
                    <span>{inv.clientName}</span>
                  </div>
                  <p suppressHydrationWarning className="mt-0.5 text-[11px] text-slate-500">
                    {inv.periodLabel} • Vencimento: {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">{formatBRL(inv.totalAmount)}</div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      inv.status === 'PAGA'
                        ? 'bg-emerald-100 text-emerald-700'
                        : inv.status === 'FATURADA'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
