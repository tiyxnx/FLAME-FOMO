import { NextResponse } from 'next/server';
import { syncLifeAtFlameAll } from '@/lib/lifeAtFlameSync';


export async function GET() {
  try {
    const result = await syncLifeAtFlameAll();
    return NextResponse.json(
      {
        ...result,
        syncedAt: new Date().toISOString(),
        sourceUrl: 'https://sites.google.com/flame.edu.in/lifeatflame/home',
      },
      {
        status: result.success ? 200 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Server sync error',
        syncedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
