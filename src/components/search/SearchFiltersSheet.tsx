/**
 * SearchFiltersSheet - Bottom sheet for selecting search filters
 *
 * Allows users to filter by:
 * - Cooking Time (Quick/Medium/Long)
 * - Difficulty (Easy/Medium/Hard)
 * - Category (from categories list)
 */
import React, { forwardRef } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Clock, ChartBar, ForkKnife } from "phosphor-react-native";
import type { SearchFilters, TimeFilter, DifficultyFilter } from "@/types/search";
import { useCategories } from "@/hooks/useCategories";
import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import { ActionButton } from "@/components/ui/ActionButton";
import { ScrollView } from "react-native-gesture-handler";

interface SearchFiltersSheetProps {
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
}

export const SearchFiltersSheet = forwardRef<BottomSheetModal, SearchFiltersSheetProps>(
  function SearchFiltersSheet({ filters, onApplyFilters }, ref) {
    const { t } = useTranslation();
    const { bottom } = useSafeAreaInsets();
    const { data: categories } = useCategories();

    // Local state for filters (apply on submit)
    const [localFilters, setLocalFilters] = React.useState<SearchFilters>(filters);

    // Update local filters when prop changes
    React.useEffect(() => {
      setLocalFilters(filters);
    }, [filters]);

    const handleDismiss = () => {
      if (ref && "current" in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleClearAll = () => {
      setLocalFilters({});
    };

    const handleApply = () => {
      onApplyFilters(localFilters);
      handleDismiss();
    };

    const timeFilterOptions: TimeFilter[] = ["quick", "medium", "long"];
    const difficultyOptions: DifficultyFilter[] = ["easy", "medium", "hard"];

    return (
      <PremiumBottomSheet
        ref={ref}
        snapPoints={["70%"]}
        title={t("search.filters.title")}
        subtitle={t("search.filters.subtitle")}
        onClose={handleDismiss}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottom + 80 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cooking Time Section */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Clock size={20} color="#334d43" weight="duotone" />
              <Text className="text-base font-semibold text-foreground">
                {t("search.filters.cookingTime")}
              </Text>
            </View>
            <View className="flex-row gap-2">
              {timeFilterOptions.map((time) => (
                <Pressable
                  key={time}
                  onPress={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      timeFilter: prev.timeFilter === time ? undefined : time,
                    }))
                  }
                  className={`flex-1 px-4 py-3 rounded-2xl border ${
                    localFilters.timeFilter === time
                      ? "bg-primary/5 border-primary/20"
                      : "bg-transparent border-transparent active:bg-surface-elevated"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      localFilters.timeFilter === time ? "text-primary-dark" : "text-foreground-heading"
                    }`}
                  >
                    {t(`search.filters.time.${time}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Difficulty Section */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <ChartBar size={20} color="#334d43" weight="duotone" />
              <Text className="text-base font-semibold text-foreground">
                {t("search.filters.difficulty")}
              </Text>
            </View>
            <View className="flex-row gap-2">
              {difficultyOptions.map((difficulty) => (
                <Pressable
                  key={difficulty}
                  onPress={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      difficulty: prev.difficulty === difficulty ? undefined : difficulty,
                    }))
                  }
                  className={`flex-1 px-4 py-3 rounded-2xl border ${
                    localFilters.difficulty === difficulty
                      ? "bg-primary/5 border-primary/20"
                      : "bg-transparent border-transparent active:bg-surface-elevated"
                  }`}
                >
                  <Text
                    className={`text-center font-medium capitalize ${
                      localFilters.difficulty === difficulty ? "text-primary-dark" : "text-foreground-heading"
                    }`}
                  >
                    {t(`recipe.difficulty.${difficulty}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category Section */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <ForkKnife size={20} color="#334d43" weight="duotone" />
              <Text className="text-base font-semibold text-foreground">
                {t("search.filters.category")}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 24 }}
            >
              {/* All Categories Option */}
              <Pressable
                onPress={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    categorySlug: undefined,
                  }))
                }
                className={`px-4 py-3 rounded-2xl border ${
                  !localFilters.categorySlug
                    ? "bg-primary/5 border-primary/20"
                    : "bg-transparent border-transparent active:bg-surface-elevated"
                }`}
              >
                <Text
                  className={`font-medium ${
                    !localFilters.categorySlug ? "text-primary-dark" : "text-foreground-heading"
                  }`}
                >
                  {t("common.all")}
                </Text>
              </Pressable>

              {/* Category Options */}
              {categories?.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      categorySlug:
                        prev.categorySlug === category.slug ? undefined : category.slug,
                    }))
                  }
                  className={`px-4 py-3 rounded-2xl border ${
                    localFilters.categorySlug === category.slug
                      ? "bg-primary/5 border-primary/20"
                      : "bg-transparent border-transparent active:bg-surface-elevated"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      localFilters.categorySlug === category.slug
                        ? "text-primary-dark"
                        : "text-foreground-heading"
                    }`}
                  >
                    {t(`categories.${category.slug}`)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </BottomSheetScrollView>

        {/* Bottom Action Bar */}
        <View
          className="border-t border-border bg-surface px-6 py-3 flex-row gap-3"
          style={{ paddingBottom: bottom + 12 }}
        >
          <View className="flex-1">
            <ActionButton
              title={t("search.filters.clearAll")}
              variant="secondary"
              onPress={handleClearAll}
            />
          </View>

          <View className="flex-1">
            <ActionButton
              title={t("search.filters.apply")}
              variant="primary"
              onPress={handleApply}
            />
          </View>
        </View>
      </PremiumBottomSheet>
    );
  }
);
