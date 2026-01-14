/**
 * ActiveFiltersChips - Display active filters and sort as removable chips
 *
 * Shows a horizontal scrollable list of filter chips with X buttons to remove them
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { X, Funnel, SortAscending } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import type { SearchFilters, SearchSort } from "@/types/search";
import { TIME_FILTER_LABELS, SORT_OPTION_LABELS } from "@/types/search";

interface ActiveFiltersChipsProps {
  filters: SearchFilters;
  sort: SearchSort;
  onRemoveFilter: (filterKey: keyof SearchFilters) => void;
  onRemoveSort: () => void;
  onOpenFilters: () => void;
}

export function ActiveFiltersChips({
  filters,
  sort,
  onRemoveFilter,
  onRemoveSort,
  onOpenFilters,
}: ActiveFiltersChipsProps) {
  const { t } = useTranslation();

  // Count active filters
  const filterCount = Object.values(filters).filter(Boolean).length;
  const hasActiveSort = sort.sortBy !== "relevance";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {/* Filters Button */}
      <Pressable
        onPress={onOpenFilters}
        className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-surface-elevated border border-border active:bg-surface-hover"
      >
        <Funnel size={16} color="#334d43" weight="fill" />
        <Text className="text-sm font-medium text-foreground">{t("search.filters.title")}</Text>
        {filterCount > 0 && (
          <View className="bg-primary rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
            <Text className="text-xs font-bold text-white">{filterCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Difficulty Filter Chip */}
      {filters.difficulty && (
        <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Text className="text-sm font-medium text-foreground capitalize">
            {t(`recipe.difficulty.${filters.difficulty}`, { defaultValue: filters.difficulty })}
          </Text>
          <Pressable
            onPress={() => onRemoveFilter("difficulty")}
            className="active:opacity-70"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color="#334d43" weight="bold" />
          </Pressable>
        </View>
      )}

      {/* Time Filter Chip */}
      {filters.timeFilter && (
        <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Text className="text-sm font-medium text-foreground">
            {t(TIME_FILTER_LABELS[filters.timeFilter], { defaultValue: filters.timeFilter })}
          </Text>
          <Pressable
            onPress={() => onRemoveFilter("timeFilter")}
            className="active:opacity-70"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color="#334d43" weight="bold" />
          </Pressable>
        </View>
      )}

      {/* Category Filter Chip */}
      {filters.categorySlug && (
        <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Text className="text-sm font-medium text-foreground">
            {t(`categories.${filters.categorySlug}`, { defaultValue: filters.categorySlug })}
          </Text>
          <Pressable
            onPress={() => onRemoveFilter("categorySlug")}
            className="active:opacity-70"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color="#334d43" weight="bold" />
          </Pressable>
        </View>
      )}

      {/* Sort Chip */}
      {hasActiveSort && (
        <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-blue-50 border border-blue-200">
          <SortAscending size={16} color="#334d43" />
          <Text className="text-sm font-medium text-foreground">
            {t(SORT_OPTION_LABELS[sort.sortBy], { defaultValue: sort.sortBy })}
          </Text>
          <Pressable
            onPress={onRemoveSort}
            className="active:opacity-70"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color="#334d43" weight="bold" />
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
