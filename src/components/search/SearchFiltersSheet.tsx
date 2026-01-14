/**
 * SearchFiltersSheet - Bottom sheet for selecting search filters
 *
 * Allows users to filter by:
 * - Cooking Time (Quick/Medium/Long)
 * - Difficulty (Easy/Medium/Hard)
 * - Category (from categories list)
 */
import React, { forwardRef } from "react";
import { View, Text, ScrollView } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Clock, ChartBar, ForkKnife, Trash, Check } from "phosphor-react-native";
import type { SearchFilters, TimeFilter, DifficultyFilter } from "@/types/search";
import { useCategories } from "@/hooks/useCategories";
import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import { ShadowItem } from "@/components/ShadowedSection";

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

    const snapPoints = React.useMemo(() => ["85%"], []);

    return (
      <PremiumBottomSheet
        ref={ref}
        snapPoints={snapPoints}
        title={t("search.filters.title")}
        subtitle={t("search.filters.subtitle")}
        onClose={handleDismiss}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cooking Time Section */}
          {/* Cooking Time Section */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <Clock size={22} color="#334d43" weight="duotone" />
              <Text className="text-xl text-foreground font-playfair-bold">
                {t("search.filters.cookingTime")}
              </Text>
            </View>
            <View className="flex-row gap-3">
              {timeFilterOptions.map((time) => {
                const isSelected = localFilters.timeFilter === time;
                return (
                  <ShadowItem
                    key={time}
                    variant={isSelected ? "primary" : "default"}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        timeFilter: prev.timeFilter === time ? undefined : time,
                      }))
                    }
                    className="flex-1 py-4"
                  >
                    <Text
                      className={`text-center font-medium capitalize ${isSelected ? "text-white" : "text-foreground-heading"
                        }`}
                    >
                      {t(`search.filters.time.${time}`)}
                    </Text>
                  </ShadowItem>
                );
              })}
            </View>
          </View>

          {/* Difficulty Section */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <ChartBar size={22} color="#334d43" weight="duotone" />
              <Text className="text-xl text-foreground font-playfair-bold">
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
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        difficulty: prev.difficulty === difficulty ? undefined : difficulty,
                      }))
                    }
                    className="flex-1 py-4"
                  >
                    <Text
                      className={`text-center font-medium capitalize ${isSelected ? "text-white" : "text-foreground-heading"
                        }`}
                    >
                      {t(`recipe.difficulty.${difficulty}`)}
                    </Text>
                  </ShadowItem>
                );
              })}
            </View>
          </View>

          {/* Category Section */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <ForkKnife size={22} color="#334d43" weight="duotone" />
              <Text className="text-xl text-foreground font-playfair-bold">
                {t("search.filters.category")}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 4 }}
              className="-mx-6 px-6" // Bleed out to edges
            >
              {/* All Categories Option */}
              <ShadowItem
                variant={!localFilters.categorySlug ? "primary" : "default"}
                onPress={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    categorySlug: undefined,
                  }))
                }
                className="px-6 py-3 min-w-[80px]"
              >
                <Text
                  className={`font-medium ${!localFilters.categorySlug ? "text-white" : "text-foreground-heading"
                    }`}
                >
                  {t("common.all")}
                </Text>
              </ShadowItem>

              {/* Category Options */}
              {categories?.map((category) => {
                const isSelected = localFilters.categorySlug === category.slug;
                return (
                  <ShadowItem
                    key={category.id}
                    variant={isSelected ? "primary" : "default"}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        categorySlug:
                          prev.categorySlug === category.slug ? undefined : category.slug,
                      }))
                    }
                    className="px-6 py-3"
                  >
                    <Text
                      className={`font-medium ${isSelected ? "text-white" : "text-foreground-heading"
                        }`}
                    >
                      {t(`categories.${category.slug}`)}
                    </Text>
                  </ShadowItem>
                );
              })}
            </ScrollView>
          </View>
        </BottomSheetScrollView>

        {/* Bottom Action Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-surface/90"
          style={{ paddingBottom: bottom + 12 }}
        >
          <View className="flex-row gap-4">
            <ShadowItem
              onPress={handleClearAll}
              className="flex-1 py-4 bg-white border-border-dark flex-row items-center justify-center gap-2"
            >
              <Trash size={18} color="#57534e" />
              <Text className="text-base font-semibold text-foreground-heading">
                {t("search.filters.clearAll")}
              </Text>
            </ShadowItem>

            <ShadowItem
              variant="primary"
              onPress={handleApply}
              className="flex-[2] py-4 flex-row items-center justify-center gap-2"
            >
              <Check size={18} color="white" weight="bold" />
              <Text className="text-base font-semibold text-white">
                {t("search.filters.apply")}
              </Text>
            </ShadowItem>
          </View>
        </View>
      </PremiumBottomSheet>
    );
  }
);
