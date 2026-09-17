# 🖨️ Santa MPS

## Sistema completo de gestão, monitoramento e operação para Outsourcing de Impressão

> Plataforma web completa para empresas de locação, outsourcing e gerenciamento de parques de impressoras.
>
> O objetivo deste projeto é centralizar **monitoramento, contadores, suprimentos, contratos, faturamento, chamados, ordens de serviço, técnicos, rotas, clientes, estoque, alertas, relatórios e integrações** em uma única plataforma.

---

# 📌 1. Visão do Produto

O sistema deverá funcionar como uma plataforma SaaS/ERP especializada em outsourcing de impressão.

O fluxo principal da plataforma será:

```text
                 ┌──────────────────────┐
                 │       CLIENTES       │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       IMPRESSORAS      CONTRATOS       USUÁRIOS
             │              │
             ▼              ▼
          AGENTE        FATURAMENTO
             │
       ┌─────┼─────┐
       │     │     │
       ▼     ▼     ▼
   CONTADOR TONER ALERTA
       │
       ▼
    MONITORAMENTO
       │
       ▼
     CHAMADO
       │
       ▼
       OS
       │
       ▼
    TÉCNICO
       │
       ▼
      ROTA
       │
       ▼
   ATENDIMENTO
       │
       ▼
   ENCERRAMENTO
```

---

# 🎯 2. Objetivos

O sistema deverá:

* controlar clientes;
* controlar filiais;
* controlar departamentos;
* controlar impressoras;
* monitorar equipamentos;
* coletar contadores;
* coletar níveis de suprimentos;
* detectar alertas;
* controlar contratos;
* calcular produção;
* realizar fechamento mensal;
* auxiliar o faturamento;
* controlar toner e peças;
* controlar estoque;
* receber chamados;
* controlar SLA;
* gerar ordens de serviço;
* controlar técnicos;
* organizar rotas;
* controlar instalações;
* controlar movimentação de equipamentos;
* disponibilizar portal do cliente;
* disponibilizar dashboards;
* gerar relatórios;
* disponibilizar API;
* permitir integração com ERP;
* permitir integração com banco Oracle;
* permitir integração com Supabase;
* possuir agente Windows;
* possuir auditoria completa.

---

# 🏗️ 3. Arquitetura Geral

## 3.1 Componentes

O projeto deverá ser dividido em:

```text
Web App
   │
   ├── Frontend
   │
   ├── API
   │
   ├── Banco de Dados
   │
   ├── Sistema de autenticação
   │
   ├── Processamento
   │
   ├── Jobs/Filas
   │
   ├── Notificações
   │
   └── Integrações
          │
          ├── Agente Windows
          ├── SNMP
          ├── Oracle
          ├── ERP
          ├── E-mail
          └── Webhooks
```

---

# 💻 4. Stack Tecnológica

## Frontend

Utilizar:

* Next.js;
* React;
* TypeScript;
* Tailwind CSS;
* componentes reutilizáveis;
* gráficos;
* tabelas avançadas;
* mapas;
* filtros;
* modais;
* notificações;
* responsividade.

## Backend

Utilizar:

* API REST;
* TypeScript;
* validação;
* autenticação;
* autorização;
* processamento assíncrono;
* filas;
* cron jobs;
* logs;
* auditoria.

## Banco de dados

Utilizar:

* PostgreSQL;
* Supabase;
* Row Level Security;
* migrations;
* índices;
* relacionamentos;
* triggers quando necessário.

## Infraestrutura

Preferencialmente:

```text
Frontend/API  → Vercel
Banco         → Supabase PostgreSQL
Agente        → Windows Service
Arquivos      → Storage
E-mails       → SMTP / provedor transacional
Monitoramento → SNMP
Integrações   → REST API / Webhooks
```

---

# 🔐 5. Segurança

## Regras obrigatórias

Nunca colocar no GitHub:

```text
SENHAS
TOKENS
API KEYS
DATABASE PASSWORD
SERVICE ROLE KEY
PRIVATE KEY
JWT SECRET
SMTP PASSWORD
```

Utilizar:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
ORACLE_HOST=
ORACLE_PORT=
ORACLE_SERVICE=
ORACLE_USER=
ORACLE_PASSWORD=
```

Todas as credenciais devem existir somente em variáveis de ambiente.

---

# 👥 6. Usuários e Permissões

O sistema deverá possuir RBAC.

## Perfis padrão

### Administrador

Acesso total.

### Dono/Gestor

Acesso aos indicadores, financeiro, contratos, clientes e operação.

### Gerência

Acesso aos indicadores, equipe, clientes, contratos, chamados, OS e relatórios.

### Suporte

Acesso aos chamados, equipamentos, clientes e OS.

### Técnico

Acesso somente às suas atividades, rotas e ordens de serviço.

### Faturamento

Acesso a:

* contratos;
* contadores;
* produção;
* fechamento;
* faturamento;
* relatórios financeiros.

### Suprimentos

Acesso a:

* estoque;
* toner;
* peças;
* requisições;
* movimentações.

### Estoquista

Acesso operacional ao estoque.

### Cliente

Acesso somente aos seus próprios dados.

---

# 🏢 7. Multiempresa / Multitenancy

O sistema deverá suportar múltiplas empresas.

Estrutura:

```text
EMPRESA
 ├── USUÁRIOS
 ├── CLIENTES
 ├── CONTRATOS
 ├── IMPRESSORAS
 ├── ESTOQUE
 ├── CHAMADOS
 ├── OS
 ├── TÉCNICOS
 └── FATURAMENTO
```

Toda informação deverá possuir isolamento por empresa.

Nenhum usuário poderá consultar dados de outra empresa.

---

# 👤 8. Clientes

## Cadastro

Campos:

* ID;
* razão social;
* nome fantasia;
* CNPJ;
* inscrição estadual;
* telefone;
* e-mail;
* endereço;
* CEP;
* cidade;
* estado;
* responsável;
* observações;
* status.

## Estrutura

```text
CLIENTE
 ├── FILIAIS
 ├── DEPARTAMENTOS
 ├── CONTATOS
 ├── IMPRESSORAS
 ├── CONTRATOS
 ├── CHAMADOS
 ├── OS
 └── FATURAMENTO
