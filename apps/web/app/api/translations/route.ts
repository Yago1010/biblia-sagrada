import { NextResponse } from 'next/server';
import { listTranslations } from '@biblia/server/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ translations: listTranslations() });
}
