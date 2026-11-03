import type { AvailableTranslation, ChapterPayload, SearchResult } from '@biblia/core';

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const BASE = RAW_BASE.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch (err) {
    throw new ApiError(0, 'network', (err as Error).message);
  }
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? 'unknown', body.message ?? res.statusText);
  }
  return body as T;
}

export async function fetchTranslations(): Promise<AvailableTranslation[]> {
  const data = await getJson<{ translations: AvailableTranslation[] }>(`${BASE}/translations`);
  return data.translations ?? [];
}

export async function fetchChapter(
  translation: string,
  book: string,
  chapter: number,
): Promise<ChapterPayload> {
  const q = new URLSearchParams({ translation, book, chapter: String(chapter) });
  return getJson<ChapterPayload>(`${BASE}/chapter?${q.toString()}`);
}

export async function searchVerses(q: string, limit = 40): Promise<SearchResult> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return getJson<SearchResult>(`${BASE}/search?${params.toString()}`);
}
