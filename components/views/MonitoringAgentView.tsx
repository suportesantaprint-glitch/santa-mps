'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import {
  Activity,
  Terminal,
  Server,
  RefreshCw,
  Copy,
  Check,
  Zap,
  HardDrive,
  Download,
  ShieldCheck,
  Clock,
  Radio,
} from 'lucide-react';

export default function MonitoringAgentView() {
  const { agents, simulateAgentCollection, printers } = useSantaStore();
  const [copiedToken, setCopiedToken] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const handleSimulate = () => {
    setIsSimulating(true);
    simulateAgentCollection();
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const sampleJsonTelemetry = {
    agent_id: selectedAgent?.agentToken || 'agent-token-xyz',
    timestamp: new Date().toISOString(),
    batch_size: 4,
    metrics: printers.slice(0, 3).map((p) => ({
      ip: p.ipAddress,
      serial: p.serialNumber,
      counter_total: p.lastCounters?.total || 0,
      counter_mono: p.lastCounters?.mono || 0,
      counter_color: p.lastCounters?.color || 0,
      supplies: p.supplies.map((s) => ({ type: s.type, percent: s.percent })),
      status: p.status,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Monitoramento & Agentes de Coleta</h1>
          <p className="text-xs text-slate-500">
            Serviço Windows PrintControl Agent instalado nos clientes para coleta periódica SNMPv1/v2c.
          </p>
        </div>
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          Forçar Coleta Telemetria SNMP
        </button>
      </div>

      {/* Agents Roster Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgentId(agent.id)}
            className={`cursor-pointer rounded-xl border p-4 shadow-xs transition ${
              selectedAgent?.id === agent.id
                ? 'border-indigo-500 bg-indigo-50/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-xs">{agent.hostname}</h2>
                  <p className="text-[10px] text-slate-400 font-mono">{agent.ipAddress}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  agent.status === 'ONLINE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {agent.status}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-medium text-slate-800">{agent.clientName || 'Matriz Corporativa'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Versão:</span>
                <span className="font-mono text-slate-800">v{agent.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Impressoras Descobertas:</span>
                <span className="font-bold text-indigo-600">{agent.discoveredPrintersCount || agent.monitoredPrinterCount} eqp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Último Heartbeat:</span>
                <span className="text-slate-500">{formatTime(agent.lastHeartbeat)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Agent & Payload Explorer */}
      {selectedAgent && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Windows Agent Service Config */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Parâmetros de Conexão do Agente</h3>
                <p className="text-xs text-slate-500">{selectedAgent.hostname} ({selectedAgent.clientName || 'Rede Local'})</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600">
                Porta 161 (SNMP)
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Token de Autenticação (Bearer API)</label>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <code className="font-mono text-slate-800">{selectedAgent.agentToken || selectedAgent.agentId}</code>
                  <button
                    onClick={() => handleCopyToken(selectedAgent.agentToken || selectedAgent.agentId)}
                    className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                  >
                    {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedToken ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Faixa de Varredura de Rede (Subnet Discovery)</label>
                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-800">
                  {selectedAgent.discoverySubnet || '192.168.1.0/24'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-4 text-white font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span>Instalação PowerShell (Execução como Admin)</span>
                  <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <code className="text-indigo-300">
                  msiexec /i SantaPrintAgent_v2.4.msi /qn TOKEN=&quot;{selectedAgent.agentToken || selectedAgent.agentId}&quot;
                  ENDPOINT=&quot;https://mps.santaprint.com.br/api/v1&quot;
                </code>
              </div>
            </div>
          </div>

          {/* Raw JSON Telemetry Stream Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Payload Telemetria SNMP (JSON)</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">POST /api/v1/agentes/readings</span>
            </div>

            <pre className="mt-4 max-h-72 overflow-y-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-400">
              {JSON.stringify(sampleJsonTelemetry, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