```

---

# 🏭 9. Filiais

Cada cliente poderá possuir diversas filiais.

Campos:

* cliente;
* CNPJ;
* nome;
* endereço;
* cidade;
* estado;
* CEP;
* telefone;
* responsável;
* horário de atendimento;
* timezone;
* observação.

---

# 🏷️ 10. Departamentos

Exemplos:

```text
RH
Financeiro
Almoxarifado
Produção
Administrativo
TI
Expedição
Recepção
Portaria
Diretoria
```

Cada equipamento poderá estar vinculado a um departamento.

---

# 🖨️ 11. Cadastro de Impressoras

Cada equipamento deverá conter:

* ID;
* fabricante;
* modelo;
* número de série;
* patrimônio;
* IP;
* MAC;
* hostname;
* localização;
* departamento;
* cliente;
* filial;
* contrato;
* tipo;
* tecnologia;
* monocromática/colorida;
* tamanho máximo;
* USB/rede;
* status;
* data de instalação;
* data de retirada;
* observações.

## Status

```text
ATIVA
INATIVA
OFFLINE
EM_MANUTENÇÃO
EM_ESTOQUE
EM_TRANSITO
DESCARTADA
BACKUP
```

---

# 🔎 12. Parque de Impressoras

Criar tela:

```text
Impressoras
```

Com:

* filtros;
* busca;
* cliente;
* filial;
* cidade;
* modelo;
* fabricante;
* status;
* técnico;
* contrato;
* monitorada/não monitorada;
* última comunicação.

Colunas configuráveis.

Permitir exportação:

* Excel;
* CSV;
* PDF.

---

# 📡 13. Monitoramento

O sistema deverá possuir monitoramento automático.

Tipos:

```text
SNMP
HTTP
HTTPS
USB
CONTADOR MANUAL
API
```

---

# 🤖 14. Agente Windows

Criar um agente instalado no ambiente do cliente.

Nome sugerido:

```text
PrintControl Agent
```

## Funções

O agente deverá:

1. descobrir impressoras;
2. verificar IP;
3. consultar SNMP;
4. consultar HTTP quando necessário;
5. coletar contadores;
6. coletar suprimentos;
7. coletar alertas;
8. identificar fabricante;
9. identificar modelo;
10. identificar número de série;
11. identificar status;
12. detectar mudança de IP;
13. enviar dados para API;
14. executar heartbeat;
15. guardar cache local;
16. repetir envio em caso de falha;
17. atualizar automaticamente.

---

# 🔄 15. Ciclo do Agente

```text
AGENTE
  │
  ▼
DISCOVERY
  │
  ▼
IDENTIFICA IMPRESSORA
  │
  ▼
SNMP / HTTP
  │
  ▼
COLETA DADOS
  │
  ▼
VALIDAÇÃO
  │
  ▼
CRIPTOGRAFIA
  │
  ▼
HTTPS
  │
  ▼
API
  │
  ▼
PROCESSAMENTO
  │
  ▼
BANCO
```

---

# ❤️ 16. Heartbeat

O agente deverá enviar periodicamente:

```json
{
  "agent_id": "AGT-00001",
  "hostname": "SERVIDOR-CLIENTE",
  "version": "1.0.0",
  "ip": "192.168.1.10",
  "timestamp": "2026-09-17T14:00:00"
}
```

O servidor deverá registrar:

* última comunicação;
* versão;
* IP;
* hostname;
* status;
* erros;
* quantidade de impressoras;
* última coleta.

---

# 📊 17. Coleta de Contadores

O sistema deverá suportar:

* contador geral;
* contador P&B;
* contador colorido;
* cópia;
* impressão;
* scanner;
* A3;
* A4;
* demais contadores disponibilizados pelo equipamento.

Não assumir que todos os fabricantes possuem os mesmos contadores.

Criar estrutura flexível.

---

# 📚 18. Histórico de Contadores

Cada leitura deverá armazenar:

```text
impressora_id
data_hora
contador
tipo
valor
fonte
agente
```

Exemplo:

```text
17/09/2026
Geral: 125.000
P&B: 100.000
Color: 25.000
```

---

# 📈 19. Cálculo de Produção

Produção:

```text
contador atual - contador anterior
```

Exemplo:

```text
Atual: 150.000
Anterior: 140.000

