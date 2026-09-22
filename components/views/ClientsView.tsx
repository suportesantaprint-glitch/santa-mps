'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import { Client } from '@/lib/types';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Printer,
  FileText,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export default function ClientsView() {
  const { clients, printers, contracts, addClient, updateClient, searchQuery } = useSantaStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    corporateName: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    email: '',
    phone: '',
    address: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
    branches: [{ id: 'br-1', name: 'Matriz', address: '', city: 'São Paulo', state: 'SP' }],
    departments: [
      { id: 'dep-1', name: 'Administrativo' },
      { id: 'dep-2', name: 'Faturamento' },
      { id: 'dep-3', name: 'Operação' },
    ],
  });

  const filteredClients = clients.filter((c) => {
    const term = (search.trim() || searchQuery.trim()).toLowerCase();
    if (!term) return true;
    return (
      c.tradeName.toLowerCase().includes(term) ||
      c.corporateName.toLowerCase().includes(term) ||
      c.cnpj.includes(term) ||
      c.city.toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tradeName || !formData.cnpj) return;

    addClient({
      corporateName: formData.corporateName || formData.tradeName,
      tradeName: formData.tradeName,
      cnpj: formData.cnpj,
      stateRegistration: formData.stateRegistration,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      contactPerson: formData.tradeName || 'Responsável Operacional',
      status: 'ATIVO',
      branches: formData.branches.map((b) => ({
        id: b.id,
        clientId: 'temp',
        name: b.name,
        cnpj: formData.cnpj,
        address: b.address,
        city: b.city,
        state: b.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
        contactPerson: formData.tradeName,
        latitude: -23.5505,
        longitude: -46.6333,
      })),
      departments: formData.departments.map((d) => ({
        id: d.id,
        clientId: 'temp',
        name: d.name,
      })),
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clientes & Filiais</h1>
          <p className="text-xs text-slate-500">
            Base de clientes corporativos, unidades operacionais, departamentos e centros de custo.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Cadastrar Cliente
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razão social, nome fantasia, CNPJ ou cidade..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => {
          const clientPrinters = printers.filter((p) => p.clientId === client.id);
          const clientContracts = contracts.filter((c) => c.clientId === client.id);

          return (
            <div
              key={client.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">{client.tradeName}</h2>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{client.corporateName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      client.status === 'ATIVO'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">{client.cnpj}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">
                      {client.city} - {client.state} ({client.address})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{client.email}</span>
                  </div>
                </div>

                {/* Branches & Department pills */}
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                    {client.branches.length} {client.branches.length === 1 ? 'Unidade' : 'Unidades'}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                    {client.departments.length} Departamentos
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Printer className="h-3.5 w-3.5 text-blue-600" />
                    {clientPrinters.length} eqp.
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    {clientContracts.length} contr.
                  </span>
                </div>
                <button
                  onClick={() => setSelectedClient(client)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Ver Unidades
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Detail / Units Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedClient.tradeName}</h2>
                <p className="text-xs text-slate-500">{selectedClient.corporateName} • CNPJ: {selectedClient.cnpj}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-700 mb-1.5 uppercase">Filiais / Unidades Físicas</h3>
                <div className="space-y-2">
                  {selectedClient.branches.map((b) => (
                    <div key={b.id} className="rounded-lg border border-slate-200 p-2.5 bg-slate-50">
                      <div className="font-semibold text-slate-800">{b.name}</div>
                      <div className="text-slate-500">{b.address} - {b.city}/{b.state}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-1.5 uppercase">Departamentos & Centros de Custo</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.departments.map((d) => (
                    <span key={d.id} className="rounded-lg bg-blue-50 px-2.5 py-1 font-medium text-blue-800 border border-blue-100">
                      {d.name} {d.costCenter && `(${d.costCenter})`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-base font-bold text-slate-900">Novo Cliente Corporativo</h2>
            <p className="text-xs text-slate-500">Cadastre a empresa tomadora do serviço de outsourcing.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-medium text-slate-700">Nome Fantasia</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Hospital São Lucas"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Razão Social</label>
                <input
                  type="text"
                  value={formData.corporateName}
                  onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">CNPJ</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">E-mail Principal</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div className="col-span-2">
                <label className="font-medium text-slate-700">Endereço Matriz</label>
                <input
                  type="text"
                  placeholder="Av. Paulista, 1000 - Bela Vista"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Estado (UF)</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Salvar Cliente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
