import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SERVICE_ORDERS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const technicianId = searchParams.get('technicianId');

  let results = [...INITIAL_SERVICE_ORDERS];
  if (status) results = results.filter((o) => o.status === status);
  if (technicianId) results = results.filter((o) => o.technicianId === technicianId);

  return NextResponse.json({ success: true, total: results.length, data: results });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOS = {
      id: `os-${Date.now()}`,
      code: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ABERTA',
      partsReplaced: [],
      checklist: [],
      scheduledDate: new Date().toISOString().split('T')[0],
      ...body,
    };
    return NextResponse.json({ success: true, data: newOS }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao criar Ordem de Serviço.' }, { status: 400 });
  }
}
