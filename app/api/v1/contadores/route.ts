import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_METERS } from '@/lib/mock-data';
import { calculateProduction } from '@/lib/billing-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const printerId = searchParams.get('printerId');

  let results = [...INITIAL_METERS];
  if (printerId) {
    results = results.filter((m) => m.printerId === printerId);
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
    const { printerId, counterTotal, counterMono, counterColor, previousTotal = 0 } = body;

    if (!printerId || counterTotal === undefined) {
      return NextResponse.json(
        { success: false, error: 'printerId e counterTotal são obrigatórios.' },
        { status: 400 }
      );
    }

    const prodCheck = calculateProduction(Number(counterTotal), Number(previousTotal));

    const newReading = {
      id: `met-${Date.now()}`,
      printerId,
      timestamp: new Date().toISOString(),
      counterTotal: Number(counterTotal),
      counterMono: Number(counterMono || counterTotal),
      counterColor: Number(counterColor || 0),
      productionTotal: prodCheck.production,
      validationStatus: prodCheck.validationStatus,
      inconsistencyReason: prodCheck.inconsistencyReason,
      source: body.source || 'API',
    };

    return NextResponse.json({
      success: prodCheck.isValid,
      data: newReading,
      validation: prodCheck,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro no processamento da leitura.' }, { status: 400 });
  }
}
