
import { NextResponse } from 'next/server';
import { getPlotsByFarmerId } from '@/lib/data';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function GET(request: Request, { params }: { params: { farmerId: string } }) {
  try {
    const { farmerId } = params;
    if (!farmerId) {
        return NextResponse.json({ message: 'Farmer ID is required' }, { status: 400 });
    }

    const plots = await getPlotsByFarmerId(farmerId);

    return NextResponse.json(plots);

  } catch (error) {
    console.error('API Error in /api/plots/by-farmer/[farmerId]:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
