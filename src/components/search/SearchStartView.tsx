import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { TrendUp, ClockCounterClockwise, ForkKnifeIcon } from "phosphor-react-native";
import { getSearchHistory, clearSearchHistory } from "@/utils/searchHistory";
import { useFocusEffect } from "expo-router";

interface SearchStartViewProps {
  onSelectTerm: (term: string) => void;
  contentPaddingTop?: number;
}

const QUICK_INGREDIENTS = [
  { id: "chicken", icon: "🍗" },
  { id: "pasta", icon: "🍝" },
  { id: "eggs", icon: "🥚" },
  { id: "salmon", icon: "🐟" },
  { id: "beef", icon: "🥩" },
  { id: "tomato", icon: "🍅" },
  { id: "avocado", icon: "🥑" },
  { id: "rice", icon: "🍚" },
  { id: "potato", icon: "🥔" },
  { id: "cheese", icon: "🧀" },
];

// Popular search IDs - will be translated
const POPULAR_SEARCH_IDS = [
  "pasta",
  "chicken",
  "salad",
  "soup",
  "pancakes",
  "curry",
  "avocado",
  "salmon",
];

export function SearchStartView({ onSelectTerm, contentPaddingTop = 20 }: SearchStartViewProps) {
  const { t } = useTranslation();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history when view is focused
  useFocusEffect(
    useCallback(() => {
      getSearchHistory().then(setSearchHistory);
    }, [])
  );

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100, paddingTop: contentPaddingTop }}
      showsVerticalScrollIndicator={false}
    >
      {/* Search History Section */}
      {searchHistory.length > 0 && (
        <View className="px-5 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <ClockCounterClockwise size={18} color="#8a8177" weight="duotone" />
              <Text className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary">
                {t("search.history.title", "Recent Searches")}
              </Text>
            </View>
            <Pressable onPress={handleClearHistory} hitSlop={10}>
              <Text className="text-sm text-foreground-tertiary font-medium">
                {t("search.history.clear", "Clear")}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <Pressable
                key={`${term}-${index}`}
                onPress={() => onSelectTerm(term)}
                className="flex-row items-center gap-2 px-4 py-2.5 bg-surface-elevated rounded-full border border-border active:bg-primary/5 active:border-primary/30"
              >
                <Text className="text-foreground font-medium capitalize">{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Ingredients Quick Search */}
      <View className="px-5 mb-8">
        <View className="flex-row items-center gap-2 mb-4">
          <ForkKnifeIcon size={18} color="#8a8177" weight="duotone" />
          <Text className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary">
            {t("search.ingredients.title", "Ingredients")}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {QUICK_INGREDIENTS.map((ingredient) => {
            // Use the translated ingredient name for search
            const translatedName = t(`ingredients.${ingredient.id}` as any, ingredient.id);
            return (
              <Pressable
                key={ingredient.id}
                onPress={() => onSelectTerm(translatedName)}
                className="flex-row items-center gap-2 px-4 py-2.5 bg-surface-elevated rounded-full border border-border active:bg-primary/5 active:border-primary/30"
              >
                <Text className="text-base">{ingredient.icon}</Text>
                <Text className="text-foreground font-medium capitalize">{translatedName}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Popular Searches Section */}
      <View className="px-5">
        <View className="flex-row items-center gap-2 mb-4">
          <TrendUp size={18} color="#8a8177" weight="duotone" />
          <Text className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary">
            {t("search.popular.title", "Popular Searches")}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {POPULAR_SEARCH_IDS.map((id) => {
            // Use translated name for both display and search
            const translatedName = t(`search.popularSearches.${id}` as any, id);
            return (
              <Pressable
                key={id}
                onPress={() => onSelectTerm(translatedName)}
                className="px-4 py-2.5 bg-surface-elevated rounded-full border border-border active:bg-primary/5 active:border-primary/30"
              >
                <Text className="text-foreground font-medium capitalize">{translatedName}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
