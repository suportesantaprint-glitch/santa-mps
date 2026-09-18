'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import {
  AgentDevice,
  AlertEvent,
  AuditLog,
  Client,
  Contract,
  InventoryItem,
  InventoryMovement,
  Invoice,
  MeterReading,
  OracleSyncLog,
  Printer,
  RouteStop,
  ServiceOrder,
  Technician,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
  UserRole,
} from './types';
import {
  INITIAL_AGENTS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLIENTS,
  INITIAL_CONTRACTS,
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_METERS,
  INITIAL_MOVEMENTS,
  INITIAL_ORACLE_LOGS,
  INITIAL_PRINTERS,
  INITIAL_ROUTES,
  INITIAL_SERVICE_ORDERS,
  INITIAL_TECHNICIANS,
  INITIAL_TICKETS,
  INITIAL_USERS,
} from './mock-data';
import { calculateContractBilling, calculateProduction, checkClosingBlockers } from './billing-engine';
import { getDefaultSLAHoursByPriority } from './sla-engine';

interface SantaContextType {
  currentUser: User;
  setCurrentRole: (role: UserRole) => void;
  clients: Client[];
  printers: Printer[];
  meters: MeterReading[];
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  alerts: AlertEvent[];
  tickets: Ticket[];
  serviceOrders: ServiceOrder[];
  technicians: Technician[];
  routes: RouteStop[];
  contracts: Contract[];
  invoices: Invoice[];
  agents: AgentDevice[];
  oracleLogs: OracleSyncLog[];
  auditLogs: AuditLog[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  updatePrinter: (id: string, updates: Partial<Printer>) => void;
  registerMeterReading: (data: {
    printerId: string;
    counterTotal: number;
    counterMono: number;
    counterColor: number;
    counterPrints?: number;
    counterCopies?: number;
    counterScans?: number;
    source?: 'SNMP' | 'AGENT' | 'MANUAL' | 'HTTP';
  }) => { success: boolean; validationStatus: string; inconsistencyReason?: string; productionTotal: number };
  simulateAgentCollection: (printerId?: string) => void;
  addTicket: (data: {
    clientId: string;
    printerId?: string;
    requesterName: string;
    requesterEmail: string;
    category: Ticket['category'];
    priority: TicketPriority;
    description: string;
    origin?: Ticket['origin'];
  }) => Ticket;
  updateTicketStatus: (id: string, status: TicketStatus, technicianId?: string) => void;
  createOSFromTicket: (ticketId: string, technicianId: string, scheduledDate: string) => ServiceOrder;
  updateServiceOrder: (id: string, updates: Partial<ServiceOrder>) => void;
  completeServiceOrder: (
    id: string,
    data: {
      solution: string;
      signatureData?: string;
      signerName?: string;
      counters?: { total: number; mono: number; color: number };
      checklist: Array<{ task: string; done: boolean }>;
      partsUsed?: Array<{ itemId: string; quantity: number }>;
    }
  ) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  registerStockMovement: (data: {
    itemId: string;
    type: InventoryMovement['type'];
    quantity: number;
    reason: string;
    technicianName?: string;
  }) => void;
  addContract: (contract: Omit<Contract, 'id'>) => void;
  generateMonthlyClosing: (periodMonth: string) => { canFreeze: boolean; blockers: string[]; invoicesGenerated: number };
  freezeMonthlyInvoices: (periodMonth: string) => void;
  syncWithOracle: () => Promise<void>;
  resetToDefaultData: () => void;
}

const SantaContext = createContext<SantaContextType | null>(null);

const STORAGE_PREFIX = 'santa_mps_v1_';

export function SantaProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [printers, setPrinters] = useState<Printer[]>(INITIAL_PRINTERS);
  const [meters, setMeters] = useState<MeterReading[]>(INITIAL_METERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS);
  const [alerts, setAlerts] = useState<AlertEvent[]>(INITIAL_ALERTS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(INITIAL_SERVICE_ORDERS);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [routes, setRoutes] = useState<RouteStop[]>(INITIAL_ROUTES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [agents, setAgents] = useState<AgentDevice[]>(INITIAL_AGENTS);
  const [oracleLogs, setOracleLogs] = useState<OracleSyncLog[]>(INITIAL_ORACLE_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [, startTransition] = useTransition();

  // Load from LocalStorage on mount (client-side only)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        const savedPrinters = localStorage.getItem(`${STORAGE_PREFIX}printers`);
        if (savedPrinters) setPrinters(JSON.parse(savedPrinters));

        const savedTickets = localStorage.getItem(`${STORAGE_PREFIX}tickets`);
        if (savedTickets) setTickets(JSON.parse(savedTickets));

        const savedOS = localStorage.getItem(`${STORAGE_PREFIX}serviceOrders`);
        if (savedOS) setServiceOrders(JSON.parse(savedOS));

        const savedClients = localStorage.getItem(`${STORAGE_PREFIX}clients`);
        if (savedClients) setClients(JSON.parse(savedClients));

        const savedInvoices = localStorage.getItem(`${STORAGE_PREFIX}invoices`);
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

        const savedInventory = localStorage.getItem(`${STORAGE_PREFIX}inventory`);
        if (savedInventory) setInventory(JSON.parse(savedInventory));
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addAuditLog = (action: AuditLog['action'], entity: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      ipAddress: '127.0.0.1 (Web Portal)',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const setCurrentRole = (role: UserRole) => {
    const matchingUser = INITIAL_USERS.find((u) => u.role === role) || {
      ...currentUser,
      role,
      name: role === 'CLIENTE' ? 'Dr. Fernando Prado (Cliente)' : `${role.charAt(0) + role.slice(1).toLowerCase()} Usuário`,
      clientId: role === 'CLIENTE' ? 'cli-1' : undefined,
    };
    setCurrentUser(matchingUser);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(matchingUser));
    } catch {}
    addAuditLog('LOGIN', 'USER_SESSION', matchingUser.id, `Trocou de perfil para ${role}`);
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => {
      const updated = [newClient, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}clients`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('CREATE', 'CLIENT', newClient.id, `Cadastrou novo cliente: ${newClient.tradeName}`);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(`${STORAGE_PREFIX}clients`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('UPDATE', 'CLIENT', id, `Atualizou dados cadastrais do cliente`);
  };

  const addPrinter = (printerData: Omit<Printer, 'id'>) => {
    const newPrinter: Printer = {
      ...printerData,
      id: `prt-${Date.now()}`,
    };
    setPrinters((prev) => {
      const updated = [newPrinter, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}printers`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('CREATE', 'PRINTER', newPrinter.id, `Cadastrou equipamento ${newPrinter.model} (${newPrinter.code})`);
  };

  const updatePrinter = (id: string, updates: Partial<Printer>) => {
    setPrinters((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(`${STORAGE_PREFIX}printers`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('UPDATE', 'PRINTER', id, `Alterou parâmetros da impressora`);
  };

  const registerMeterReading = (data: {
    printerId: string;
    counterTotal: number;
    counterMono: number;
    counterColor: number;
    counterPrints?: number;
    counterCopies?: number;
    counterScans?: number;
    source?: 'SNMP' | 'AGENT' | 'MANUAL' | 'HTTP';
  }) => {
    const printer = printers.find((p) => p.id === data.printerId);
    if (!printer) {
      return { success: false, validationStatus: 'INCONSISTENTE', inconsistencyReason: 'Impressora não encontrada', productionTotal: 0 };
    }

    const prevCounters = printer.lastCounters || { total: 0, mono: 0, color: 0, prints: 0, copies: 0, scans: 0, readAt: '' };
    const prodResult = calculateProduction(data.counterTotal, prevCounters.total);
    const monoProdResult = calculateProduction(data.counterMono, prevCounters.mono);
    const colorProdResult = calculateProduction(data.counterColor, prevCounters.color);

    const client = clients.find((c) => c.id === printer.clientId);

    const newMeter: MeterReading = {
      id: `met-${Date.now()}`,
      printerId: printer.id,
      printerSerial: printer.serialNumber,
      printerModel: printer.model,
      clientName: client?.tradeName || printer.location,
      timestamp: new Date().toISOString(),
      counterTotal: data.counterTotal,
      counterMono: data.counterMono,
      counterColor: data.counterColor,
      counterPrints: data.counterPrints ?? prevCounters.prints,
      counterCopies: data.counterCopies ?? prevCounters.copies,
      counterScans: data.counterScans ?? prevCounters.scans,
      productionTotal: prodResult.production,
      productionMono: monoProdResult.production,
      productionColor: colorProdResult.production,
      source: data.source || 'MANUAL',
      validationStatus: prodResult.validationStatus,
      inconsistencyReason: prodResult.inconsistencyReason,
    };

    setMeters((prev) => [newMeter, ...prev]);

    // Atualizar último contador na impressora
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === data.printerId
          ? {
              ...p,
              lastCommunication: new Date().toISOString(),
              status: p.status === 'OFFLINE' ? 'ATIVA' : p.status,
              lastCounters: {
                total: data.counterTotal,
                mono: data.counterMono,
                color: data.counterColor,
                prints: data.counterPrints ?? prevCounters.prints,
                copies: data.counterCopies ?? prevCounters.copies,
                scans: data.counterScans ?? prevCounters.scans,
                readAt: new Date().toISOString(),
              },
            }
          : p
      )
    );

    // Se houve inconsistência, gerar alerta automático (README Seção 20 e 26)
    if (prodResult.validationStatus === 'INCONSISTENTE') {
      const alert: AlertEvent = {
        id: `alt-${Date.now()}`,
        type: 'CONTADOR_INCONSISTENTE',
        severity: 'ALTA',
        status: 'ABERTO',
        title: `Contador Inconsistente em ${printer.code}`,
        description: prodResult.inconsistencyReason || 'Leitura menor que o contador anterior.',
        entityType: 'PRINTER',
        entityId: printer.id,
        entityName: `${printer.code} (${printer.model})`,
        clientId: printer.clientId,
        clientName: client?.tradeName,
        createdAt: new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev]);
    }

    addAuditLog(
      'CREATE',
      'METER_READING',
      newMeter.id,
      `Registrou leitura ${data.counterTotal} pág (${data.source || 'MANUAL'}) - Produção: ${prodResult.production} pág`
    );

    return {
      success: prodResult.isValid,
      validationStatus: prodResult.validationStatus,
      inconsistencyReason: prodResult.inconsistencyReason,
      productionTotal: prodResult.production,
    };
  };

  const simulateAgentCollection = (targetPrinterId?: string) => {
    startTransition(() => {
      const selectedPrinters = targetPrinterId
        ? printers.filter((p) => p.id === targetPrinterId)
        : printers.filter((p) => p.isMonitored);

      for (const printer of selectedPrinters) {
        const incrementMono = Math.floor(Math.random() * 250) + 50;
        const incrementColor = printer.isColor ? Math.floor(Math.random() * 100) + 15 : 0;
        const newTotal = (printer.lastCounters?.total || 0) + incrementMono + incrementColor;
        const newMono = (printer.lastCounters?.mono || 0) + incrementMono;
        const newColor = (printer.lastCounters?.color || 0) + incrementColor;

        registerMeterReading({
          printerId: printer.id,
          counterTotal: newTotal,
          counterMono: newMono,
          counterColor: newColor,
          source: 'AGENT',
        });

        // Consumo gradual de suprimentos (toner -1%)
        setPrinters((prev) =>
          prev.map((p) => {
            if (p.id !== printer.id) return p;
            const updatedSupplies = p.supplies.map((sup) => {
              if (sup.type.startsWith('TONER')) {
                const newPct = Math.max(2, sup.percent - Math.floor(Math.random() * 2));
                return {
                  ...sup,
                  percent: newPct,
                  status: (newPct <= 0 ? 'VAZIO' : newPct <= 10 ? 'CRÍTICO' : newPct <= 20 ? 'BAIXO' : 'NORMAL') as
                    | 'VAZIO'
                    | 'CRÍTICO'
                    | 'BAIXO'
                    | 'NORMAL',
                  estimatedPagesRemaining: Math.floor(newPct * 50),
                };
              }
              return sup;
            });
            return {
              ...p,
              supplies: updatedSupplies,
              lastCommunication: new Date().toISOString(),
              status: 'ATIVA',
            };
          })
        );
      }

      // Atualizar heartbeat do agente
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          lastHeartbeat: new Date().toISOString(),
          lastCollectionTime: new Date().toISOString(),
          status: 'ONLINE',
        }))
      );
    });
  };

  const addTicket = (data: {
    clientId: string;
    printerId?: string;
    requesterName: string;
    requesterEmail: string;
    category: Ticket['category'];
    priority: TicketPriority;
    description: string;
    origin?: Ticket['origin'];
  }): Ticket => {
    const client = clients.find((c) => c.id === data.clientId);
    const printer = printers.find((p) => p.id === data.printerId);
    const slaHours = getDefaultSLAHoursByPriority(data.priority);
    const deadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      code: `CH-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(4, '0')}`,
      clientId: data.clientId,
      clientName: client?.tradeName || 'Cliente',
      printerId: printer?.id,
      printerModel: printer?.model,
      printerSerial: printer?.serialNumber,
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      category: data.category,
      priority: data.priority,
      description: data.description,
      status: 'ABERTO',
      slaHours,
      slaDeadline: deadline,
      openedAt: new Date().toISOString(),
      origin: data.origin || (currentUser.role === 'CLIENTE' ? 'CLIENTE' : 'SUPORTE'),
    };

    setTickets((prev) => {
      const updated = [newTicket, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}tickets`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addAuditLog('CREATE', 'TICKET', newTicket.id, `Abertura de chamado ${newTicket.code} (${newTicket.category})`);

    return newTicket;
  };

  const updateTicketStatus = (id: string, status: TicketStatus, technicianId?: string) => {
    const tech = technicians.find((t) => t.id === technicianId);
    setTickets((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        const isResolving = status === 'RESOLVIDO' || status === 'FECHADO';
        return {
          ...t,
          status,
          assignedTechnicianId: technicianId || t.assignedTechnicianId,
          assignedTechnicianName: tech ? tech.name : t.assignedTechnicianName,
          attendedAt: t.attendedAt || (status === 'EM_ATENDIMENTO' ? new Date().toISOString() : undefined),
          resolvedAt: isResolving ? new Date().toISOString() : t.resolvedAt,
          closedAt: status === 'FECHADO' ? new Date().toISOString() : t.closedAt,
        };
      });
      try {
        localStorage.setItem(`${STORAGE_PREFIX}tickets`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('UPDATE', 'TICKET', id, `Status alterado para ${status}`);
  };

  const createOSFromTicket = (ticketId: string, technicianId: string, scheduledDate: string): ServiceOrder => {
    const ticket = tickets.find((t) => t.id === ticketId);
    const tech = technicians.find((t) => t.id === technicianId);
    const client = clients.find((c) => c.id === ticket?.clientId);
    const printer = printers.find((p) => p.id === ticket?.printerId);

    const newOS: ServiceOrder = {
      id: `os-${Date.now()}`,
      code: `OS-${new Date().getFullYear()}-${String(serviceOrders.length + 1).padStart(4, '0')}`,
      ticketId,
      ticketCode: ticket?.code || 'CH-0000',
      clientId: ticket?.clientId || '',
      clientName: ticket?.clientName || 'Cliente',
      branchName: client?.branches[0]?.name || 'Unidade Principal',
      address: client?.branches[0]?.address || 'Endereço do Cliente',
      printerId: printer?.id || '',
      printerModel: printer?.model || 'Impressora',
      printerSerial: printer?.serialNumber || 'N/A',
      technicianId,
      technicianName: tech?.name || 'Técnico Responsável',
      priority: ticket?.priority || 'NORMAL',
      status: 'ABERTA',
      scheduledDate,
      serviceDescription: ticket?.description || 'Atendimento técnico de campo',
      partsReplaced: [],
      checklist: [
        { task: 'Limpeza de carcaça e vidros de digitalização', done: false },
        { task: 'Inspeção de roletes de tração de papel', done: false },
        { task: 'Verificação do mecanismo do fusor e película', done: false },
        { task: 'Verificação de nível de toner e cilindro', done: false },
        { task: 'Impressão de página de diagnóstico e contador', done: false },
      ],
      countersAtService: printer?.lastCounters
        ? {
            total: printer.lastCounters.total,
            mono: printer.lastCounters.mono,
            color: printer.lastCounters.color,
          }
        : undefined,
    };

    setServiceOrders((prev) => {
      const updated = [newOS, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}serviceOrders`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Vincular chamado à OS
    updateTicketStatus(ticketId, 'AGENDADO', technicianId);

    // Criar parada de rota para o técnico
    const newRouteStop: RouteStop = {
      id: `rt-${Date.now()}`,
      technicianId,
      osId: newOS.id,
      osCode: newOS.code,
      clientId: newOS.clientId,
      clientName: newOS.clientName,
      address: newOS.address,
      city: client?.city || 'São Paulo',
      orderIndex: routes.filter((r) => r.technicianId === technicianId).length + 1,
      scheduledTime: '14:00',
      estimatedMinutes: 60,
      priority: newOS.priority,
      status: 'PENDENTE',
      latitude: client?.branches[0]?.latitude || -23.5505,
      longitude: client?.branches[0]?.longitude || -46.6333,
    };
    setRoutes((prev) => [...prev, newRouteStop]);

    addAuditLog('CREATE', 'SERVICE_ORDER', newOS.id, `Gerou ${newOS.code} vinculada ao chamado ${newOS.ticketCode}`);

    return newOS;
  };

  const updateServiceOrder = (id: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders((prev) => {
      const updated = prev.map((os) => (os.id === id ? { ...os, ...updates } : os));
      try {
        localStorage.setItem(`${STORAGE_PREFIX}serviceOrders`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('UPDATE', 'SERVICE_ORDER', id, `Atualizou dados da Ordem de Serviço`);
  };

  const completeServiceOrder = (
    id: string,
    data: {
      solution: string;
      signatureData?: string;
      signerName?: string;
      counters?: { total: number; mono: number; color: number };
      checklist: Array<{ task: string; done: boolean }>;
      partsUsed?: Array<{ itemId: string; quantity: number }>;
    }
  ) => {
    const os = serviceOrders.find((o) => o.id === id);
    if (!os) return;

    // Se houve peças utilizadas, dar baixa automática no estoque com movimento
    if (data.partsUsed && data.partsUsed.length > 0) {
      for (const part of data.partsUsed) {
        registerStockMovement({
          itemId: part.itemId,
          type: 'CONSUMO',
          quantity: part.quantity,
          reason: `Consumo na ${os.code} - ${os.clientName}`,
          technicianName: os.technicianName,
        });
      }
    }

    // Se foram informados contadores no encerramento, registrar nova leitura
    if (data.counters && os.printerId) {
      registerMeterReading({
        printerId: os.printerId,
        counterTotal: data.counters.total,
        counterMono: data.counters.mono,
        counterColor: data.counters.color,
        source: 'MANUAL',
      });
    }

    setServiceOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'CONCLUIDA',
              solution: data.solution,
              checklist: data.checklist,
              customerSignature: data.signatureData,
              customerSignerName: data.signerName,
              finishedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Finalizar chamado original
    updateTicketStatus(os.ticketId, 'RESOLVIDO', os.technicianId);

    // Atualizar rota
    setRoutes((prev) => prev.map((r) => (r.osId === id ? { ...r, status: 'CONCLUIDO' } : r)));

    addAuditLog('CLOSE', 'SERVICE_ORDER', id, `Encerrou OS ${os.code} com assinatura de ${data.signerName || 'Cliente'}`);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: 'RECONHECIDO' } : a)));
    addAuditLog('UPDATE', 'ALERT', alertId, 'Alerta reconhecido pelo operador');
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVIDO', resolvedAt: new Date().toISOString() } : a))
    );
    addAuditLog('UPDATE', 'ALERT', alertId, 'Alerta marcado como resolvido');
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}inventory`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addAuditLog('CREATE', 'INVENTORY', newItem.id, `Novo item cadastrado: ${newItem.sku} - ${newItem.description}`);
  };

  const registerStockMovement = (data: {
    itemId: string;
    type: InventoryMovement['type'];
    quantity: number;
    reason: string;
    technicianName?: string;
  }) => {
    const item = inventory.find((i) => i.id === data.itemId);
    if (!item) return;

    let newQty = item.currentQuantity;
    if (data.type === 'ENTRADA' || data.type === 'DEVOLUCAO' || data.type === 'REPOSICAO') {
      newQty += data.quantity;
    } else {
      newQty = Math.max(0, newQty - data.quantity);
    }

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      itemDescription: item.description,
      type: data.type,
      quantity: data.quantity,
      previousQuantity: item.currentQuantity,
      newQuantity: newQty,
      reason: data.reason,
      technicianName: data.technicianName,
      timestamp: new Date().toISOString(),
      registeredBy: currentUser.name,
    };

    setMovements((prev) => [movement, ...prev]);
    setInventory((prev) => prev.map((i) => (i.id === data.itemId ? { ...i, currentQuantity: newQty } : i)));

    // Se estoque ficou abaixo do mínimo, gerar alerta automático (README Seção 26)
    if (newQty < item.minQuantity) {
      const alert: AlertEvent = {
        id: `alt-${Date.now()}`,
        type: 'ESTOQUE_BAIXO',
        severity: 'ALTA',
        status: 'ABERTO',
        title: `Estoque Baixo: ${item.sku}`,
        description: `Item ${item.description} possui apenas ${newQty} un (Mínimo: ${item.minQuantity} un).`,
        entityType: 'INVENTORY',
        entityId: item.id,
        entityName: item.description,
        createdAt: new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev]);
    }

    addAuditLog('UPDATE', 'INVENTORY', item.id, `Movimentação ${data.type}: ${data.quantity} un (${data.reason})`);
  };

  const addContract = (contractData: Omit<Contract, 'id'>) => {
    const newContract: Contract = {
      ...contractData,
      id: `ctr-${Date.now()}`,
    };
    setContracts((prev) => [newContract, ...prev]);
    addAuditLog('CREATE', 'CONTRACT', newContract.id, `Cadastrou contrato ${newContract.code}`);
  };

  const generateMonthlyClosing = (periodMonth: string) => {
    // 1. Verificar bloqueios (README Seção 44)
    const { canFreeze, blockingIssues } = checkClosingBlockers(printers, meters);
    if (!canFreeze) {
      return {
        canFreeze: false,
        blockers: blockingIssues.map((b) => `${b.printerCode}: ${b.reason}`),
        invoicesGenerated: 0,
      };
    }

    // 2. Calcular fatura para cada contrato ativo
    let count = 0;
    const generated: Invoice[] = [];

    for (const contract of contracts.filter((c) => c.status === 'ATIVO')) {
      // Contabilizar leituras de impressoras associadas
      const client = clients.find((c) => c.id === contract.clientId);
      const contractPrinters = printers.filter((p) => contract.printerIds.includes(p.id));

      let monoTotalProd = 0;
      let colorTotalProd = 0;

      for (const prt of contractPrinters) {
        const prtMeters = meters.filter((m) => m.printerId === prt.id);
        const latestMeter = prtMeters[0];
        if (latestMeter) {
          monoTotalProd += latestMeter.productionMono || 0;
          colorTotalProd += latestMeter.productionColor || 0;
        }
      }

      // Se produção estiver vazia (primeiro ciclo), gerar valor estimado representativo
      if (monoTotalProd === 0 && colorTotalProd === 0) {
        monoTotalProd = contract.franchiseMonoPages ? Math.floor(contract.franchiseMonoPages * 1.08) : 5000;
        colorTotalProd = contract.franchiseColorPages ? Math.floor(contract.franchiseColorPages * 1.15) : 0;
      }

      const billing = calculateContractBilling(contract, monoTotalProd, colorTotalProd, 0);

      const newInv: Invoice = {
        id: `fat-${Date.now()}-${count}`,
        code: `FAT-${periodMonth}-${String(invoices.length + count + 1).padStart(3, '0')}`,
        contractId: contract.id,
        contractCode: contract.code,
        clientId: contract.clientId,
        clientName: client?.tradeName || contract.clientName,
        periodMonth,
        periodLabel: `Competência ${periodMonth}`,
        monoProduction: monoTotalProd,
        colorProduction: colorTotalProd,
        monoFranchise: billing.monoFranchise,
        colorFranchise: billing.colorFranchise,
        monoSurplus: billing.monoSurplus,
        colorSurplus: billing.colorSurplus,
        monthlyFixedFee: billing.monthlyFixedFee,
        monoSurplusTotal: billing.monoSurplusTotal,
        colorSurplusTotal: billing.colorSurplusTotal,
        adjustments: 0,
        totalAmount: billing.totalAmount,
        dueDate: `${periodMonth}-${String(contract.billingDay).padStart(2, '0')}`,
        status: 'EM_CONFERENCIA',
        generatedAt: new Date().toISOString(),
        isFrozen: false,
      };

      generated.push(newInv);
      count++;
    }

    setInvoices((prev) => [...generated, ...prev]);
    addAuditLog('CREATE', 'BILLING_CLOSING', periodMonth, `Processou pré-fechamento do mês ${periodMonth} (${count} faturas)`);

    return {
      canFreeze: true,
      blockers: [],
      invoicesGenerated: count,
    };
  };

  const freezeMonthlyInvoices = (periodMonth: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.periodMonth === periodMonth ? { ...inv, status: 'FATURADA', isFrozen: true } : inv))
    );
    addAuditLog('APPROVE', 'BILLING_CLOSING', periodMonth, `Homologou e congelou fechamento de bilhetagem ${periodMonth}`);
  };

  const syncWithOracle = async (): Promise<void> => {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 800));
    const duration = Date.now() - startTime;

    const newLog: OracleSyncLog = {
      id: `orc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entity: 'FATURAMENTO',
      recordsCount: invoices.length,
      status: 'SINCRONIZADO',
      durationMs: duration,
      details: `Sincronização bidirecional realizada com Oracle ERP 19c com sucesso (${invoices.length} títulos processados).`,
    };

    setOracleLogs((prev) => [newLog, ...prev]);
    addAuditLog('SYNC', 'ORACLE_ERP', 'SYNC-JOB', 'Executou sincronização de dados cadastrais e financeiros com Oracle ERP');
  };

  const resetToDefaultData = () => {
    setClients(INITIAL_CLIENTS);
    setPrinters(INITIAL_PRINTERS);
    setMeters(INITIAL_METERS);
    setInventory(INITIAL_INVENTORY);
    setMovements(INITIAL_MOVEMENTS);
    setAlerts(INITIAL_ALERTS);
    setTickets(INITIAL_TICKETS);
    setServiceOrders(INITIAL_SERVICE_ORDERS);
    setTechnicians(INITIAL_TECHNICIANS);
    setRoutes(INITIAL_ROUTES);
    setContracts(INITIAL_CONTRACTS);
    setInvoices(INITIAL_INVOICES);
    setAgents(INITIAL_AGENTS);
    setOracleLogs(INITIAL_ORACLE_LOGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return (
    <SantaContext.Provider
      value={{
        currentUser,
        setCurrentRole,
        clients,
        printers,
        meters,
        inventory,
        movements,
        alerts,
        tickets,
        serviceOrders,
        technicians,
        routes,
        contracts,
        invoices,
        agents,
        oracleLogs,
        auditLogs,
        searchQuery,
        setSearchQuery,
        addClient,
        updateClient,
        addPrinter,
        updatePrinter,
        registerMeterReading,
        simulateAgentCollection,
        addTicket,
        updateTicketStatus,
        createOSFromTicket,
        updateServiceOrder,
        completeServiceOrder,
        acknowledgeAlert,
        resolveAlert,
        addInventoryItem,
        registerStockMovement,
        addContract,
        generateMonthlyClosing,
        freezeMonthlyInvoices,
        syncWithOracle,
        resetToDefaultData,
      }}
    >
      {children}
    </SantaContext.Provider>
  );
}

export function useSantaStore() {
  const context = useContext(SantaContext);
  if (!context) {
    throw new Error('useSantaStore must be used within a SantaProvider');
  }
  return context;
}
