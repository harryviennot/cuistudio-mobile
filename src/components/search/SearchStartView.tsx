import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Coffee,
  MoonStars,
  Heartbeat,
  Fire,
  Leaf,
  Clock,
  TrendUp,
  ClockCounterClockwise,
} from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getSearchHistory, clearSearchHistory } from "@/utils/searchHistory";
import { useFocusEffect } from "expo-router";

interface SearchStartViewProps {
  onSelectCategory: (category: string) => void;
  onSelectTerm: (term: string) => void;
  contentPaddingTop?: number;
}

const CATEGORIES = [
  { id: "breakfast", icon: Coffee, color: "#eab308" },
  { id: "dinner", icon: MoonStars, color: "#3b82f6" },
  { id: "healthy", icon: Heartbeat, color: "#ef4444" },
  { id: "dessert", icon: Fire, color: "#f97316" },
  { id: "vegetarian", icon: Leaf, color: "#22c55e" },
  { id: "quick", icon: Clock, color: "#a855f7" },
];

const POPULAR_SEARCHES = [
  "Pasta",
  "Chicken",
  "Salad",
  "Soup",
  "Pancakes",
  "Curry",
  "Avocado",
  "Salmon",
];

export function SearchStartView({
  onSelectCategory,
  onSelectTerm,
  contentPaddingTop = 20,
}: SearchStartViewProps) {
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
              <ClockCounterClockwise size={20} color="#334d43" weight="bold" />
              <Text className="font-playfair-bold text-xl text-foreground-heading">
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

      {/* Browse Categories Section */}
      <View className="px-5 mb-8">
        <Text className="font-playfair-bold text-2xl text-foreground-heading mb-2">
          {t("search.browse.title", "Browse Categories")}
        </Text>
        <Text className="text-foreground-secondary mb-6">
          {t("search.browse.subtitle", "Explore recipes by meal type or diet")}
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              className="w-[48%] aspect-[1.4] mb-1 relative overflow-hidden rounded-2xl active:opacity-90"
            >
              <LinearGradient
                colors={[cat.color + "15", cat.color + "05"]}
                className="absolute inset-0"
              />

              <View className="absolute inset-0 items-center justify-center p-4 border border-white/20 rounded-2xl">
                <cat.icon
                  size={48}
                  color={cat.color}
                  weight="duotone"
                  style={{
                    opacity: 0.15,
                    position: "absolute",
                    right: -10,
                    bottom: -10,
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
                <cat.icon
                  size={32}
                  color={cat.color}
                  weight="duotone"
                  style={{ marginBottom: 8 }}
                />
                <Text className="font-playfair-bold text-lg text-foreground-heading capitalize">
                  {t(`category.${cat.id}`, cat.id)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Popular Searches Section */}
      <View className="px-5">
        <View className="flex-row items-center gap-2 mb-4">
          <TrendUp size={20} color="#334d43" weight="bold" />
          <Text className="font-playfair-bold text-xl text-foreground-heading">
            {t("search.popular.title", "Popular Searches")}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <Pressable
              key={term}
              onPress={() => onSelectTerm(term)}
              className="px-4 py-2.5 bg-surface-elevated rounded-full border border-border active:bg-primary/5 active:border-primary/30"
            >
              <Text className="text-foreground font-medium">{term}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