Produção = 10.000 páginas
```

O sistema deverá impedir automaticamente:

```text
contador atual < contador anterior
```

sem registrar uma ocorrência de inconsistência.

---

# ⚠️ 20. Tratamento de Contador Anormal

Detectar:

* contador menor;
* salto anormal;
* contador zerado;
* equipamento substituído;
* número de série alterado;
* duplicidade;
* leitura muito antiga.

Criar status:

```text
NORMAL
ATENÇÃO
INCONSISTENTE
AGUARDANDO_VALIDACAO
```

---

# 🖨️ 21. Suprimentos

Controlar:

* toner preto;
* toner ciano;
* toner magenta;
* toner amarelo;
* cilindro;
* fusor;
* revelador;
* unidade de imagem;
* kit manutenção;
* recipiente de resíduos;
* peças.

---

# 📦 22. Estoque

Cada item deverá possuir:

* código;
* SKU;
* descrição;
* fabricante;
* modelo;
* categoria;
* unidade;
* quantidade;
* estoque mínimo;
* estoque máximo;
* localização;
* custo médio;
* fornecedor;
* lote;
* número de série quando necessário.

---

# 🔄 23. Movimentações de Estoque

Tipos:

```text
ENTRADA
SAÍDA
TRANSFERÊNCIA
DEVOLUÇÃO
AJUSTE
CONSUMO
REPOSIÇÃO
DESCARTE
```

Toda movimentação deverá possuir histórico.

---

# 🔋 24. Monitoramento de Toner

Armazenar:

```text
nível atual
nível anterior
percentual
modelo
cor
data
impressora
```

Status:

```text
NORMAL
BAIXO
CRÍTICO
VAZIO
```

---

# 🔁 25. Trocas de Suprimentos

Registrar:

* impressora;
* suprimento;
* número de série;
* data;
* técnico;
* contador;
* nível anterior;
* motivo;
* peça retirada;
* peça instalada;
* observações.

---

# 🚨 26. Alertas

Criar sistema central de alertas.

Tipos:

```text
IMPRESSORA_OFFLINE
SEM_COMUNICACAO
TONER_BAIXO
TONER_CRITICO
TONER_VAZIO
ERRO_IMPRESSORA
ATOLAMENTO
FALHA_FUSOR
FALHA_CILINDRO
CONTADOR_INCONSISTENTE
AGENTE_OFFLINE
MANUTENCAO_PREVENTIVA
CONTRATO_VENCENDO
SLA_ESTOURADO
ESTOQUE_BAIXO
```

---

# 🔔 27. Notificações

Meios:

* painel;
* e-mail;
* webhook;
* notificação interna.

Cada alerta deverá possuir:

```text
aberto
reconhecido
em análise
resolvido
ignorado
```

---

# 📝 28. Chamados

Criar módulo completo de Help Desk.

## Abertura

Chamado poderá ser aberto por:

```text
CLIENTE
SUPORTE
TÉCNICO
SISTEMA
MONITORAMENTO
```

---

# 🎫 29. Dados do Chamado

Campos:

* número;
* cliente;
* filial;
* departamento;
* equipamento;
* solicitante;
* categoria;
* subcategoria;
* prioridade;
* descrição;
* anexos;
* técnico;
* SLA;
* status;
* data abertura;
* data atendimento;
* data conclusão.

---

# 🟢 30. Status de Chamado

```text
ABERTO
TRIAGEM
EM_ATENDIMENTO
AGENDADO
AGUARDANDO_CLIENTE
AGUARDANDO_PECA
AGUARDANDO_TECNICO
RESOLVIDO
CANCELADO
FECHADO
```

---

# 🔥 31. Prioridades

```text
BAIXA
NORMAL
ALTA
CRÍTICA
```

---

# ⏱️ 32. SLA

Cada cliente poderá possuir regras de SLA.

Configurar:

* tempo de resposta;
* tempo de atendimento;
* tempo de solução;
* horário comercial;
* feriados;
* dias úteis;
* prioridade.

O sistema deverá calcular automaticamente:

```text
Tempo decorrido
Tempo restante
Percentual consumido
SLA vencido
SLA próximo do vencimento
```

---

# 🔧 33. Ordem de Serviço

Um chamado poderá gerar uma OS.

Fluxo:

```text
CHAMADO
   ↓
ANÁLISE
   ↓
OS
   ↓
ROTA
   ↓
TÉCNICO
   ↓
ATENDIMENTO
   ↓
EXECUÇÃO
   ↓
ASSINATURA
   ↓
ENCERRAMENTO
```

---

# 🧰 34. Dados da OS

* número;
* chamado;
* cliente;
* filial;
* equipamento;
* técnico;
* prioridade;
* endereço;
* data;
* horário;
* serviço;
* diagnóstico;
* solução;
* peças;
* toner;
* deslocamento;
* observações;
* fotos;
* assinatura;
* geolocalização opcional;
* início;
* término.

---

# 📸 35. Evidências

Permitir anexar:

* fotos;
* documentos;
* comprovantes;
* assinatura;
* arquivos PDF.

---

# ✍️ 36. Assinatura Digital

O atendimento poderá ser finalizado mediante:

```text
Nome do responsável
Documento opcional
Assinatura
Data
Hora
```

Gerar comprovante em PDF.

---

# 🚚 37. Técnicos

Cadastro:

* nome;
* CPF;
* telefone;
* e-mail;
* matrícula;
* especialidade;
* cidades atendidas;
* disponibilidade;
* status.

Status:

```text
DISPONÍVEL
EM_ROTA
EM_ATENDIMENTO
PAUSA
INATIVO
```

---

# 🗺️ 38. Rotas

Criar planejamento diário.

Visualização:

```text
TÉCNICO
  ↓
VISITA 1
  ↓
VISITA 2
  ↓
VISITA 3
  ↓
VISITA 4
```

Cada visita deverá possuir:

* OS;
* cliente;
* endereço;
* cidade;
* horário;
* prioridade;
* duração estimada;
* status.

---

# 📍 39. Mapa

Exibir:

* clientes;
* impressoras;
* chamados;
* OS;
* técnicos;
* visitas.

Permitir visualização da rota diária.

---

# 📑 40. Contratos

Cadastrar:

* número;
* cliente;
* tipo;
* início;
* término;
* renovação;
* franquia;
* valor mensal;
* valor por página;
* valor excedente;
* P&B;
* colorido;
* A3;
* A4;
* custo mínimo;
* reajuste;
* SLA;
* observações.

---

# 💰 41. Tipos de Contrato

Suportar:

```text
LOCAÇÃO
BILHETAGEM
FRANQUIA
PÁGINA EXCEDENTE
MENSALIDADE
HÍBRIDO
```

---

# 🧮 42. Regras de Faturamento

Exemplo:

```text
Franquia: 10.000 páginas

Produção: 13.500

Excedente:
13.500 - 10.000 = 3.500
```

Valor:

```text
Franquia
+
Excedente P&B
+
Excedente Color
+
Acréscimos
-
Descontos
=
TOTAL
```

---

# 📅 43. Fechamento Mensal

Fluxo:

```text
ABERTURA
   ↓
COLETA DE CONTADORES
   ↓
VALIDAÇÃO
   ↓
CÁLCULO
   ↓
