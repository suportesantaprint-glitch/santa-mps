import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRINTERS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');

  let results = [...INITIAL_PRINTERS];
  if (status) {
    results = results.filter((p) => p.status === status);
  }
  if (clientId) {
    results = results.filter((p) => p.clientId === clientId);
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    data: results,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.model || !body.serialNumber) {
      return NextResponse.json(
        { success: false, error: 'Modelo e Número de Série são obrigatórios.' },
        { status: 400 }
      );
    }
    const newPrinter = {
      id: `prt-${Date.now()}`,
      code: body.code || `PRT-${Date.now().toString().slice(-4)}`,
      status: 'ATIVA',
      installedAt: new Date().toISOString(),
      lastCommunication: new Date().toISOString(),
      isMonitored: true,
      supplies: [],
      lastCounters: {
        total: 0,
        mono: 0,
        color: 0,
        prints: 0,
        copies: 0,
        scans: 0,
        readAt: new Date().toISOString(),
      },
      ...body,
    };
    return NextResponse.json({ success: true, data: newPrinter }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Payload JSON inválido.' }, { status: 400 });
  }
}
