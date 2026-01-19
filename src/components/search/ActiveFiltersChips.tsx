/**
 * ActiveFiltersChips - Display active filters and sort as removable chips
 *
 * Shows a horizontal scrollable list of filter chips with X buttons to remove them
 */
import { Text, Pressable, ScrollView } from "react-native";
import {
  XIcon,
  SortAscendingIcon,
  ChartBarIcon,
  ForkKnifeIcon,
  TimerIcon,
  FlameIcon,
  MoonIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import type { SearchFilters, SearchSort } from "@/types/search";
import { SORT_OPTION_LABELS } from "@/types/search";
import { ShadowItem } from "@/components/ShadowedSection";
import { formatDuration } from "@/utils/formatDuration";
import * as Haptics from "expo-haptics";
import { CATEGORY_ICONS } from "@/constants/categoryIcons";

interface ActiveFiltersChipsProps {
  filters: SearchFilters;
  sort: SearchSort;
  onRemoveFilter: (filterKey: keyof SearchFilters, value?: any) => void;
  onRemoveSort: () => void;
}

export function ActiveFiltersChips({
  filters,
  sort,
  onRemoveFilter,
  onRemoveSort,
}: ActiveFiltersChipsProps) {
  const { t } = useTranslation();

  const hasActiveSort = sort.sortBy !== "relevance";

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 -mx-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {/* Difficulty Filter Chip */}
      {filters.difficulty && (
        <ShadowItem
          variant="primary"
          className="flex-row items-center gap-2 px-3 py-2 h-9 bg-primary/10 border-primary/20"
        >
          <ChartBarIcon size={14} color="#334d43" weight="duotone" />
          <Text className="text-sm font-semibold text-primary capitalize">
            {t(`recipe.difficulty.${filters.difficulty}`, { defaultValue: filters.difficulty })}
          </Text>
          <Pressable
            onPress={() => {
              handleRemove();
              onRemoveFilter("difficulty");
            }}
            hitSlop={8}
            className="rounded-full p-0.5"
          >
            <XIcon size={12} color="#334d43" weight="bold" />
          </Pressable>
        </ShadowItem>
      )}

      {/* Category Filter Chips */}
      {filters.categorySlugs?.map((slug) => {
        const Icon = CATEGORY_ICONS[slug] || ForkKnifeIcon;
        return (
          <ShadowItem
            key={`cat-${slug}`}
            variant="primary"
            className="flex-row items-center gap-2 px-3 py-2 h-9 bg-primary/10 border-primary/20"
          >
            <Icon size={14} color="#334d43" weight="duotone" />
            <Text className="text-sm font-semibold text-primary capitalize">
              {t(`categories.${slug}`, { defaultValue: slug })}
            </Text>
            <Pressable
              onPress={() => {
                handleRemove();
                onRemoveFilter("categorySlugs", slug);
              }}
              hitSlop={8}
              className="rounded-full p-0.5"
            >
              <XIcon size={12} color="#334d43" weight="bold" />
            </Pressable>
          </ShadowItem>
        );
      })}

      {/* Time Filters Chips */}
      {filters.timeFilters?.prep?.enabled && (
        <ShadowItem
          variant="primary"
          className="flex-row items-center gap-2 px-3 py-2 h-9 bg-primary/10 border-primary/20"
        >
          <TimerIcon size={14} color="#334d43" weight="duotone" />
          <Text className="text-sm font-semibold text-primary">
            {t("search.filters.prepTime")} &lt;{" "}
            {formatDuration(filters.timeFilters?.prep?.maxMinutes ?? 0, { t })}
          </Text>
          <Pressable
            onPress={() => {
              handleRemove();
              onRemoveFilter("timeFilters", "prep");
            }}
            hitSlop={8}
            className="rounded-full p-0.5"
          >
            <XIcon size={12} color="#334d43" weight="bold" />
          </Pressable>
        </ShadowItem>
      )}

      {filters.timeFilters?.cook?.enabled && (
        <ShadowItem
          variant="primary"
          className="flex-row items-center gap-2 px-3 py-2 h-9 bg-primary/10 border-primary/20"
        >
          <FlameIcon size={14} color="#334d43" weight="duotone" />
          <Text className="text-sm font-semibold text-primary">
            {t("search.filters.cookTime")} &lt;{" "}
            {formatDuration(filters.timeFilters?.cook?.maxMinutes ?? 0, { t })}
          </Text>
          <Pressable
            onPress={() => {
              handleRemove();
              onRemoveFilter("timeFilters", "cook");
            }}
            hitSlop={8}
            className="rounded-full p-0.5"
          >
            <XIcon size={12} color="#334d43" weight="bold" />
          </Pressable>
        </ShadowItem>
      )}

      {filters.timeFilters?.rest?.enabled && (
        <ShadowItem
          variant="primary"
          className="flex-row items-center gap-2 px-3 py-2 h-9 bg-primary/10 border-primary/20"
        >
          <MoonIcon size={14} color="#334d43" weight="duotone" />
          <Text className="text-sm font-semibold text-primary">
            {t("search.filters.restTime")} &lt;{" "}
            {formatDuration(filters.timeFilters?.rest?.maxMinutes ?? 0, { t })}
          </Text>
          <Pressable
            onPress={() => {
              handleRemove();
              onRemoveFilter("timeFilters", "rest");
            }}
            hitSlop={8}
            className="rounded-full p-0.5"
          >
            <XIcon size={12} color="#334d43" weight="bold" />
          </Pressable>
        </ShadowItem>
      )}

      {/* Sort Chip */}
      {hasActiveSort && (
        <ShadowItem
          variant="default"
          className="flex-row items-center gap-2 px-3 py-2 h-9 bg-blue-50 border-blue-200"
        >
          <SortAscendingIcon size={14} color="#334d43" />
          <Text className="text-sm font-semibold text-foreground-heading">
            {t(SORT_OPTION_LABELS[sort.sortBy], { defaultValue: sort.sortBy })}
          </Text>
          <Pressable
            onPress={() => {
              handleRemove();
              onRemoveSort();
            }}
            hitSlop={8}
            className="rounded-full p-0.5"
          >
            <XIcon size={12} color="#334d43" weight="bold" />
          </Pressable>
        </ShadowItem>
      )}
    </ScrollView>
  );
}
