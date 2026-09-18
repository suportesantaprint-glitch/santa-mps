import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TICKETS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');

  let results = [...INITIAL_TICKETS];
  if (status) results = results.filter((t) => t.status === status);
  if (clientId) results = results.filter((t) => t.clientId === clientId);

  return NextResponse.json({ success: true, total: results.length, data: results });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.description || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Descrição e categoria são obrigatórios.' },
        { status: 400 }
      );
    }
    const newTicket = {
      id: `tkt-${Date.now()}`,
      code: `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ABERTO',
      openedAt: new Date().toISOString(),
      slaHours: body.priority === 'CRITICA' ? 4 : body.priority === 'ALTA' ? 8 : 24,
      ...body,
    };
    return NextResponse.json({ success: true, data: newTicket }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao cadastrar chamado.' }, { status: 400 });
  }
}
