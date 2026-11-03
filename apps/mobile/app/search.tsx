import { Ionicons } from '@expo/vector-icons';
import { getBook, parseQuery, type VerseHit } from '@biblia/core';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchVerses } from '../lib/api';
import { useApp } from '../lib/store';

export default function SearchScreen() {
  const { s, lang, colors, resolvedMode } = useApp();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<VerseHit[]>([]);
  const [searching, setSearching] = useState(false);
  const reqId = useRef(0);
  const iconColor = resolvedMode === 'dark' ? '#ece5d8' : '#1b1916';

  const parsed = useMemo(() => parseQuery(q), [q]);
  const hasQuery = q.trim().length > 0;
  const primary = parsed.book && parsed.chapter ? parsed : null;

  // busca textual de versículos (debounce)
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    const id = ++reqId.current;
    setSearching(true);
    const timer = setTimeout(() => {
      searchVerses(term)
        .then((res) => {
          if (reqId.current === id) setHits(res.hits);
        })
        .catch(() => {
          if (reqId.current === id) setHits([]);
        })
        .finally(() => {
          if (reqId.current === id) setSearching(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const go = (bookId: string, chapter?: number, verse?: number) => {
    router.back();
    setTimeout(
      () => router.push(`/chapter/${bookId}/${chapter ?? 1}${verse ? `?v=${verse}` : ''}`),
      220,
    );
  };

  const submit = () => {
    if (primary?.book && primary.chapter) go(primary.book.id, primary.chapter, primary.verse);
    else if (parsed.books[0]) go(parsed.books[0].id, 1);
    else if (hits[0]) go(hits[0].bookId, hits[0].chapter, hits[0].verse);
  };

  const showBooks = hasQuery && parsed.books.length > 0;
  const showEmpty =
    hasQuery && !searching && hits.length === 0 && parsed.books.length === 0 && !primary;

  return (
    <SafeAreaView edges={['top', 'bottom']} className={`flex-1 ${colors.bg}`}>
      <View className={`flex-row items-center gap-2 border-b px-3 py-3 ${colors.line}`}>
        <Pressable onPress={() => router.back()} hitSlop={8} className="h-8 w-8 items-center justify-center">
          <Ionicons name="close" size={20} color={iconColor} />
        </Pressable>
        <TextInput
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder={s.searchPlaceholder}
          placeholderTextColor={colors.muted}
          returnKeyType="go"
          onSubmitEditing={submit}
          className={`h-9 flex-1 text-[14px] ${colors.text}`}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searching && <ActivityIndicator size="small" color={colors.iconMuted} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 6 }} keyboardShouldPersistTaps="handled">
        {!hasQuery && <Text className={`text-[13px] ${colors.muted}`}>{s.searchHint}</Text>}

        {hasQuery && primary && (
          <Pressable
            onPress={() => go(primary.book!.id, primary.chapter, primary.verse)}
            className={`mb-2 flex-row items-center justify-between rounded-xl px-4 py-3.5 ${colors.accentBg}`}
          >
            <Text className={`text-[15px] font-semibold ${colors.onAccent}`}>
              {primary.book!.names[lang]} {primary.chapter}
              {primary.verse ? `:${primary.verse}` : ''}
            </Text>
            <Text className={`text-[11px] ${colors.onAccent} opacity-80`}>{s.open} →</Text>
          </Pressable>
        )}

        {showBooks &&
          parsed.books.map((book) => (
            <Pressable
              key={book.id}
              onPress={() => go(book.id, 1)}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${colors.line}`}
            >
              <Text className={`text-[14px] ${colors.text}`}>{book.names[lang]}</Text>
              <Text className={`text-[10px] ${colors.muted}`}>
                {book.chapters} {s.chapters}
              </Text>
            </Pressable>
          ))}

        {hasQuery && searching && (
          <Text className={`px-1 py-2 text-[13px] ${colors.muted}`}>{s.searching}</Text>
        )}

        {!searching && hits.length > 0 && (
          <View className="gap-1.5">
            <Text
              className={`px-1 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest ${colors.muted}`}
            >
              {s.searchVerses}
            </Text>
            {hits.map((hit) => {
              const book = getBook(hit.bookId);
              return (
                <Pressable
                  key={`${hit.translation}:${hit.bookId}:${hit.chapter}:${hit.verse}`}
                  onPress={() => go(hit.bookId, hit.chapter, hit.verse)}
                  className={`rounded-xl border px-4 py-3 ${colors.line}`}
                >
                  <View className="flex-row items-baseline gap-2">
                    <Text className={`text-[12px] font-semibold ${colors.accentText}`}>
                      {book ? book.names[lang] : hit.bookId} {hit.chapter}:{hit.verse}
                    </Text>
                    <Text className={`text-[10px] uppercase ${colors.muted}`}>
                      {hit.translationName}
                    </Text>
                  </View>
                  <Text numberOfLines={3} className={`mt-1 text-[13px] leading-5 ${colors.text}`}>
                    {hit.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {showEmpty && <Text className={`text-[13px] ${colors.muted}`}>{s.noResults}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
