import { NextResponse } from 'next/server';
import { searchVerses } from '@biblia/server/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const q = String(searchParams.get('q') ?? '').trim();
    if (q.length < 2) {
      return NextResponse.json({ hits: [], truncated: false });
    }
    const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 40) || 40, 1), 100);
    return NextResponse.json(searchVerses(q, limit));
  } catch (err) {
    return NextResponse.json(
      { error: 'internal', message: (err as Error).message },
      { status: 500 },
    );
  }
}
