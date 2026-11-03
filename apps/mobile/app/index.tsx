import { Ionicons } from '@expo/vector-icons';
import { BOOKS } from '@biblia/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/store';

type Filter = 'all' | 'ot' | 'nt';

export default function HomeScreen() {
  const {
    lang,
    translationId,
    setTranslationId,
    translations,
    s,
    colors,
    resolvedMode,
    mode,
    cycleMode,
  } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const iconColor = resolvedMode === 'dark' ? '#ece5d8' : '#1b1916';
  const modeIcon = mode === 'system' ? 'contrast' : mode === 'dark' ? 'moon' : 'sunny';
  const list = BOOKS.filter((b) => filter === 'all' || b.testament === filter);
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: s.all },
    { id: 'ot', label: s.old },
    { id: 'nt', label: s.new },
  ];

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${colors.bg}`}>
      <View className={`flex-row h-14 items-center justify-between border-b px-2 ${colors.line}`}>
        <Pressable
          onPress={() => router.push('/menu')}
          hitSlop={8}
          className={`h-10 w-10 items-center justify-center rounded-lg ${colors.pressed}`}
        >
          <Ionicons name="menu" size={22} color={iconColor} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className={`text-[15px] font-semibold ${colors.text}`}>{s.appName}</Text>
          <Text className={`text-[10px] ${colors.muted}`}>{s.tagline}</Text>
        </View>
        <View className="flex-row">
          <Pressable
            onPress={() => router.push('/search')}
            hitSlop={8}
            className={`h-10 w-10 items-center justify-center rounded-lg ${colors.pressed}`}
          >
            <Ionicons name="search" size={20} color={iconColor} />
          </Pressable>
          <Pressable
            onPress={cycleMode}
            hitSlop={8}
            className={`h-10 w-10 items-center justify-center rounded-lg ${colors.pressed}`}
          >
            <Ionicons name={modeIcon as keyof typeof Ionicons.glyphMap} size={20} color={iconColor} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* traduções */}
        <View className="mt-4 pl-4">
          <Text className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${colors.muted}`}>
            {s.translations}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {translations.map((item) => (
              <Pressable
                key={item.id}
                disabled={!item.available}
                onPress={() => setTranslationId(item.id)}
                className={`rounded-full border px-3 py-1.5 ${
                  translationId === item.id ? colors.chipOn : colors.chipOff
                } ${item.available ? '' : 'opacity-40'}`}
              >
                <Text
                  className={`text-[12px] font-medium ${
                    translationId === item.id ? colors.accentText : colors.muted
                  }`}
                >
                  {item.name}
                  <Text className="text-[9px] uppercase"> · {item.lang}</Text>
                  {!item.available ? ` · ${s.unavailable}` : ''}
                </Text>
              </Pressable>
            ))}
            {translations.length === 0 && (
              <Text className={`py-1 text-[12px] ${colors.muted}`}>{s.loading}</Text>
            )}
          </ScrollView>
        </View>

        {/* busca */}
        <Pressable
          onPress={() => router.push('/search')}
          className={`mx-4 mt-4 h-11 flex-row items-center gap-2 rounded-xl border px-3 ${colors.card} ${colors.line}`}
        >
          <Ionicons name="search" size={16} color={iconColor} />
          <Text className={`flex-1 text-[12px] ${colors.muted}`} numberOfLines={1}>
            {s.searchPlaceholder}
          </Text>
        </Pressable>

        {/* filtro de testamento */}
        <View className="mx-4 mt-4 flex-row gap-2">
          {filters.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setFilter(option.id)}
              className={`rounded-full border px-3 py-1.5 ${
                filter === option.id ? colors.chipOn : colors.chipOff
              }`}
            >
              <Text
                className={`text-[12px] font-medium ${
                  filter === option.id ? colors.accentText : colors.muted
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* livros */}
        <View className="mx-4 mt-4 flex-row flex-wrap justify-between gap-2">
          {list.map((book) => (
            <Pressable
              key={book.id}
              onPress={() => router.push(`/chapter/${book.id}/1`)}
              className={`w-[48%] flex-row items-center justify-between rounded-xl border px-3 py-3 ${colors.card} ${colors.line}`}
            >
              <Text className={`flex-1 text-[13px] font-medium ${colors.text}`} numberOfLines={1}>
                {book.names[lang]}
              </Text>
              <Text className={`ml-2 text-[10px] ${colors.muted}`}>{book.chapters}</Text>
            </Pressable>
          ))}
        </View>

        <Text className={`mt-8 px-6 text-center text-[10px] ${colors.muted}`}>{s.footerNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
