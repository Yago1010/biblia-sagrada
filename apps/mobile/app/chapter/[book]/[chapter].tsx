import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOOKS, formatCopyText, resolveBook, type ChapterPayload } from '@biblia/core';
import { ApiError, fetchChapter } from '../../../lib/api';
import { useApp } from '../../../lib/store';

export default function ChapterScreen() {
  const params = useLocalSearchParams<{ book: string; chapter: string; v?: string }>();
  const {
    lang,
    translationId,
    translations,
    s,
    colors,
    resolvedMode,
    isHighlighted,
    toggleHighlight,
    makeKey,
  } = useApp();

  const book = resolveBook(String(params.book ?? ''));
  const chapter = Number(params.chapter);
  const valid = Boolean(book) && Number.isInteger(chapter) && chapter >= 1 && chapter <= book!.chapters;
  const iconColor = resolvedMode === 'dark' ? '#ece5d8' : '#1b1916';

  const [data, setData] = useState<ChapterPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<number, number>>({});
  const translationsRef = useRef(translations);
  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);

  const translationName =
    translationsRef.current.find((t) => t.id === translationId)?.name ?? translationId;

  useEffect(() => {
    setSelected(null);
    setPickerOpen(false);
    setCopied(false);

    if (!valid) {
      setData(null);
      setError(s.invalidReference);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);
    fetchChapter(translationId, String(params.book), chapter)
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setData(null);
        if (err instanceof ApiError) {
          const name =
            translationsRef.current.find((t) => t.id === translationId)?.name ?? translationId;
          setError(
            err.code === 'translation_file_missing'
              ? s.fileMissing(name)
              : err.code === 'network'
                ? s.serverDown
                : err.message,
          );
        } else {
          setError(String(err));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationId, params.book, chapter, valid, attempt]);

  // rola até o versículo vindo dos marcados
  const targetVerse = params.v ? Number(params.v) : null;
  useEffect(() => {
    if (!data || !targetVerse || !Number.isFinite(targetVerse)) return;
    const timer = setTimeout(() => {
      const y = offsets.current[targetVerse];
      if (y !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(y - 150, 0), animated: true });
      }
      setSelected(targetVerse);
    }, 450);
    return () => clearTimeout(timer);
  }, [data, targetVerse]);

  const step = (dir: -1 | 1) => {
    if (!book) return;
    const target = chapter + dir;
    if (target >= 1 && target <= book.chapters) {
      router.replace(`/chapter/${book.id}/${target}`);
      return;
    }
    const neighbour = BOOKS[book.index + dir];
    if (neighbour) {
      router.replace(`/chapter/${neighbour.id}/${dir === 1 ? 1 : neighbour.chapters}`);
    }
  };

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const copyVerse = async (verseNumber: number, text: string) => {
    if (!book) return;
    const payload = formatCopyText(
      book,
      chapter,
      verseNumber,
      text,
      translationName,
      lang,
    );
    await Clipboard.setStringAsync(payload);
    flashCopied();
  };

  const shareVerse = async (verseNumber: number, text: string) => {
    if (!book) return;
    const reference = `${book.names[lang]} ${chapter}:${verseNumber}`;
    try {
      await Share.share({ message: `${reference} (${translationName})\n${text}` });
    } catch {
      /* compartilhamento cancelado */
    }
  };

  const verse = selected !== null ? data?.verses.find((v) => v.n === selected) ?? null : null;
  const trackOffset = (n: number, y: number) => {
    offsets.current[n] = y;
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${colors.bg}`}>
      <View className={`flex-row h-14 items-center border-b px-2 ${colors.line}`}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={8}
          className={`h-10 w-10 items-center justify-center rounded-lg ${colors.pressed}`}
        >
          <Ionicons name="arrow-back" size={20} color={iconColor} />
        </Pressable>
        <Pressable
          onPress={() => setPickerOpen((v) => !v)}
          className="flex-1 items-center px-1"
          hitSlop={8}
        >
          <Text className={`text-[15px] font-semibold ${colors.text}`} numberOfLines={1}>
            {book ? book.names[lang] : String(params.book)}
          </Text>
          <Text className={`text-[10px] ${colors.muted}`} numberOfLines={1}>
            {s.chapter} {chapter}
            {book ? ` / ${book.chapters}` : ''} · {translationName} ▾
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/search')}
          hitSlop={8}
          className={`h-10 w-10 items-center justify-center rounded-lg ${colors.pressed}`}
        >
          <Ionicons name="search" size={19} color={iconColor} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/menu')}
          hitSlop={8}
          className={`h-10 w-10 items-center justify-center rounded-lg ${colors.pressed}`}
        >
          <Ionicons name="menu" size={20} color={iconColor} />
        </Pressable>
      </View>

      {pickerOpen && book && (
        <View className={`border-b ${colors.line}`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, padding: 12 }}
          >
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                onPress={() => router.replace(`/chapter/${book.id}/${n}`)}
                className={`h-8 min-w-8 items-center justify-center rounded-md border px-2 ${
                  n === chapter ? colors.chipOn : colors.chipOff
                }`}
              >
                <Text
                  className={`text-[12px] font-medium ${
                    n === chapter ? colors.accentText : colors.muted
                  }`}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <Text className={`py-16 text-center text-[13px] ${colors.muted}`}>{s.loading}</Text>
        )}

        {!loading && error && (
          <View className={`items-center rounded-2xl border px-5 py-6 ${colors.card} ${colors.line}`}>
            <Text className={`text-center text-[13px] leading-5 ${colors.text}`}>{error}</Text>
            <Pressable
              onPress={() => setAttempt((n) => n + 1)}
              className={`mt-4 rounded-full border px-4 py-2 ${colors.chipOff}`}
            >
              <Text className={`text-[12px] ${colors.muted}`}>{s.retry}</Text>
            </Pressable>
          </View>
        )}

        {!loading && data && (
          <>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className={`text-[10px] uppercase tracking-widest ${colors.muted}`}>
                {data.reference}
              </Text>
              <Text className={`text-[10px] uppercase tracking-widest ${colors.muted}`}>
                {data.verses.length} {s.verse}s
              </Text>
            </View>

            {data.verses.map((item) => {
              const key = makeKey(String(params.book), chapter, item.n);
              const highlighted = isHighlighted(key);
              const isSelected = selected === item.n;
              return (
                <Pressable
                  key={item.n}
                  onLayout={(e) => trackOffset(item.n, e.nativeEvent.layout.y)}
                  onPress={() => setSelected(isSelected ? null : item.n)}
                  className={`-mx-3 flex-row gap-3 rounded-xl px-3 py-2 ${
                    isSelected ? colors.card : ''
                  }`}
                >
                  <Pressable
                    onPress={() => setSelected(isSelected ? null : item.n)}
                    className="mt-1 w-6 items-end"
                    hitSlop={4}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        highlighted ? colors.accentText : colors.muted
                      }`}
                    >
                      {item.n}
                    </Text>
                  </Pressable>
                  <Text
                    className={`flex-1 text-[16px] leading-7 ${colors.text} ${
                      highlighted ? (resolvedMode === 'dark' ? 'bg-[#d6b06e]/20' : 'bg-[#926a2d]/15') : ''
                    }`}
                  >
                    {item.text}
                  </Text>
                </Pressable>
              );
            })}

            <View className="mt-8 flex-row items-center justify-between gap-2">
              <Pressable onPress={() => step(-1)} className={`rounded-full border px-4 py-2.5 ${colors.chipOff}`}>
                <Text className={`text-[12px] ${colors.muted}`}>← {s.prev}</Text>
              </Pressable>
              <Pressable
                onPress={() => setPickerOpen(true)}
                className={`rounded-full border px-4 py-2.5 ${colors.chipOff}`}
              >
                <Text className={`text-[12px] ${colors.muted}`}>{s.chapter}</Text>
              </Pressable>
              <Pressable onPress={() => step(1)} className={`rounded-full border px-4 py-2.5 ${colors.chipOff}`}>
                <Text className={`text-[12px] ${colors.muted}`}>{s.next} →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {verse && selected !== null && book && (
        <View className={`absolute inset-x-0 bottom-0 border-t backdrop-blur ${colors.card} ${colors.line}`}>
          <View className="flex-row flex-wrap items-center gap-2 px-3 py-3">
            <Text className={`mr-auto text-[11px] ${colors.muted}`} numberOfLines={1}>
              {book.names[lang]} {chapter}:{verse.n}
            </Text>
            <Pressable
              onPress={() => copyVerse(verse.n, verse.text)}
              className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${colors.chipOff}`}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={14}
                color={iconColor}
              />
              <Text className={`text-[12px] ${colors.text}`}>{copied ? s.copied : s.copy}</Text>
            </Pressable>
            <Pressable
              onPress={() => shareVerse(verse.n, verse.text)}
              className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${colors.chipOff}`}
            >
              <Ionicons name="share-social-outline" size={14} color={iconColor} />
              <Text className={`text-[12px] ${colors.text}`}>{s.share}</Text>
            </Pressable>
            <Pressable
              onPress={() => toggleHighlight(makeKey(String(params.book), chapter, verse.n))}
              className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                isHighlighted(makeKey(String(params.book), chapter, verse.n))
                  ? colors.chipOn
                  : colors.chipOff
              }`}
            >
              <Ionicons
                name="bookmark"
                size={14}
                color={
                  isHighlighted(makeKey(String(params.book), chapter, verse.n))
                    ? iconColor
                    : colors.iconMuted
                }
              />
              <Text
                className={`text-[12px] ${
                  isHighlighted(makeKey(String(params.book), chapter, verse.n))
                    ? colors.accentText
                    : colors.text
                }`}
              >
                {isHighlighted(makeKey(String(params.book), chapter, verse.n))
                  ? s.removeHighlight
                  : s.highlight}
              </Text>
            </Pressable>
            <Pressable onPress={() => setSelected(null)} hitSlop={8} className="h-8 w-8 items-center justify-center">
              <Ionicons name="close" size={18} color={colors.iconMuted} />
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
