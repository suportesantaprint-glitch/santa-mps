export type UserRole =
  | 'ADMIN'
  | 'GESTOR'
  | 'GERENCIA'
  | 'SUPORTE'
  | 'TECNICO'
  | 'FATURAMENTO'
  | 'SUPRIMENTOS'
  | 'ESTOQUISTA'
  | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string; // If role === 'CLIENTE'
  avatar?: string;
  companyId: string;
}

export interface ClientBranch {
  id: string;
  clientId: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  contactPerson: string;
  latitude: number;
  longitude: number;
}

export interface ClientDepartment {
  id: string;
  clientId?: string;
  name: string;
  costCenter?: string;
}

export interface Client {
  id: string;
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  stateRegistration: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  notes?: string;
  branches: ClientBranch[];
  departments: ClientDepartment[];
  createdAt: string;
}

export type PrinterStatus =
  | 'ATIVA'
  | 'INATIVA'
  | 'OFFLINE'
  | 'EM_MANUTENÇÃO'
  | 'EM_ESTOQUE'
  | 'EM_TRANSITO'
  | 'DESCARTADA'
  | 'BACKUP';

export interface PrinterSupply {
  type: 'TONER_BLACK' | 'TONER_CYAN' | 'TONER_MAGENTA' | 'TONER_YELLOW' | 'DRUM' | 'FUSER' | 'WASTE_BOX';
  label: string;
  percent: number;
  status: 'NORMAL' | 'BAIXO' | 'CRÍTICO' | 'VAZIO';
  estimatedPagesRemaining: number;
  model: string;
  colorCode: string;
}

export interface Printer {
  id: string;
  code: string;
  serialNumber: string;
  assetTag: string; // Patrimônio
  manufacturer: string;
  model: string;
  ipAddress: string;
  macAddress: string;
  hostname: string;
  location: string;
  clientId: string;
  branchId: string;
  departmentId: string;
  contractId?: string;
  type: 'MULTIFUNCIONAL' | 'IMPRESSORA' | 'SCANNER';
  technology: 'LASER' | 'TANQUE_TINTA' | 'CERA';
  isColor: boolean;
  maxPaperSize: 'A4' | 'A3';
  connectionType: 'REDE' | 'USB';
  status: PrinterStatus;
  isMonitored: boolean;
  installedAt: string;
  lastCommunication: string;
  snmpCommunity?: string;
  firmwareVersion?: string;
  supplies: PrinterSupply[];
  lastCounters: {
    total: number;
    mono: number;
    color: number;
    prints: number;
    copies: number;
    scans: number;
    readAt: string;
  };
}

export type CounterValidationStatus = 'NORMAL' | 'ATENÇÃO' | 'INCONSISTENTE' | 'AGUARDANDO_VALIDACAO';

export interface MeterReading {
  id: string;
  printerId: string;
  printerSerial: string;
  printerModel: string;
  clientName: string;
  timestamp: string;
  counterTotal: number;
  counterMono: number;
  counterColor: number;
  counterPrints: number;
  counterCopies: number;
  counterScans: number;
  productionTotal?: number;
  productionMono?: number;
  productionColor?: number;
  source: 'SNMP' | 'AGENT' | 'MANUAL' | 'HTTP';
  agentId?: string;
  validationStatus: CounterValidationStatus;
  inconsistencyReason?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  description: string;
  manufacturer: string;
  compatibleModels: string;
  category: 'TONER' | 'CILINDRO' | 'FUSOR' | 'PECA' | 'KIT';
  unit: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  location: string;
  locationWarehouse?: string;
  unitCost: number;
  supplier: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemDescription: string;
  type: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'DEVOLUCAO' | 'AJUSTE' | 'CONSUMO' | 'REPOSICAO';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  technicianName?: string;
  printerId?: string;
  timestamp: string;
  registeredBy: string;
}

export type AlertType =
  | 'IMPRESSORA_OFFLINE'
  | 'SEM_COMUNICACAO'
  | 'TONER_BAIXO'
  | 'TONER_CRITICO'
  | 'TONER_VAZIO'
  | 'ERRO_IMPRESSORA'
  | 'ATOLAMENTO'
  | 'FALHA_FUSOR'
  | 'FALHA_CILINDRO'
  | 'CONTADOR_INCONSISTENTE'
  | 'AGENTE_OFFLINE'
  | 'MANUTENCAO_PREVENTIVA'
  | 'CONTRATO_VENCENDO'
  | 'SLA_ESTOURADO'
  | 'ESTOQUE_BAIXO';

export type AlertSeverity = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'CRÍTICA' | 'MÉDIA';
export type AlertStatus = 'ABERTO' | 'RECONHECIDO' | 'EM_ANALISE' | 'RESOLVIDO' | 'IGNORADO';