PENDÊNCIAS
   ↓
CONFERÊNCIA
   ↓
APROVAÇÃO
   ↓
CONGELAMENTO
   ↓
FATURAMENTO
```

---

# 🚫 44. Pendências de Fechamento

Detectar:

* impressora sem contador;
* contador desatualizado;
* equipamento sem contrato;
* equipamento sem custo;
* contador inconsistente;
* equipamento recém-instalado;
* equipamento retirado;
* produção anormal.

Não permitir congelamento enquanto existirem pendências bloqueantes.

---

# 💵 45. Financeiro

Criar:

* fechamento;
* faturamento;
* cobranças;
* acréscimos;
* descontos;
* reajustes;
* custos adicionais;
* histórico.

---

# 🧾 46. Fatura

Campos:

```text
Cliente
Contrato
Período
Produção
Franquia
Excedente
Valor mensal
Adicionais
Descontos
Total
Vencimento
Status
```

Status:

```text
ABERTA
EM_CONFERENCIA
APROVADA
FATURADA
ENVIADA
PAGA
CANCELADA
```

---

# 📊 47. Dashboard Principal

Exibir:

```text
CLIENTES
IMPRESSORAS
ONLINE
OFFLINE
CHAMADOS
OS ABERTAS
OS EM ATRASO
TONERS BAIXOS
AGENTES ONLINE
AGENTES OFFLINE
CONTRATOS
FATURAMENTO
PÁGINAS IMPRESSAS
```

---

# 📈 48. Gráficos

Criar:

* páginas por mês;
* páginas por dia;
* produção por cliente;
* produção por equipamento;
* produção P&B;
* produção colorida;
* consumo de toner;
* chamados por período;
* chamados por técnico;
* SLA;
* faturamento;
* estoque;
* contratos;
* equipamentos online/offline.

---

# 📋 49. Relatórios

Criar:

```text
Relatório de clientes
Relatório de impressoras
Relatório de contadores
Relatório de produção
Relatório de suprimentos
Relatório de estoque
Relatório de chamados
Relatório de OS
Relatório de SLA
Relatório de contratos
Relatório financeiro
Relatório de faturamento
Relatório de técnicos
Relatório de rotas
Relatório de alertas
Relatório de agentes
```

Permitir:

```text
PDF
Excel
CSV
```

---

# 🔌 50. API REST

Criar API versionada.

Base:

```text
/api/v1
```

## Clientes

```http
GET    /api/v1/clientes
POST   /api/v1/clientes
GET    /api/v1/clientes/:id
PUT    /api/v1/clientes/:id
DELETE /api/v1/clientes/:id
```

## Impressoras

```http
GET    /api/v1/impressoras
POST   /api/v1/impressoras
GET    /api/v1/impressoras/:id
PUT    /api/v1/impressoras/:id
```

## Contadores

```http
GET  /api/v1/contadores
POST /api/v1/contadores
```

## Agentes

```http
POST /api/v1/agentes/heartbeat
POST /api/v1/agentes/register
POST /api/v1/agentes/readings
POST /api/v1/agentes/alerts
```

## Chamados

```http
GET  /api/v1/chamados
POST /api/v1/chamados
PUT  /api/v1/chamados/:id
```

## OS

```http
GET  /api/v1/os
POST /api/v1/os
PUT  /api/v1/os/:id
```

---

# 🔑 51. Autenticação da API

Suportar:

```text
JWT
API KEY
WEBHOOK SECRET
SERVICE TOKEN
```

Cada integração deverá possuir:

* nome;
* token;
* permissões;
* último acesso;
* IP;
* status;
* data de criação;
* data de expiração.

---

# 🔗 52. Webhooks

Permitir eventos:

```text
printer.online
printer.offline
counter.received
toner.low
toner.critical
alert.created
ticket.created
ticket.updated
ticket.closed
os.created
os.completed
invoice.created
invoice.closed
```

---

# 🏦 53. Integração Oracle

Criar módulo para integração com banco Oracle.

Objetivo:

```text
ORACLE
   ↓
INTEGRAÇÃO
   ↓
VALIDAÇÃO
   ↓
TRANSFORMAÇÃO
   ↓
SUPABASE
   ↓
SISTEMA WEB
```

Permitir sincronização de:

* clientes;
* contratos;
* chamados;
* dados financeiros;
* equipamentos;
* técnicos;
* demais entidades configuradas.

Criar logs de sincronização.

---

# 🔄 54. Sincronização Oracle

Status:

```text
PENDENTE
PROCESSANDO
SINCRONIZADO
ERRO
IGNORADO
```

Guardar:

* origem;
* destino;
* data;
* quantidade;
* registros;
* erros;
* duração.

---

# 🧩 55. Integrações Externas

Arquitetura baseada em adaptadores.

Exemplo:

```text
IntegrationProvider
 ├── OracleProvider
 ├── ERPProvider
 ├── EmailProvider
 └── WebhookProvider
```

Evitar código de integração espalhado pelo sistema.

---

# 📱 56. Portal do Cliente

O cliente deverá acessar uma área própria.

Disponibilizar:

```text
Dashboard
Chamados
Abrir chamado
Equipamentos
Contadores
Suprimentos
Contratos
OS
Documentos
Usuários
```

O cliente nunca poderá visualizar outro cliente.

---

# 📲 57. Abertura de Chamado pelo Cliente

Fluxo:

```text
Selecionar equipamento
       ↓
Selecionar categoria
       ↓
Descrever problema
       ↓
Adicionar foto
       ↓
Enviar
       ↓
Número do chamado
       ↓
