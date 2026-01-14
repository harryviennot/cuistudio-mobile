/**
 * SearchSortSheet - Bottom sheet for selecting sort order
 *
 * Allows users to sort by:
 * - Relevance (default)
 * - Recently Added
 * - Highest Rated
 * - Most Cooked (library only)
 * - Quickest to Make
 */
import React, { forwardRef } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import {
  MagnifyingGlass,
  CalendarPlus,
  Star,
  Fire,
  Clock,
  CheckCircle,
} from "phosphor-react-native";
import type { SortOption } from "@/types/search";
import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";

interface SearchSortSheetProps {
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  isLibrarySection?: boolean;
}

export const SearchSortSheet = forwardRef<BottomSheetModal, SearchSortSheetProps>(
  function SearchSortSheet({ currentSort, onSelectSort, isLibrarySection = false }, ref) {
    const { t } = useTranslation();

    const handleDismiss = () => {
      if (ref && "current" in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleSelectSort = (sort: SortOption) => {
      onSelectSort(sort);
      handleDismiss();
    };

    const sortOptions: Array<{
      value: SortOption;
      icon: typeof MagnifyingGlass;
      libraryOnly?: boolean;
    }> = [
      { value: "relevance", icon: MagnifyingGlass },
      { value: "recent", icon: CalendarPlus },
      { value: "rating", icon: Star },
      { value: "cook_count", icon: Fire, libraryOnly: true },
      { value: "time", icon: Clock },
    ];

    // Filter options based on context
    const availableOptions = isLibrarySection
      ? sortOptions
      : sortOptions.filter((opt) => !opt.libraryOnly);

    return (
      <PremiumBottomSheet
        ref={ref}
        title={t("search.sort.title")}
        subtitle={t("search.sort.subtitle")}
        onClose={handleDismiss}
      >
        <View className="px-6 pb-8">
          {availableOptions.map(({ value, icon: Icon }) => {
            const isSelected = currentSort === value;

            return (
              <Pressable
                key={value}
                onPress={() => handleSelectSort(value)}
                className={`flex-row items-center py-4 px-5 rounded-2xl mb-3 border ${
                  isSelected
                    ? "bg-primary/5 border-primary/20"
                    : "bg-transparent border-transparent active:bg-surface-elevated"
                }`}
              >
                <Icon
                  size={24}
                  color={isSelected ? "#334d43" : "#6b7280"}
                  weight={isSelected ? "fill" : "regular"}
                />
                <Text
                  className={`flex-1 ml-3 text-lg font-medium ${
                    isSelected ? "text-primary-dark" : "text-foreground-heading"
                  }`}
                >
                  {t(`search.sort.${value}`)}
                </Text>
                {isSelected && (
                  <View className="bg-primary rounded-full p-1">
                    <CheckCircle size={14} color="#fff" weight="fill" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </PremiumBottomSheet>
    );
  }
);
