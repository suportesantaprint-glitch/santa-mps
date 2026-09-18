import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_CLIENTS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    total: INITIAL_CLIENTS.length,
    data: INITIAL_CLIENTS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.tradeName || !body.cnpj) {
      return NextResponse.json(
        { success: false, error: 'Razão/Nome Fantasia e CNPJ são obrigatórios.' },
        { status: 400 }
      );
    }
    const newClient = {
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
      branches: [],
      departments: [],
      status: 'ATIVO',
      ...body,
    };
    return NextResponse.json({ success: true, data: newClient }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Payload JSON inválido.' }, { status: 400 });
  }
}