export interface AlertEvent {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  entityType: 'PRINTER' | 'CONTRACT' | 'AGENT' | 'INVENTORY' | 'TICKET';
  entityId: string;
  entityName: string;
  clientId?: string;
  clientName?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type TicketStatus =
  | 'ABERTO'
  | 'TRIAGEM'
  | 'EM_ATENDIMENTO'
  | 'AGENDADO'
  | 'AGUARDANDO_CLIENTE'
  | 'AGUARDANDO_PECA'
  | 'AGUARDANDO_TECNICO'
  | 'RESOLVIDO'
  | 'CANCELADO'
  | 'FECHADO';

export type TicketPriority = 'BAIXA' | 'NORMAL' | 'ALTA' | 'CRITICA';

export interface Ticket {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  departmentName?: string;
  printerId?: string;
  printerModel?: string;
  printerSerial?: string;
  requesterName: string;
  requesterEmail: string;
  category: 'SUPRIMENTO' | 'DEFEITO' | 'DEFEITO_MECANICO' | 'QUALIDADE_IMPRESSAO' | 'REDE_CONECTIVIDADE' | 'ATOLAMENTO' | 'CONFIGURACAO' | 'OUTROS';
  subcategory?: string;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  slaHours: number;
  slaDeadline: string;
  openedAt: string;
  attendedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  origin: 'CLIENTE' | 'SUPORTE' | 'TECNICO' | 'SISTEMA' | 'MONITORAMENTO';
}

export interface ServiceOrder {
  id: string;
  code: string;
  ticketId: string;
  ticketCode: string;
  clientId: string;
  clientName: string;
  branchName: string;
  address: string;
  printerId: string;
  printerModel: string;
  printerSerial: string;
  technicianId: string;
  technicianName: string;
  priority: TicketPriority;
  status: 'ABERTA' | 'EM_DESLOCAMENTO' | 'EM_EXECUCAO' | 'CONCLUIDA' | 'CANCELADA';
  scheduledDate: string;
  serviceDescription: string;
  diagnosis?: string;
  solution?: string;
  partsReplaced: Array<{
    itemId: string;
    description: string;
    quantity: number;
  }>;
  checklist: Array<{
    task: string;
    done: boolean;
  }>;
  countersAtService?: {
    total: number;
    mono: number;
    color: number;
  };
  customerSignerName?: string;
  customerSignature?: string; // base64 or drawn representation
  startedAt?: string;
  finishedAt?: string;
}

export interface Technician {
  id: string;
  name: string;
  registrationNumber: string;
  cpf: string;
  phone: string;
  email: string;
  specialty: string;
  coverageCities: string[];
  status: 'DISPONIVEL' | 'EM_ROTA' | 'EM_ATENDIMENTO' | 'PAUSA' | 'INATIVO';
  currentLatitude: number;
  currentLongitude: number;
  vehiclePlate?: string;
  activeRouteCount?: number;
}

export interface RouteStop {
  id: string;
  technicianId: string;
  osId: string;
  osCode: string;
  clientId: string;
  clientName: string;
  address: string;
  city: string;
  orderIndex: number;
  scheduledTime: string;
  estimatedMinutes: number;
  priority: TicketPriority;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  latitude: number;
  longitude: number;
}

export type ContractType = 'LOCAÇÃO' | 'BILHETAGEM' | 'FRANQUIA' | 'PÁGINA EXCEDENTE' | 'MENSALIDADE' | 'HÍBRIDO';

export interface Contract {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  type: ContractType;
  status: 'ATIVO' | 'VENCIDO' | 'RESCINDIDO' | 'EM_NEGOCIACAO';
  startDate: string;
  endDate: string;
  billingDay: number; // dia do corte
  monthlyFixedFee: number;
  franchiseMonoPages: number;
  franchiseColorPages: number;
  costPerMonoSurplus: number;
  costPerColorSurplus: number;
  costMinimum: number;
  slaResponseHours: number;
  printerIds: string[];
  notes?: string;
  billingPeriod?: string;
  adjustmentIndex?: string;
  autoRenew?: boolean;
}

export type InvoiceStatus = 'ABERTA' | 'EM_CONFERENCIA' | 'APROVADA' | 'FATURADA' | 'ENVIADA' | 'PAGA' | 'CANCELADA';

export interface Invoice {
  id: string;
  code: string;
  contractId: string;
  contractCode: string;
  clientId: string;
  clientName: string;
  periodMonth: string; // "2026-09"
  periodLabel: string; // "Setembro/2026"
  monoProduction: number;
  colorProduction: number;
  monoFranchise: number;
  colorFranchise: number;
  monoSurplus: number;
  colorSurplus: number;
  monthlyFixedFee: number;
  monoSurplusTotal: number;
  colorSurplusTotal: number;
  adjustments: number; // acréscimos (+) ou descontos (-)
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  generatedAt: string;
  isFrozen: boolean;
  notes?: string;
}

export interface BillingClosing {
  id: string;
  periodMonth: string;
  status: 'ABERTO' | 'EM_CONFERENCIA' | 'CONGELADO' | 'FATURADO';
  totalInvoices: number;
  totalAmount: number;
  totalPrinters: number;
  totalPagesMono: number;
  totalPagesColor: number;
  blockingIssuesCount: number;
  createdAt: string;
  frozenAt?: string;
}

export interface AgentDevice {
  id: string;
  agentId: string;
  hostname: string;
  ipAddress: string;
  version: string;
  osVersion: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  lastHeartbeat: string;
  monitoredPrinterCount: number;
  lastCollectionTime: string;
  pendingQueueCount: number;
  clientName?: string;
  agentToken?: string;
  discoverySubnet?: string;
  discoveredPrintersCount?: number;
}

export interface OracleSyncLog {
  id: string;
  timestamp: string;
  entity: 'CLIENTES' | 'CONTRATOS' | 'FATURAMENTO' | 'EQUIPAMENTOS' | 'TECNICOS';
  recordsCount: number;
  status: 'SINCRONIZADO' | 'PENDENTE' | 'ERRO';
  durationMs: number;
  details: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'APPROVE' | 'CANCEL' | 'CLOSE' | 'SYNC';
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
}
