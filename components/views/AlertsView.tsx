'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { AlertEvent, AlertSeverity, AlertStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Check,
  Wrench,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { NavTab } from '../Sidebar';

export default function AlertsView({ onNavigate }: { onNavigate?: (tab: NavTab) => void }) {
  const { alerts, acknowledgeAlert, resolveAlert, addTicket } = useSantaStore();

  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.entityName.toLowerCase().includes(q) ||
        (a.clientName && a.clientName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenTicketFromAlert = (alert: AlertEvent) => {
    addTicket({
      clientId: alert.clientId || 'cli-1',
      printerId: alert.entityType === 'PRINTER' ? alert.entityId : undefined,
      requesterName: 'Alerta Preventivo do Sistema',
      requesterEmail: 'noc@santaprint.com.br',
      category: alert.type === 'TONER_BAIXO' ? 'SUPRIMENTO' : 'DEFEITO',
      priority: alert.severity === 'CRITICA' || (alert.severity as string) === 'CRÍTICA' ? 'CRITICA' : 'ALTA',
      description: `Gerado automaticamente pelo alerta: ${alert.title}. ${alert.description}`,
      origin: 'MONITORAMENTO',
    });
    resolveAlert(alert.id);
    if (onNavigate) {
      onNavigate('chamados');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Central de Alertas Operacionais</h1>
          <p className="text-xs text-slate-500">
            Detecção preventiva de suprimentos críticos, falhas de conectividade, saltos de contadores e SLA.
          </p>
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
            placeholder="Buscar alerta por título, impressora ou cliente..."
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
            <option value="RECONHECIDO">RECONHECIDO</option>
            <option value="RESOLVIDO">RESOLVIDO</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todas as Severidades</option>
            <option value="CRÍTICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MÉDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            Nenhum alerta registrado com os filtros selecionados.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col justify-between gap-3 rounded-xl border p-4 shadow-xs transition md:flex-row md:items-center ${
                alert.status === 'RESOLVIDO'
                  ? 'border-slate-200 bg-slate-50/50 opacity-70'
                  : alert.severity === 'CRITICA' || (alert.severity as string) === 'CRÍTICA'
                  ? 'border-red-200 bg-red-50/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      alert.severity === 'CRITICA' || (alert.severity as string) === 'CRÍTICA'
                        ? 'bg-red-100 text-red-700'
                        : alert.severity === 'ALTA'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {alert.severity}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{alert.title}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {alert.type}
                  </span>
                </div>

                <p className="text-xs text-slate-700">{alert.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span>
                    Origem: <strong className="text-slate-800">{alert.entityName}</strong>
                  </span>
                  {alert.clientName && <span>Cliente: {alert.clientName}</span>}
                  <span>Horário: {formatDateTime(alert.createdAt)}</span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-2 md:border-none md:pt-0">
                {alert.status === 'ABERTO' && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Reconhecer
                  </button>
                )}

                {alert.status !== 'RESOLVIDO' && (
                  <>
                    <button
                      onClick={() => handleOpenTicketFromAlert(alert)}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Abrir Chamado
                    </button>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Resolver
                    </button>
                  </>
                )}

                {alert.status === 'RESOLVIDO' && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 text-xs">
                    <CheckCircle2 className="h-4 w-4" /> Resolvido
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
