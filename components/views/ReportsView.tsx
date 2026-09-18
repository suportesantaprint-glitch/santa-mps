'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { formatBRL } from '@/lib/billing-engine';
import { formatDate } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Printer as PrintIcon,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function ReportsView() {
  const { printers, contracts, invoices, tickets, inventory } = useSantaStore();
  const [activeReport, setActiveReport] = useState<
    'PARQUE' | 'PRODUCAO' | 'FATURAMENTO' | 'SUPRIMENTOS' | 'SLA'
  >('PRODUCAO');

  const handleExportCSV = () => {
    let csvData = '';
    let filename = `relatorio_${activeReport.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === 'PARQUE') {
      csvData =
        'Código;Modelo;Série;IP;Status;Contador\n' +
        printers
          .map(
            (p) =>
              `${p.code};"${p.model}";${p.serialNumber};${p.ipAddress};${p.status};${p.lastCounters?.total || 0}`
          )
          .join('\n');
    } else if (activeReport === 'FATURAMENTO') {
      csvData =
        'Fatura;Cliente;Competência;Produção;Total\n' +
        invoices
          .map((i) => `${i.code};"${i.clientName}";${i.periodMonth};${i.monoProduction};${i.totalAmount}`)
          .join('\n');
    } else if (activeReport === 'SUPRIMENTOS') {
      csvData =
        'SKU;Descrição;Categoria;Saldo;Mínimo;Custo\n' +
        inventory
          .map((i) => `${i.sku};"${i.description}";${i.category};${i.currentQuantity};${i.minQuantity};${i.unitCost}`)
          .join('\n');
    } else {
      csvData =
        'Chamado;Cliente;Prioridade;Status;SLA Horas\n' +
        tickets.map((t) => `${t.code};"${t.clientName}";${t.priority};${t.status};${t.slaHours}`).join('\n');
    }

    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Relatórios Gerenciais</h1>
          <p className="text-xs text-slate-500">
            Exportação de dados consolidados para auditoria, controle financeiro e compliance contratual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <PrintIcon className="h-3.5 w-3.5" />
            Imprimir Relatório
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'PRODUCAO', label: 'Produção & Bilhetagem' },
          { id: 'PARQUE', label: 'Parque de Impressoras' },
          { id: 'FATURAMENTO', label: 'Faturamento & Fechamento' },
          { id: 'SUPRIMENTOS', label: 'Estoque & Consumo' },
          { id: 'SLA', label: 'SLA & Help Desk' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as any)}
            className={`rounded-lg px-3 py-2 font-medium transition ${
              activeReport === tab.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Body / Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {activeReport === 'PRODUCAO' && (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Série</th>
                <th className="px-4 py-3 text-right">Contador Total</th>
                <th className="px-4 py-3 text-right">P&B</th>
                <th className="px-4 py-3 text-right">Color</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {printers.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.model}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{p.serialNumber}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {p.lastCounters?.total.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">
                    {p.lastCounters?.mono.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">
                    {p.lastCounters?.color.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'FATURAMENTO' && (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Fatura</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{i.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{i.clientName}</td>
                  <td className="px-4 py-3 text-slate-600">{i.periodLabel}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(i.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {formatBRL(i.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-[10px] text-slate-700">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'PARQUE' && (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Patrimônio</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {printers.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.model}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{p.ipAddress}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{p.assetTag}</td>
                  <td className="px-4 py-3 text-slate-600">{p.location}</td>
                  <td className="px-4 py-3 text-center font-bold text-[10px] text-emerald-700">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'SUPRIMENTOS' && (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-center">Saldo Físico</th>
                <th className="px-4 py-3 text-right">Custo Unitário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{inv.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.description}</td>
                  <td className="px-4 py-3 font-semibold text-[10px] text-slate-700">{inv.category}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">{inv.currentQuantity} un</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatBRL(inv.unitCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'SLA' && (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Chamado</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Prioridade</th>
                <th className="px-4 py-3">SLA Estipulado</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{t.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.clientName}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{t.priority}</td>
                  <td className="px-4 py-3 text-slate-600">{t.slaHours} Horas</td>
                  <td className="px-4 py-3 font-bold text-[10px] text-blue-700">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
