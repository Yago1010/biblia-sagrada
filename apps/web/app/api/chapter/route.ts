import { NextResponse } from 'next/server';
import { DataError, getChapter } from '@biblia/server/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const data = await getChapter(
      String(searchParams.get('translation') ?? 'almeida'),
      String(searchParams.get('book') ?? ''),
      Number(searchParams.get('chapter')),
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof DataError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: 'internal', message: (err as Error).message },
      { status: 500 },
    );
  }
}