Acompanhamento
```

---

# 🛠️ 58. Preventivas

Cadastrar manutenção preventiva.

Campos:

* equipamento;
* periodicidade;
* última manutenção;
* próxima manutenção;
* checklist;
* técnico;
* observações.

Gerar alerta automático.

---

# ✅ 59. Checklists

Criar checklists configuráveis.

Exemplo:

```text
[ ] Limpeza
[ ] Verificação de roletes
[ ] Verificação de cilindro
[ ] Verificação de fusor
[ ] Verificação de toner
[ ] Teste de impressão
[ ] Teste de scanner
[ ] Teste de rede
```

---

# 🧾 60. Patrimônio

Permitir rastreamento de equipamentos.

Histórico:

```text
ESTOQUE
 ↓
CLIENTE
 ↓
FILIAL
 ↓
DEPARTAMENTO
 ↓
MANUTENÇÃO
 ↓
TRANSFERÊNCIA
 ↓
ESTOQUE
```

---

# 🔄 61. Movimentação de Impressora

Registrar:

* equipamento;
* origem;
* destino;
* motivo;
* usuário;
* data;
* contador;
* observação.

---

# 📝 62. Auditoria

Registrar todas as alterações críticas.

Exemplo:

```text
Usuário: Gabriel
Ação: ALTEROU_CONTRATO
Campo: valor_pagina
Antes: 0.08
Depois: 0.10
Data: 17/09/2026
IP: xxx.xxx.xxx.xxx
```

Ações:

```text
CREATE
UPDATE
DELETE
LOGIN
LOGOUT
EXPORT
APPROVE
CANCEL
CLOSE
SYNC
```

---

# 🗄️ 63. Banco de Dados

Criar tabelas principais:

```text
companies
users
roles
permissions
user_roles

clients
client_branches
client_departments
client_contacts

printers
printer_models
printer_manufacturers
printer_locations

contracts
contract_items
contract_pricing
contract_adjustments

meters
meter_readings
meter_validations

supplies
supply_models
supply_readings
supply_replacements

inventory
inventory_movements
inventory_locations

alerts
alert_rules
alert_events

tickets
ticket_comments
ticket_attachments
ticket_status_history
ticket_sla

service_orders
service_order_items
service_order_photos
service_order_signatures

technicians
technician_routes
route_stops

preventive_maintenance
preventive_checklists

invoices
invoice_items
billing_closings
billing_adjustments

agents
agent_devices
agent_heartbeats
agent_logs

integrations
integration_logs
webhooks

audit_logs
notifications
system_settings
```

---

# 🔗 64. Relacionamentos

```text
COMPANY
 ├── USERS
 ├── CLIENTS
 │    ├── BRANCHES
 │    │    ├── DEPARTMENTS
 │    │    └── PRINTERS
 │    ├── CONTRACTS
 │    ├── TICKETS
 │    └── SERVICE ORDERS
 │
 ├── TECHNICIANS
 ├── INVENTORY
 ├── AGENTS
 └── BILLING
```

---

# 🔒 65. Row Level Security

Todas as tabelas que contenham dados de empresa deverão possuir isolamento.

Regra:

```text
current_user.company_id
=
record.company_id
```

Cliente:

```text
current_user.client_id
=
record.client_id
```

---

# 🧵 66. Processamento Assíncrono

Criar filas para:

```text
coleta
processamento de contador
processamento de alerta
envio de e-mail
webhooks
sincronização Oracle
relatórios
fechamento
faturamento
```

Nunca executar tarefas pesadas diretamente na requisição HTTP quando puderem ser assíncronas.

---

# ⏰ 67. Jobs

Criar tarefas automáticas:

```text
A cada minuto:
verificar agentes

A cada 5 minutos:
processar alertas

A cada período:
processar leituras

Diariamente:
verificar preventivas

Diariamente:
verificar contratos vencendo

Mensalmente:
preparar fechamento

Periodicamente:
sincronizar integrações
```

---

# 🧠 68. Regras Inteligentes

O sistema poderá detectar:

```text
produção anormal
queda brusca de produção
aumento brusco de produção
toner consumido muito rapidamente
toner trocado prematuramente
impressora sem comunicação
equipamento sem contador
estoque abaixo do mínimo
SLA próximo do vencimento
contrato próximo do vencimento
```

Essas regras deverão ser configuráveis.

---

# 📊 69. Indicadores por Cliente

Exibir:

```text
Quantidade de impressoras
Produção mensal
Produção média
Chamados
OS
SLA
Toners
Consumo
Valor faturado
Contratos ativos
Equipamentos offline
```

---

# 🖨️ 70. Indicadores por Impressora

Exibir:

```text
Status
Última comunicação
Último contador
Produção diária
Produção mensal
P&B
Color
Nível toner
Alertas
Chamados
OS
Histórico
Contrato
Localização
```

---

# 📈 71. Histórico de Impressões

Gráfico:

```text
Hoje
7 dias
30 dias
3 meses
6 meses
12 meses
Personalizado
```

Filtros:

```text
Cliente
Filial
Departamento
Contrato
Fabricante
Modelo
Equipamento
Cor
Tipo
```

---

# 🧮 72. Cálculo de Custos

Permitir:

```text
custo por página
custo de toner
custo de peça
custo de manutenção
custo de deslocamento
custo técnico
```

Criar indicadores:

```text
receita
custo
margem
rentabilidade
```

---

# 📦 73. Reposição de Toner

O sistema deverá prever:

```text
estoque atual
consumo médio
produção média
nível atual
previsão de troca
estoque mínimo
estoque disponível
```

Gerar sugestão de reposição.

---

# 🛒 74. Compras

Criar módulo de compras.

Fluxo:

```text
ESTOQUE BAIXO
 ↓
SUGESTÃO
 ↓
REQUISIÇÃO
 ↓
APROVAÇÃO
 ↓
PEDIDO
 ↓
RECEBIMENTO
 ↓
