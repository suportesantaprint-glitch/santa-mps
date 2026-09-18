import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_INVOICES } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period');

  let results = [...INITIAL_INVOICES];
  if (period) {
    results = results.filter((i) => i.periodMonth === period);
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
    const { periodMonth = '2026-09' } = body;

    return NextResponse.json({
      success: true,
      message: `Fechamento do mês ${periodMonth} processado com sucesso.`,
      period: periodMonth,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Falha ao processar faturamento.' }, { status: 400 });
  }
}
