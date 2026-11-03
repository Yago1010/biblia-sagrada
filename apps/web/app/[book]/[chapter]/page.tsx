'use client';

import { useParams } from 'next/navigation';
import { ChapterView } from '../../../components/ChapterView';

export default function ChapterPage() {
  const params = useParams<{ book: string; chapter: string }>();
  return <ChapterView bookId={params.book} rawChapter={params.chapter} />;
}