ESTOQUE
```

---

# 🏷️ 75. Fornecedores

Cadastro:

* razão social;
* CNPJ;
* contato;
* telefone;
* e-mail;
* endereço;
* produtos;
* prazo médio;
* observações.

---

# 📑 76. Documentos

Permitir anexar documentos a:

```text
Cliente
Contrato
Impressora
Chamado
OS
Fatura
Fornecedor
Produto
```

---

# 📧 77. E-mails

Enviar automaticamente:

```text
Novo chamado
Atualização de chamado
SLA próximo do vencimento
SLA vencido
Impressora offline
Toner crítico
Fechamento disponível
Fatura
OS finalizada
Contrato próximo do vencimento
```

---

# 📱 78. Responsividade

O sistema deverá funcionar em:

```text
Desktop
Notebook
Tablet
Celular
```

Priorizar:

```text
Chrome
Edge
Firefox
Safari
```

---

# 🎨 79. Interface

Visual:

```text
Profissional
Corporativo
Moderno
Limpo
Rápido
Responsivo
```

Layout principal:

```text
┌──────────────────────────────────────────────┐
│ LOGO        BUSCA      NOTIFICAÇÕES   PERFIL │
├─────────────┬────────────────────────────────┤
│             │                                │
│ Dashboard   │                                │
│ Clientes    │         CONTEÚDO              │
│ Impressoras │                                │
│ Monitor.    │                                │
│ Chamados    │                                │
│ OS          │                                │
│ Contratos   │                                │
│ Financeiro  │                                │
│ Suprimentos │                                │
│ Estoque     │                                │
│ Rotas       │                                │
│ Relatórios  │                                │
│ Config.     │                                │
│             │                                │
└─────────────┴────────────────────────────────┘
```

---

# ⚡ 80. Desempenho

O sistema deverá:

* utilizar paginação;
* utilizar índices;
* evitar N+1 queries;
* cachear informações adequadas;
* processar relatórios pesados em background;
* utilizar consultas otimizadas;
* evitar chamadas desnecessárias ao banco;
* carregar dashboards de forma eficiente.

---

# 🛡️ 81. Logs

Criar logs para:

```text
API
AUTH
AGENTE
SNMP
BANCO
ORACLE
WEBHOOK
EMAIL
FATURAMENTO
CHAMADOS
OS
INTEGRAÇÕES
```

Cada log deverá possuir:

```text
timestamp
tipo
nível
mensagem
contexto
usuário
empresa
origem
```

---

# 🧪 82. Testes

Criar testes:

## Unitários

* cálculo de contador;
* cálculo de produção;
* cálculo de franquia;
* cálculo de excedente;
* SLA;
* estoque;
* permissões.

## Integração

* API;
* banco;
* agente;
* Oracle;
* webhooks;
* e-mail.

## E2E

Testar:

```text
LOGIN
↓
CLIENTE
↓
IMPRESSORA
↓
CONTADOR
↓
CONTRATO
↓
FATURAMENTO
```

e:

```text
CLIENTE
↓
CHAMADO
↓
OS
↓
ROTA
↓
TÉCNICO
↓
ENCERRAMENTO
```

---

# 🚀 83. Deploy

## Produção

```text
GitHub
   ↓
CI/CD
   ↓
Vercel
   ↓
Frontend/API
   ↓
Supabase
```

Agente:

```text
Windows
   ↓
PrintControl Agent
   ↓
API
```

---

# 🔄 84. CI/CD

Pipeline:

```text
PUSH
 ↓
INSTALL
 ↓
LINT
 ↓
TYPE CHECK
 ↓
TEST
 ↓
BUILD
 ↓
DEPLOY
```

Falhou:

```text
NÃO PUBLICAR
```

---

# 🌎 85. Ambientes

Criar:

```text
development
staging
production
```

Cada ambiente deverá possuir suas próprias variáveis.

---

# 🔑 86. Variáveis de Ambiente

Exemplo:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=

JWT_SECRET=

ORACLE_HOST=
ORACLE_PORT=
ORACLE_SERVICE=
ORACLE_USER=
ORACLE_PASSWORD=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

ENCRYPTION_KEY=
```

---

# 📁 87. Estrutura do Projeto

Estrutura recomendada:

```text
/
├── app/
│   ├── dashboard/
│   ├── clientes/
│   ├── impressoras/
│   ├── monitoramento/
│   ├── contadores/
│   ├── suprimentos/
│   ├── estoque/
│   ├── chamados/
│   ├── ordens-servico/
│   ├── tecnicos/
│   ├── rotas/
│   ├── contratos/
│   ├── faturamento/
│   ├── relatorios/
│   └── configuracoes/
│
├── components/
│
├── lib/
│   ├── auth/
│   ├── database/
│   ├── monitoring/
│   ├── billing/
│   ├── tickets/
│   ├── inventory/
│   ├── integrations/
│   └── notifications/
│
├── api/
│
├── workers/
│
├── database/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── agent/
│   ├── windows/
│   ├── snmp/
│   ├── discovery/
│   └── updater/
│
├── tests/
│
├── docs/
│
├── scripts/
│
├── .env.example
├── package.json
└── README.md
```

---

# 🧱 88. Princípios de Desenvolvimento

O projeto deverá seguir:

```text
Clean Code
SOLID
DRY
KISS
Type Safety
Modularidade
Segurança
Testabilidade
Observabilidade
```

Evitar:

```text
código duplicado
senhas hardcoded
SQL inseguro
componentes gigantes
regras espalhadas pelo frontend
regras de negócio dentro de componentes
dependências desnecessárias
```

---

# ⚙️ 89. Regras de Negócio

Regras importantes:

### Impressora

Uma impressora poderá possuir somente um vínculo ativo com cliente/filial/departamento por vez.

### Contador

Nunca apagar leituras históricas.

### Contrato

Não excluir contratos com faturamento associado.

### Faturamento

Após congelamento, alterações deverão gerar auditoria.

### Estoque

Toda alteração de quantidade deverá gerar movimentação.

### Chamado

Toda alteração importante deverá gerar histórico.

### OS

Uma OS encerrada não poderá ser alterada sem permissão específica.

### Auditoria

Dados financeiros e operacionais críticos nunca deverão ser apagados fisicamente sem processo controlado.

---

# 🧠 90. Inteligência Operacional

