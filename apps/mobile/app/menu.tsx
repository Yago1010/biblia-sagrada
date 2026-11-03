import { Ionicons } from '@expo/vector-icons';
import { getBook, type Lang } from '@biblia/core';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, type ThemeMode } from '../lib/store';

export default function MenuScreen() {
  const {
    lang,
    setLang,
    translationId,
    setTranslationId,
    translations,
    s,
    colors,
    resolvedMode,
    mode,
    setMode,
    highlights,
    toggleHighlight,
  } = useApp();

  const iconColor = resolvedMode === 'dark' ? '#ece5d8' : '#1b1916';

  const themes: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'light', label: s.light, icon: 'sunny' },
    { id: 'dark', label: s.dark, icon: 'moon' },
    { id: 'system', label: s.system, icon: 'contrast' },
  ];
  const langs: { id: Lang; label: string }[] = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
  ];

  const openBookmark = (key: string) => {
    const [bookId, chapter, verse] = key.split(':');
    router.back();
    setTimeout(() => router.push(`/chapter/${bookId}/${chapter}?v=${verse}`), 220);
  };

  const SectionTitle = ({ children }: { children: string }) => (
    <Text className={`mb-2 mt-6 text-[10px] font-semibold uppercase tracking-widest ${colors.muted}`}>
      {children}
    </Text>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} className={`flex-1 ${colors.bg}`}>
      <View className={`flex-row items-center justify-between border-b px-4 py-3 ${colors.line}`}>
        <View>
          <Text className={`text-[15px] font-semibold ${colors.text}`}>{s.appName}</Text>
          <Text className={`text-[10px] ${colors.muted}`}>{s.tagline}</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 items-center justify-center">
          <Ionicons name="close" size={20} color={iconColor} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <SectionTitle>{s.theme}</SectionTitle>
        <View className="flex-row gap-2">
          {themes.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setMode(option.id)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 ${
                mode === option.id ? colors.chipOn : colors.chipOff
              }`}
            >
              <Ionicons
                name={option.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={mode === option.id ? iconColor : colors.iconMuted}
              />
              <Text
                className={`text-[12px] font-medium ${
                  mode === option.id ? colors.accentText : colors.muted
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle>{s.language}</SectionTitle>
        <View className="flex-row gap-2">
          {langs.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setLang(option.id)}
              className={`flex-1 rounded-full border px-3 py-2.5 ${
                lang === option.id ? colors.chipOn : colors.chipOff
              }`}
            >
              <Text
                className={`text-center text-[12px] font-medium ${
                  lang === option.id ? colors.accentText : colors.muted
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle>{s.translations}</SectionTitle>
        <View className="gap-1.5">
          {translations.map((item) => (
            <Pressable
              key={item.id}
              disabled={!item.available}
              onPress={() => setTranslationId(item.id)}
              className={`flex-row items-center justify-between rounded-xl border px-3 py-3 ${
                translationId === item.id
                  ? `${colors.card} ${colors.borderAccent}`
                  : colors.line
              } ${item.available ? '' : 'opacity-40'}`}
            >
              <View className="flex-row items-center gap-2">
                <Text className={`text-[14px] font-medium ${colors.text}`}>{item.name}</Text>
                <Text className={`text-[10px] uppercase ${colors.muted}`}>{item.lang}</Text>
              </View>
              {translationId === item.id ? (
                <Ionicons name="checkmark-circle" size={18} color={iconColor} />
              ) : !item.available ? (
                <Text className={`text-[10px] ${colors.muted}`}>{s.unavailable}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>

        <SectionTitle>{s.bookmarks}</SectionTitle>
        {highlights.length === 0 ? (
          <Text className={`text-[13px] ${colors.muted}`}>{s.noBookmarks}</Text>
        ) : (
          <View className="gap-1.5">
            {highlights.map((key) => {
              const [bookId, chapter, verse] = key.split(':');
              const book = getBook(bookId);
              return (
                <View
                  key={key}
                  className={`flex-row items-center rounded-xl border px-3 ${colors.line}`}
                >
                  <Pressable
                    onPress={() => openBookmark(key)}
                    className="flex-1 flex-row items-center gap-2 py-3"
                  >
                    <Ionicons name="bookmark" size={14} color={iconColor} />
                    <Text className={`text-[14px] ${colors.text}`}>
                      {book ? book.names[lang] : bookId} {chapter}:{verse}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => toggleHighlight(key)} hitSlop={8} className="py-3 pl-2">
                    <Ionicons name="close" size={16} color={colors.iconMuted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <SectionTitle>{s.sourcesTitle}</SectionTitle>
        <Text className={`text-[12px] leading-5 ${colors.muted}`}>{s.sourceApi}</Text>
        <Text className={`mt-1 text-[12px] leading-5 ${colors.muted}`}>{s.sourceLocal}</Text>
        <Text className={`mt-6 text-center text-[10px] ${colors.muted}`}>{s.footerNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
