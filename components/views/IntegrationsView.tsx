'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { formatTime, formatDateTime } from '@/lib/utils';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  Key,
  Shield,
  Code2,
  Terminal,
  Clock,
  Radio,
} from 'lucide-react';

export default function IntegrationsView() {
  const { oracleLogs, auditLogs, syncWithOracle, invoices } = useSantaStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ORACLE' | 'API' | 'AUDIT'>('ORACLE');

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithOracle();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Integrações & Governança</h1>
          <p className="text-xs text-slate-500">
            Conexão com Oracle ERP 19c, APIs REST públicas e trilha de auditoria completa (LGPD/SOX).
          </p>
        </div>
        {activeTab === 'ORACLE' && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Oracle Agora
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('ORACLE')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'ORACLE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Oracle ERP 19c (Conector Financeiro)
        </button>
        <button
          onClick={() => setActiveTab('API')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'API' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          API REST v1 & Webhooks
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'AUDIT' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Trilha de Auditoria ({auditLogs.length} eventos)
        </button>
      </div>

      {/* Oracle ERP Tab */}
      {activeTab === 'ORACLE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-xs text-slate-400 font-medium">Status da Conexão</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900 text-sm">Conectado (Driver OCI)</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Oracle Database 19c Enterprise Edition</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-xs text-slate-400 font-medium">Títulos a Integrar</span>
              <div className="mt-1 font-bold text-slate-900 text-sm font-mono">{invoices.length} Faturas</div>
              <p className="mt-1 text-[11px] text-slate-500">Módulo Contas a Receber / Faturamento</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-xs text-slate-400 font-medium">Última Carga</span>
              <div className="mt-1 font-bold text-slate-900 text-sm">
                {oracleLogs[0] ? formatTime(oracleLogs[0].timestamp) : 'Hoje'}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Jobs automáticos a cada 60 minutos</p>
            </div>
          </div>

          {/* Sync Logs */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase mb-3">Histórico de Sincronizações</h3>
            <div className="space-y-2 text-xs">
              {oracleLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-800">{log.entity}</span>
                      <p className="text-[11px] text-slate-500">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-500">
                    <div>{log.durationMs}ms</div>
                    <div className="text-[10px] text-slate-400">
                      {formatTime(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REST API Tab */}
      {activeTab === 'API' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Documentação dos Endpoints REST v1</h3>
            <p className="text-slate-500 mb-4">
              Consulte e alimente o Santa MPS via API JSON autenticada por Bearer Token.
            </p>

            <div className="space-y-3 font-mono">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">GET</span>
                  <span className="text-slate-800 font-semibold">/api/v1/clientes</span>
                </div>
                <p className="mt-1 text-slate-500 text-[11px]">Listagem completa de clientes e unidades.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">GET</span>
                  <span className="text-slate-800 font-semibold">/api/v1/impressoras</span>
                </div>
                <p className="mt-1 text-slate-500 text-[11px]">Listagem de multifuncionais com filtros de status e suprimentos.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">POST</span>
                  <span className="text-slate-800 font-semibold">/api/v1/contadores</span>
                </div>
                <p className="mt-1 text-slate-500 text-[11px]">Submissão de leitura de contador com validação de rollback.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">POST</span>
                  <span className="text-slate-800 font-semibold">/api/v1/agentes/heartbeat</span>
                </div>
                <p className="mt-1 text-slate-500 text-[11px]">Ping de presença do serviço Windows PrintControl Agent.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'AUDIT' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Usuário / Perfil</th>
                <th className="px-4 py-3">Ação</th>
                <th className="px-4 py-3">Entidade</th>
                <th className="px-4 py-3">Detalhes do Evento</th>
                <th className="px-4 py-3">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {log.userName}{' '}
                    <span className="font-normal text-[10px] text-slate-400">({log.userRole})</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'APPROVE' || log.action === 'CLOSE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{log.entity}</td>
                  <td className="px-4 py-2.5 text-slate-800">{log.details}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
