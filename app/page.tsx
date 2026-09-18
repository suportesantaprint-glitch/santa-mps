'use client';

import React, { useState } from 'react';
import { SantaProvider, useSantaStore } from '@/lib/store';
import Header from '@/components/Header';
import Sidebar, { NavTab } from '@/components/Sidebar';

import DashboardView from '@/components/views/DashboardView';
import ClientsView from '@/components/views/ClientsView';
import PrintersView from '@/components/views/PrintersView';
import MonitoringAgentView from '@/components/views/MonitoringAgentView';
import TicketsView from '@/components/views/TicketsView';
import ServiceOrdersView from '@/components/views/ServiceOrdersView';
import TechniciansRoutesView from '@/components/views/TechniciansRoutesView';
import SuppliesInventoryView from '@/components/views/SuppliesInventoryView';
import ContractsView from '@/components/views/ContractsView';
import BillingView from '@/components/views/BillingView';
import AlertsView from '@/components/views/AlertsView';
import ReportsView from '@/components/views/ReportsView';
import IntegrationsView from '@/components/views/IntegrationsView';
import ClientPortalView from '@/components/views/ClientPortalView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'clientes':
        return <ClientsView />;
      case 'impressoras':
        return <PrintersView />;
      case 'monitoramento':
        return <MonitoringAgentView />;
      case 'chamados':
        return <TicketsView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'os':
        return <ServiceOrdersView />;
      case 'rotas':
        return <TechniciansRoutesView />;
      case 'estoque':
        return <SuppliesInventoryView />;
      case 'contratos':
        return <ContractsView />;
      case 'faturamento':
        return <BillingView />;
      case 'alertas':
        return <AlertsView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'relatorios':
        return <ReportsView />;
      case 'integracoes':
        return <IntegrationsView />;
      case 'portal-cliente':
        return <ClientPortalView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onOpenMobileMenu={() => setSidebarOpen(true)} onNavigateAlerts={() => setActiveTab('alertas')} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
}

export default function SantaMPSApp() {
  return (
    <SantaProvider>
      <AppContent />
    </SantaProvider>
  );
}
