import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, batch = [] } = body;

    const processed = batch.map((item: { printer_ip: string; serial: string; counter_total: number }, index: number) => ({
      index,
      serial: item.serial,
      received: true,
      status: 'PROCESSED',
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      agent_id: agent_id || 'UNKNOWN',
      total_received: batch.length,
      processed,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Falha ao processar lote de telemetria.' }, { status: 400 });
  }
}
