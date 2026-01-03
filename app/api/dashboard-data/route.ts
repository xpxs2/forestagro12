
import { NextResponse } from 'next/server';
import { getAllPlots, getAllUsers } from '@/lib/data';

export async function GET() {
  try {
    const [plots, users] = await Promise.all([getAllPlots(), getAllUsers()]);
    return NextResponse.json({ plots, users });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // It's good practice to not expose detailed error messages to the client
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
