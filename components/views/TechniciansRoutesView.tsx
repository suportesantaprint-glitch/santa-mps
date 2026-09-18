'use client';

import React, { useState } from 'react';
import { useSantaStore } from '@/lib/store';
import {
  MapPin,
  Clock,
  Car,
  Phone,
  CheckCircle2,
  Navigation,
  User,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

export default function TechniciansRoutesView() {
  const { technicians, routes, serviceOrders } = useSantaStore();
  const [selectedTechId, setSelectedTechId] = useState<string>(technicians[0]?.id || '');

  const selectedTech = technicians.find((t) => t.id === selectedTechId) || technicians[0];
  const techRoutes = routes.filter((r) => r.technicianId === selectedTech?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Técnicos & Roteirização Inteligente</h1>
          <p className="text-xs text-slate-500">
            Alocação geográfica de técnicos de campo, ordem de atendimento e controle de deslocamentos.
          </p>
        </div>
      </div>

      {/* Technicians Roster Horizontal Selector */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technicians.map((tech) => {
          const isSelected = selectedTech?.id === tech.id;
          const assignedStops = routes.filter((r) => r.technicianId === tech.id);

          return (
            <div
              key={tech.id}
              onClick={() => setSelectedTechId(tech.id)}
              className={`cursor-pointer rounded-xl border p-4 shadow-xs transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs">
                    {tech.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-xs">{tech.name}</h2>
                    <p className="text-[11px] text-slate-500">{tech.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    tech.status === 'EM_ROTA' || tech.status === 'EM_ATENDIMENTO'
                      ? 'bg-blue-100 text-blue-700'
                      : tech.status === 'DISPONIVEL'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tech.status}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <Car className="h-3.5 w-3.5 text-slate-400" />
                  <span>{tech.vehiclePlate || 'Carro da Frota'}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-indigo-700">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{assignedStops.length} Paradas na Rota</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Route Stops & Map Layout */}
      {selectedTech && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stops Sequence */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Itinerário de Atendimento: {selectedTech.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Sequência otimizada por proximidade e prioridade de SLA
                </p>
              </div>
              <span className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                {techRoutes.length} Paradas Agendadas
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {techRoutes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhuma ordem de serviço pendente para este técnico hoje.
                </div>
              ) : (
                techRoutes.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
                        {stop.orderIndex}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{stop.clientName}</span>
                          <span className="font-mono text-[11px] text-blue-600">{stop.osCode}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              stop.priority === 'CRITICA'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {stop.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{stop.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Previsão: {stop.scheduledTime}</span>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          stop.status === 'CONCLUIDO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stop.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interactive Geographic Map Simulator */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold">Rastreamento de Rota GPS</h3>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                Sinal GPS Ativo
              </span>
            </div>

            {/* Stylized vector map canvas */}
            <div className="relative mt-4 flex h-64 flex-col justify-between rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-hidden">
              {/* Grid visual lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Região Metropolitana de São Paulo</span>
                <span>42 km estimados</span>
              </div>

              {/* Pins representation */}
              <div className="relative z-10 space-y-4 my-auto">
                {techRoutes.map((stop) => (
                  <div key={stop.id} className="flex items-center gap-2 text-xs">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 font-bold text-white text-[10px] shadow-sm">
                      {stop.orderIndex}
                    </div>
                    <div className="truncate font-medium text-slate-200">{stop.clientName}</div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                <span>Tempo Médio por Visita: ~45 min</span>
                <span className="text-emerald-400 font-semibold">Veículo em Deslocamento</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
