'use client';

import React from 'react';
import { useSantaStore } from '@/lib/store';
import {
  LayoutDashboard,
  Building2,
  Printer,
  Activity,
  Ticket,
  Wrench,
  MapPin,
  Boxes,
  FileText,
  DollarSign,
  Bell,
  BarChart3,
  Database,
  UserCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'clientes'
  | 'impressoras'
  | 'monitoramento'
  | 'chamados'
  | 'os'
  | 'rotas'
  | 'estoque'
  | 'contratos'
  | 'faturamento'
  | 'alertas'
  | 'relatorios'
  | 'integracoes'
  | 'portal-cliente';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ currentTab, onSelectTab, isOpen, setIsOpen }: SidebarProps) {
  const { currentUser, alerts, tickets, serviceOrders } = useSantaStore();

  const activeAlertsCount = alerts.filter((a) => a.status === 'ABERTO').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'ABERTO' || t.status === 'TRIAGEM').length;
  const openOSCount = serviceOrders.filter((o) => o.status === 'ABERTA' || o.status === 'EM_EXECUCAO').length;

  // Se perfil for CLIENTE, focar e restringir visualizações
  const isClientRole = currentUser.role === 'CLIENTE';

  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    hiddenForRoles?: string[];
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard Geral',
      icon: LayoutDashboard,
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'portal-cliente',
      label: 'Portal do Cliente',
      icon: UserCheck,
    },
    {
      id: 'clientes',
      label: 'Clientes & Filiais',
      icon: Building2,
      hiddenForRoles: ['CLIENTE', 'TECNICO'],
    },
    {
      id: 'impressoras',
      label: 'Parque de Impressoras',
      icon: Printer,
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'monitoramento',
      label: 'Monitoramento & Agente',
      icon: Activity,
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'chamados',
      label: 'Chamados / Help Desk',
      icon: Ticket,
      badge: openTicketsCount,
      badgeColor: 'bg-blue-100 text-blue-700',
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'os',
      label: 'Ordens de Serviço (OS)',
      icon: Wrench,
      badge: openOSCount,
      badgeColor: 'bg-amber-100 text-amber-800',
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'rotas',
      label: 'Técnicos & Rotas GPS',
      icon: MapPin,
      hiddenForRoles: ['CLIENTE', 'FATURAMENTO'],
    },
    {
      id: 'estoque',
      label: 'Suprimentos & Estoque',
      icon: Boxes,
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'contratos',
      label: 'Contratos & Franquias',
      icon: FileText,
      hiddenForRoles: ['CLIENTE', 'TECNICO'],
    },
    {
      id: 'faturamento',
      label: 'Faturamento & Fechamento',
      icon: DollarSign,
      hiddenForRoles: ['CLIENTE', 'TECNICO', 'SUPORTE', 'ESTOQUISTA'],
    },
    {
      id: 'alertas',
      label: 'Central de Alertas',
      icon: Bell,
      badge: activeAlertsCount,
      badgeColor: 'bg-red-100 text-red-700',
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'relatorios',
      label: 'Relatórios Gerenciais',
      icon: BarChart3,
      hiddenForRoles: ['CLIENTE'],
    },
    {
      id: 'integracoes',
      label: 'Integrações Oracle & API',
      icon: Database,
      hiddenForRoles: ['CLIENTE', 'TECNICO', 'ESTOQUISTA'],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Navegação Operacional
      </div>
      <nav className="space-y-1">
        {menuItems
          .filter((item) => !item.hiddenForRoles?.includes(currentUser.role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Status Bar at Bottom */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Serviço Windows Online</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          PrintControl Agent v2.4.1 conectado via HTTPS/SNMP.
        </p>
      </div>
    </aside>
  );
}
