import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Heartbeat esperado: agent_id, hostname, version, ip, timestamp (README Seção 16)
    const { agent_id, hostname, version, ip } = body;

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id é obrigatório.' },
        { status: 400 }
      );
    }

    const responsePayload = {
      status: 'ACKNOWLEDGED',
      agent_id,
      server_time: new Date().toISOString(),
      command_queue: [],
      discovery_requested: false,
      next_poll_seconds: 60,
      client_info: {
        hostname: hostname || 'CLIENT-SRV',
        ip: ip || '127.0.0.1',
        version: version || '1.0.0',
      },
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch {
    return NextResponse.json({ success: false, error: 'Formato de payload inválido.' }, { status: 400 });
  }
}