Criar mecanismos para identificar:

### Equipamentos com baixa produtividade

```text
produção < média histórica
```

### Produção anormal

```text
produção > limite configurado
```

### Consumo anormal de toner

```text
troca em intervalo inferior ao esperado
```

### Equipamento parado

```text
sem comunicação
+
sem contador
```

### Risco financeiro

```text
produção baixa
+
custo alto
```

Esses indicadores deverão ser apresentados como análises, sem alterar automaticamente o faturamento.

---

# 📊 91. Dashboard Executivo

Criar uma visão específica para gestão:

```text
Faturamento
Produção
Margem
Clientes
Impressoras
Chamados
SLA
Estoque
Técnicos
Contratos
```

Períodos:

```text
Hoje
Ontem
Semana
Mês
Ano
Personalizado
```

---

# 👨‍💼 92. Dashboard Operacional

Mostrar:

```text
Chamados novos
Chamados críticos
OS de hoje
Técnicos disponíveis
Técnicos em rota
Impressoras offline
Toners críticos
Agentes offline
Preventivas pendentes
```

---

# 💼 93. Dashboard Financeiro

Mostrar:

```text
Fechamentos
Faturamento atual
Faturamento anterior
Produção
Excedentes
Descontos
Acréscimos
Contratos
Pendências
```

---

# 📦 94. Dashboard Suprimentos

Mostrar:

```text
Estoque
Estoque crítico
Toners baixos
Toners em trânsito
Consumo
Trocas
Previsão
Compras
```

---

# 🛠️ 95. Dashboard Técnico

Mostrar:

```text
OS de hoje
Chamados
Rotas
Clientes
Equipamentos
Tempo médio
Pendências
```

---

# 📱 96. Aplicação do Técnico

A interface do técnico deverá permitir:

```text
Minha agenda
Minha rota
Minhas OS
Detalhes do cliente
Detalhes da impressora
Checklist
Peças
Toner
Fotos
Observações
Assinatura
Encerrar OS
```

---

# 🔄 97. Status em Tempo Real

Quando possível utilizar:

```text
Supabase Realtime
WebSocket
Server-Sent Events
```

para:

* novos chamados;
* mudança de status;
* alertas;
* OS;
* agentes;
* notificações.

---

# 🔍 98. Busca Global

Criar busca:

```text
Cliente
CNPJ
Impressora
Patrimônio
Número de série
IP
Chamado
OS
Contrato
Técnico
Produto
```

Atalho:

```text
Ctrl + K
```

---

# 📥 99. Importação

Permitir importar:

```text
CSV
Excel
```

Para:

* clientes;
* impressoras;
* contratos;
* contadores;
* estoque.

Antes da importação:

```text
VALIDAR
→ MOSTRAR ERROS
→ CONFIRMAR
→ IMPORTAR
```

---

# 📤 100. Exportação

Todas as tabelas importantes deverão possuir:

```text
Exportar Excel
Exportar CSV
Exportar PDF
```

---

# 🧾 101. Relatório de Fechamento

Gerar documento com:

```text
Empresa
Cliente
Contrato
Período

Equipamento
Patrimônio
Número de série

Contador anterior
Contador atual
Produção

Franquia
Excedente
Valor unitário
Total

Acréscimos
Descontos
TOTAL FINAL
```

---

# 🧊 102. Congelamento

Após o fechamento ser congelado:

```text
contadores
regras
produção
valores
acréscimos
descontos
```

deverão ser preservados para auditoria.

Qualquer correção posterior deverá gerar:

```text
ajuste
motivo
usuário
data
valor anterior
valor novo
```

---

# 🧑‍💻 103. Configurações

Criar:

```text
Empresa
Usuários
Perfis
Permissões
Clientes
SLA
Categorias
Prioridades
Status
Contratos
Faturamento
Estoque
Alertas
E-mail
Integrações
API
Agentes
```

---

# 🔔 104. Central de Notificações

Criar painel:

```text
Todas
Não lidas
Críticas
Chamados
Monitoramento
Financeiro
Estoque
Sistema
```

---

# 🧰 105. Diagnóstico do Agente

O administrador deverá conseguir visualizar:

```text
Agente
Versão
Último heartbeat
Última coleta
IP
Hostname
Quantidade de impressoras
Erros
Logs
Status dos serviços
```

---

# 🖥️ 106. Serviços do Agente

Separar responsabilidades:

```text
PrintControl Agent
PrintControl Monitor
PrintControl Updater
PrintControl Guardian
```

### Monitor

Coleta dados.

### Agent

Coordena o funcionamento.

### Updater

Atualiza a aplicação.

### Guardian

Verifica se os serviços estão funcionando.

---

# 🔐 107. Comunicação Agente → Servidor

Obrigatório:

```text
HTTPS
TLS
Token por agente
Assinatura de requisição
Timestamp
Proteção contra replay
```

Nunca enviar credenciais SNMP em texto puro para a API.

---

# 🧪 108. Simulador de Impressora

Criar ferramenta para desenvolvimento:

```text
Fake Printer
```

Simular:

```text
contador
toner
alerta
offline
online
erro
```

Isso permitirá testar o sistema sem impressoras reais.

---

# 📡 109. Simulador SNMP

Criar ambiente para testar:

```text
SNMP v1
SNMP v2c
SNMP v3
```

Quando suportado pelo equipamento.

---

# 🏁 110. MVP

A primeira versão deverá priorizar:

```text
1. Login
2. Usuários
3. Clientes
4. Filiais
5. Impressoras
6. Agentes
7. Contadores
8. Monitoramento
9. Alertas
10. Chamados
11. OS
12. Contratos
13. Fechamento
14. Dashboard
```

Depois:

```text
15. Estoque
16. Suprimentos
17. Rotas
18. Preventivas
19. Compras
20. Portal do cliente
21. Integração Oracle
22. API avançada
23. Inteligência operacional
```

---

# 🚀 111. Ordem de Implementação

