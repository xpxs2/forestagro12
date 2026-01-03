
import { NextResponse } from 'next/server';
import { getPlotsByFarmerId } from '@/lib/data';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const plots = await getPlotsByFarmerId(id);

    if (!plots) {
      // Even if no plots are found, returning an empty array is a valid success case.
      return NextResponse.json([]);
    }

    return NextResponse.json(plots);
  } catch (error) {
    console.error(`API GET Error for user plots ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
