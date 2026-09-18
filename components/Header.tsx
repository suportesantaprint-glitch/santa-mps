'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import {
  Bell,
  Search,
  Zap,
  Printer,
  ShieldCheck,
  Building2,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'ADMIN', label: 'Administrador', desc: 'Acesso total irrestrito' },
  { role: 'GESTOR', label: 'Dono / Gestor', desc: 'Indicadores e financeiro' },
  { role: 'GERENCIA', label: 'Gerência Operacional', desc: 'Equipe, contratos e SLA' },
  { role: 'SUPORTE', label: 'Suporte / Help Desk', desc: 'Chamados e equipamentos' },
  { role: 'TECNICO', label: 'Técnico de Campo', desc: 'OS e rotas do dia' },
  { role: 'FATURAMENTO', label: 'Faturamento / Bilhetagem', desc: 'Contadores e fechamento' },
  { role: 'SUPRIMENTOS', label: 'Suprimentos & Compras', desc: 'Toners e requisições' },
  { role: 'ESTOQUISTA', label: 'Estoquista', desc: 'Movimentações físicas' },
  { role: 'CLIENTE', label: 'Portal do Cliente', desc: 'Visão isolada do cliente' },
];

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onNavigateAlerts?: () => void;
}

export default function Header({ onOpenMobileMenu, onNavigateAlerts }: HeaderProps = {}) {
  const {
    currentUser,
    setCurrentRole,
    alerts,
    simulateAgentCollection,
    searchQuery,
    setSearchQuery,
    acknowledgeAlert,
  } = useSantaStore();

  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'ABERTO' || a.status === 'RECONHECIDO');

  const handleSimulate = () => {
    setIsSimulating(true);
    simulateAgentCollection();
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
          <Printer className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">Santa MPS</span>
            <span className="hidden rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 sm:inline-block">
              SaaS Outsourcing
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Building2 className="h-3 w-3" />
            <span>Santa Print Outsourcing Ltda</span>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, série, IP, chamado ou contrato..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Controls & User Profile Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Instant Agent Simulator Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          title="Simular coleta SNMP em tempo real do Agente Windows"
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Simular Coleta Agente</span>
        </button>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Alertas do sistema"
          >
            <Bell className="h-4 w-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:w-96">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-semibold text-slate-800">
                  Alertas Ativos ({activeAlerts.length})
                </span>
                <span className="text-xs text-slate-500">Monitoramento Contínuo</span>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-emerald-500" />
                    Nenhum alerta crítico ativo no parque de impressão.
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-medium text-slate-800">
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatTime(alert.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600">{alert.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-500">{alert.entityName}</span>
                        {alert.status === 'ABERTO' && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            Reconhecer
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RBAC Role Selector */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="hidden text-right lg:block">
            <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500">Perfil Ativo:</div>
          </div>
          <select
            value={currentUser.role}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 focus:border-blue-500 focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
