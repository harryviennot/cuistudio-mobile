/**
 * SearchFiltersSheet - Premium bottom sheet for selecting search filters
 *
 * Features:
 * - Granular time filters (prep, cook, rest) with checkboxes + TimeAdjusters
 * - Multi-select categories with wrapped chips
 * - Difficulty selection
 */
import React, { forwardRef, useMemo, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import {
  ClockIcon,
  ChartBarIcon,
  ForkKnifeIcon,
  TimerIcon,
  FlameIcon,
  MoonIcon,
} from "phosphor-react-native";
import type { SearchFilters, DifficultyFilter, TimeFilters } from "@/types/search";
import { useCategories } from "@/hooks/useCategories";
import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import { ShadowItem } from "@/components/ShadowedSection";
import { ActionButton } from "@/components/ui/ActionButton";
import { TimeFilterRow } from "./TimeFilterRow";
import { CategoryIcon } from "@/components/home/CategoryChip";
import { formatDuration } from "@/utils/formatDuration";
import { cn } from "@/utils/cn";

interface SearchFiltersSheetProps {
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
}

// Default time filter values
const DEFAULT_TIME_FILTERS: TimeFilters = {
  prep: { enabled: false, maxMinutes: 30 },
  cook: { enabled: false, maxMinutes: 60 },
  rest: { enabled: false, maxMinutes: 30 },
};

export const SearchFiltersSheet = forwardRef<BottomSheetModal, SearchFiltersSheetProps>(
  function SearchFiltersSheet({ filters, onApplyFilters }, ref) {
    const { t } = useTranslation();
    const { bottom } = useSafeAreaInsets();
    const { data: categories } = useCategories();

    // Local state for filters (apply on submit)
    const [localFilters, setLocalFilters] = React.useState<{
      difficulty?: DifficultyFilter;
      categorySlugs: string[];
      timeFilters: TimeFilters;
    }>(() => ({
      difficulty: filters.difficulty,
      categorySlugs: filters.categorySlugs ?? [],
      timeFilters: filters.timeFilters ?? DEFAULT_TIME_FILTERS,
    }));

    // Update local filters when prop changes
    React.useEffect(() => {
      setLocalFilters({
        difficulty: filters.difficulty,
        categorySlugs: filters.categorySlugs ?? [],
        timeFilters: filters.timeFilters ?? DEFAULT_TIME_FILTERS,
      });
    }, [filters]);

    const handleDismiss = useCallback(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const handleClearAll = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocalFilters({
        difficulty: undefined,
        categorySlugs: [],
        timeFilters: DEFAULT_TIME_FILTERS,
      });
    }, []);

    const handleApply = useCallback(() => {
      // Build the new filters object
      const newFilters: SearchFilters = {
        difficulty: localFilters.difficulty,
      };

      // Only include categorySlugs if there are selections
      if (localFilters.categorySlugs.length > 0) {
        newFilters.categorySlugs = localFilters.categorySlugs;
      }

      // Only include timeFilters if at least one is enabled
      const hasEnabledTimeFilter =
        localFilters.timeFilters.prep?.enabled ||
        localFilters.timeFilters.cook?.enabled ||
        localFilters.timeFilters.rest?.enabled;

      if (hasEnabledTimeFilter) {
        newFilters.timeFilters = localFilters.timeFilters;
      }

      onApplyFilters(newFilters);
      handleDismiss();
    }, [localFilters, onApplyFilters, handleDismiss]);

    // Time filter handlers
    const handleTimeToggle = useCallback((type: "prep" | "cook" | "rest") => {
      setLocalFilters((prev) => ({
        ...prev,
        timeFilters: {
          ...prev.timeFilters,
          [type]: {
            ...prev.timeFilters[type],
            enabled: !prev.timeFilters[type]?.enabled,
          },
        },
      }));
    }, []);

    const handleTimeMaxChange = useCallback((type: "prep" | "cook" | "rest", minutes: number) => {
      setLocalFilters((prev) => ({
        ...prev,
        timeFilters: {
          ...prev.timeFilters,
          [type]: {
            ...prev.timeFilters[type],
            maxMinutes: minutes,
          },
        },
      }));
    }, []);

    // Category toggle handler
    const handleCategoryToggle = useCallback((slug: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocalFilters((prev) => ({
        ...prev,
        categorySlugs: prev.categorySlugs.includes(slug)
          ? prev.categorySlugs.filter((s) => s !== slug)
          : [...prev.categorySlugs, slug],
      }));
    }, []);

    // Compute total time limit for display
    const computedTotalTime = useMemo(() => {
      const { prep, cook, rest } = localFilters.timeFilters;
      let total = 0;
      if (prep?.enabled) total += prep.maxMinutes;
      if (cook?.enabled) total += cook.maxMinutes;
      if (rest?.enabled) total += rest.maxMinutes;
      return total;
    }, [localFilters.timeFilters]);

    const hasAnyTimeFilter =
      localFilters.timeFilters.prep?.enabled ||
      localFilters.timeFilters.cook?.enabled ||
      localFilters.timeFilters.rest?.enabled;

    const difficultyOptions: DifficultyFilter[] = ["easy", "medium", "hard"];
    const snapPoints = React.useMemo(() => ["90%"], []);

    return (
      <PremiumBottomSheet
        ref={ref}
        snapPoints={snapPoints}
        title={t("search.filters.title")}
        subtitle={t("search.filters.subtitle")}
        onClose={handleDismiss}
        scrollable
        contentStyle={{ paddingHorizontal: 20, paddingBottom: bottom + 100 }}
      >
        {/* Cooking Time Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <ClockIcon size={18} color="#8a8177" weight="duotone" />
            <Text className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary">
              {t("search.filters.cookingTime")}
            </Text>
          </View>

          {/* Time Filter Rows */}
          <TimeFilterRow
            label={t("search.filters.prepTime")}
            icon={TimerIcon}
            enabled={localFilters.timeFilters.prep?.enabled ?? false}
            maxMinutes={localFilters.timeFilters.prep?.maxMinutes ?? 30}
            onToggle={() => handleTimeToggle("prep")}
            onMaxMinutesChange={(mins) => handleTimeMaxChange("prep", mins)}
          />

          <TimeFilterRow
            label={t("search.filters.cookTime")}
            icon={FlameIcon}
            enabled={localFilters.timeFilters.cook?.enabled ?? false}
            maxMinutes={localFilters.timeFilters.cook?.maxMinutes ?? 60}
            onToggle={() => handleTimeToggle("cook")}
            onMaxMinutesChange={(mins) => handleTimeMaxChange("cook", mins)}
          />

          <TimeFilterRow
            label={t("search.filters.restTime")}
            icon={MoonIcon}
            enabled={localFilters.timeFilters.rest?.enabled ?? false}
            maxMinutes={localFilters.timeFilters.rest?.maxMinutes ?? 30}
            onToggle={() => handleTimeToggle("rest")}
            onMaxMinutesChange={(mins) => handleTimeMaxChange("rest", mins)}
          />

          {/* Total Time Display */}
          {hasAnyTimeFilter && (
            <View className="mt-2 px-4 py-3 bg-primary/10 rounded-xl">
              <Text className="text-sm font-semibold text-primary text-center">
                {t("search.filters.totalLimit")}: {formatDuration(computedTotalTime, { t })}
              </Text>
            </View>
          )}
        </View>

        {/* Difficulty Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <ChartBarIcon size={18} color="#8a8177" weight="duotone" />
            <Text className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary">
              {t("search.filters.difficulty")}
            </Text>
          </View>
          <View className="flex-row gap-3">
            {difficultyOptions.map((difficulty) => {
              const isSelected = localFilters.difficulty === difficulty;
              return (
                <ShadowItem
                  key={difficulty}
                  variant={isSelected ? "primary" : "default"}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLocalFilters((prev) => ({
                      ...prev,
                      difficulty: prev.difficulty === difficulty ? undefined : difficulty,
                    }));
                  }}
                  className="flex-1 py-4"
                >
                  <Text
                    className={`text-center font-medium capitalize ${
                      isSelected ? "text-white" : "text-foreground-heading"
                    }`}
                  >
                    {t(`recipe.difficulty.${difficulty}`)}
                  </Text>
                </ShadowItem>
              );
            })}
          </View>
        </View>

        {/* Category Section - Wrapped Multi-Select */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <ForkKnifeIcon size={18} color="#8a8177" weight="duotone" />
            <Text className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary">
              {t("search.filters.category")}
            </Text>
            {localFilters.categorySlugs.length > 0 && (
              <View className="bg-primary/20 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-semibold text-primary">
                  {localFilters.categorySlugs.length}
                </Text>
              </View>
            )}
          </View>

          {/* Wrapped Category Chips */}
          <View className="flex-row flex-wrap gap-2">
            {categories?.map((category) => {
              const isSelected = localFilters.categorySlugs.includes(category.slug);
              return (
                <Pressable key={category.id} onPress={() => handleCategoryToggle(category.slug)}>
                  <ShadowItem
                    className={cn(
                      "flex-row items-center gap-2 px-4 py-2.5 rounded-full",
                      isSelected && "border-primary bg-primary/10"
                    )}
                  >
                    <CategoryIcon
                      slug={category.slug}
                      size={16}
                      color={isSelected ? "#334d43" : "#8a8177"}
                      weight={isSelected ? "fill" : "bold"}
                    />
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        isSelected ? "text-primary" : "text-foreground-secondary"
                      )}
                    >
                      {t(`categories.${category.slug}` as any)}
                    </Text>
                  </ShadowItem>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom Action Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-2 bg-surface/95"
          style={{ paddingBottom: bottom + 12 }}
        >
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ActionButton
                title={t("search.filters.clearAll")}
                variant="secondary"
                onPress={handleClearAll}
              />
            </View>
            <View className="flex-[2]">
              <ActionButton
                title={t("search.filters.apply")}
                variant="primary"
                onPress={handleApply}
              />
            </View>
          </View>
        </View>
      </PremiumBottomSheet>
    );
  }
);