## Fase 1

```text
Banco
Autenticação
RBAC
Multiempresa
Clientes
Filiais
Usuários
```

## Fase 2

```text
Impressoras
Fabricantes
Modelos
Contadores
Histórico
```

## Fase 3

```text
Agente
SNMP
Heartbeat
Monitoramento
```

## Fase 4

```text
Alertas
Suprimentos
Estoque
```

## Fase 5

```text
Contratos
Custos
Fechamento
Faturamento
```

## Fase 6

```text
Chamados
SLA
OS
Técnicos
Rotas
```

## Fase 7

```text
Dashboards
Relatórios
Portal do cliente
```

## Fase 8

```text
Oracle
ERP
Webhooks
API
Integrações
```

---

# ✅ 112. Definition of Done

Uma funcionalidade somente poderá ser considerada concluída quando possuir:

```text
[ ] Banco
[ ] Migration
[ ] API
[ ] Validação
[ ] Permissões
[ ] Interface
[ ] Loading
[ ] Empty State
[ ] Tratamento de erro
[ ] Logs
[ ] Auditoria
[ ] Testes
[ ] Responsividade
[ ] Documentação
```

---

# 🚨 113. Tratamento de Erros

Toda API deverá retornar padrão:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": []
  }
}
```

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

---

# 📚 114. Documentação API

Gerar:

```text
OpenAPI
Swagger
```

Documentar:

* autenticação;
* endpoints;
* parâmetros;
* respostas;
* erros;
* webhooks;
* limites;
* exemplos.

---

# 🌐 115. Internacionalização

Preparar arquitetura para:

```text
Português Brasil
Inglês
Espanhol
```

Idioma inicial:

```text
pt-BR
```

Moeda:

```text
BRL
```

Timezone padrão:

```text
America/Sao_Paulo
```

---

# 💾 116. Backup

O banco deverá possuir estratégia de backup.

Também implementar exportação controlada de:

```text
Clientes
Impressoras
Contadores
Contratos
Chamados
OS
Financeiro
Estoque
```

---

# 🛡️ 117. LGPD

Implementar:

* controle de acesso;
* minimização de dados;
* auditoria;
* proteção de credenciais;
* criptografia de dados sensíveis;
* logs de acesso;
* política de retenção;
* exclusão controlada;
* exportação de dados quando aplicável.

---

# 📌 118. Regras Para IA de Desenvolvimento

A IA responsável pelo desenvolvimento deverá:

1. analisar este README antes de criar código;
2. respeitar a arquitetura;
3. não criar funcionalidades desconectadas;
4. não duplicar tabelas;
5. não duplicar regras;
6. não alterar banco sem migration;
7. não remover funcionalidades existentes sem justificativa;
8. não usar credenciais reais no código;
9. não criar dados falsos em produção;
10. criar tratamento de erros;
11. criar testes;
12. manter TypeScript tipado;
13. manter componentes reutilizáveis;
14. manter segurança;
15. manter compatibilidade com as APIs existentes.

---

# 🚫 119. Proibições

Não fazer:

```text
senha hardcoded
token hardcoded
service_role no frontend
SQL sem validação
credencial SNMP exposta
dados de cliente misturados
API sem autenticação
delete destrutivo de histórico financeiro
alteração silenciosa de contador
alteração silenciosa de faturamento
```

---

# 🧭 120. Regra Central do Sistema

Toda operação deverá manter rastreabilidade:

```text
QUEM
FEZ
O QUÊ
QUANDO
ONDE
ANTES
DEPOIS
POR QUÊ
```

---

# 🏆 121. Resultado Esperado

Ao final, o sistema deverá permitir que uma empresa de outsourcing execute praticamente toda sua operação em uma única plataforma:

```text
                 PRINTCONTROL ERP
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   MONITORAMENTO     CLIENTES        FINANCEIRO
        │               │                │
        ▼               ▼                ▼
   IMPRESSORAS       CHAMADOS        CONTRATOS
        │               │                │
        ▼               ▼                ▼
   CONTADORES           OS          FATURAMENTO
        │               │
        ▼               ▼
   SUPRIMENTOS        TÉCNICOS
        │               │
        ▼               ▼
      ESTOQUE          ROTAS
        │               │
        └───────┬───────┘
                ▼
             DASHBOARD
                │
                ▼
              API
                │
       ┌────────┼─────────┐
       ▼        ▼         ▼
    ORACLE     ERP      CLIENTE
```

---

# 📍 122. Critério Final

O projeto será considerado pronto para produção quando:

```text
✓ Usuário consegue entrar
✓ Empresa consegue cadastrar clientes
✓ Cliente consegue possuir filiais
✓ Filiais conseguem possuir impressoras
✓ Impressoras conseguem ser monitoradas
✓ Agente consegue enviar leituras
✓ Contadores são armazenados
✓ Produção é calculada
✓ Alertas são gerados
✓ Toners são controlados
✓ Estoque é controlado
✓ Chamados são abertos
✓ SLA é calculado
✓ OS é criada
✓ Técnico recebe OS
✓ Rota é criada
✓ Atendimento é encerrado
✓ Contrato é calculado
✓ Fechamento é gerado
✓ Faturamento é conferido
✓ Relatórios são gerados
✓ Dados são auditados
✓ API funciona
✓ Integrações funcionam
✓ Segurança está aplicada
✓ Testes estão passando
✓ Deploy está funcionando
```

---

# 📜 Licença

Projeto proprietário.

Todos os direitos reservados à empresa responsável pelo desenvolvimento e operação da plataforma.

---

# 🧠 Diretriz final

> **Este README é a especificação principal do produto.**
>
> Qualquer código criado para o projeto deverá respeitar as regras, arquitetura, módulos, relacionamentos, segurança e fluxos definidos neste documento.
>
> O sistema deverá ser desenvolvido como uma plataforma integrada de gestão de outsourcing de impressão, e não como um conjunto de telas independentes.
