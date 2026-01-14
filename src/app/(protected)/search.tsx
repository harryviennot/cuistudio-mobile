import { View, Text, Pressable, Animated, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { MagnifyingGlass, X, Funnel, SortAscending } from "phosphor-react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/home/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { useSearchContext } from "@/contexts/SearchContext";
import { SearchResultSection } from "@/components/search/SearchResultSection";
import { SearchFiltersSheet } from "@/components/search/SearchFiltersSheet";
import { SearchSortSheet } from "@/components/search/SearchSortSheet";
import { ScrollView } from "react-native-gesture-handler";

export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    searchQuery: contextQuery,
    setSearchQuery: setContextQuery,
    clearSearch: clearContextSearch,
  } = useSearchContext();

  const [localQuery, setLocalQuery] = useState(contextQuery);

  // Bottom sheet refs
  const filtersSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);

  // Use new search hook
  const {
    query,
    setQuery,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    sort,
    updateSort,
    libraryResults,
    publicResults,
    isSearchingLibrary,
    isSearchingPublic,
    hasSearched,
    error,
    clearSearch,
  } = useSearch({ initialQuery: contextQuery });

  // Background overlay opacity for modal effect
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  // Animate background overlay on mount
  useEffect(() => {
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [backgroundOpacity]);

  // Auto-search when query changes from context
  useEffect(() => {
    if (contextQuery && contextQuery !== query) {
      setQuery(contextQuery);
      setLocalQuery(contextQuery);
    }
  }, [contextQuery, query, setQuery]);

  const handleClose = useCallback(() => {
    // Animate out before closing
    Animated.timing(backgroundOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      clearSearch();
      clearContextSearch();
      router.back();
    });
  }, [clearSearch, clearContextSearch, backgroundOpacity]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setContextQuery(q);
    },
    [setQuery, setContextQuery]
  );

  const handleSeeAllLibrary = () => {
    router.push({
      pathname: "/search/library-results" as any,
      params: {
        query,
        filters: JSON.stringify(filters),
        sortBy: sort.sortBy,
      },
    });
  };

  // Handle scroll events for keyboard dismiss
  const handleScroll = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Empty state component
  const EmptyComponent = (
    <View className="flex-1 items-center justify-center p-6 gap-4" style={{ minHeight: 400 }}>
      <MagnifyingGlass size={64} color="#8b7a66" weight="duotone" />
      <Text className="text-xl font-playfair-bold text-foreground-heading text-center">
        {t("search.initial.title")}
      </Text>
      <Text className="text-foreground-secondary text-center">
        {t("search.initial.description")}
      </Text>
    </View>
  );

  return (
    <Animated.View
      className="flex-1 bg-surface"
      style={{
        paddingTop: insets.top,
        opacity: backgroundOpacity,
      }}
    >
      {/* Header with Search Bar, Close Button, Filter & Sort */}
      <View
        className="bg-surface border-b border-border"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View className="flex-row items-center gap-3">
          {/* Close Button (X) */}
          <Pressable
            onPress={handleClose}
            className="p-2 rounded-full active:bg-surface-elevated"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={24} color="#334d43" weight="bold" />
          </Pressable>

          {/* Search Bar - takes most space */}
          <View className="flex-1">
            <SearchBar
              value={localQuery}
              onChangeText={setLocalQuery}
              onSearch={handleSearch}
              placeholder={t("search.placeholder", "Search recipes...")}
              autoFocus
            />
          </View>

          {/* Filters Button */}
          <Pressable
            onPress={() => filtersSheetRef.current?.present()}
            className="p-2 rounded-full active:bg-surface-elevated relative"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Funnel size={24} color="#334d43" weight="bold" />
            {Object.values(filters).filter(Boolean).length > 0 && (
              <View className="absolute -top-1 -right-1 bg-primary rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-[10px] font-bold text-white">
                  {Object.values(filters).filter(Boolean).length}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Sort Button */}
          <Pressable
            onPress={() => sortSheetRef.current?.present()}
            className="p-2 rounded-full active:bg-surface-elevated relative"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SortAscending size={24} color="#334d43" weight="bold" />
            {sort.sortBy !== "relevance" && (
              <View className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Pressable>
        </View>

        {/* Active Filters Chips - Only show when has active filters */}
        {hasSearched && (hasActiveFilters || sort.sortBy !== "relevance") && (
          <View className="mt-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
            >
              {/* Difficulty Filter Chip */}
              {filters.difficulty && (
                <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Text className="text-sm font-medium text-foreground capitalize">
                    {t(`recipe.difficulty.${filters.difficulty}`)}
                  </Text>
                  <Pressable
                    onPress={() => updateFilters({ difficulty: undefined })}
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
                    {t(`search.filters.time.${filters.timeFilter}`)}
                  </Text>
                  <Pressable
                    onPress={() => updateFilters({ timeFilter: undefined })}
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
                    {filters.categorySlug}
                  </Text>
                  <Pressable
                    onPress={() => updateFilters({ categorySlug: undefined })}
                    className="active:opacity-70"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#334d43" weight="bold" />
                  </Pressable>
                </View>
              )}

              {/* Sort Chip */}
              {sort.sortBy !== "relevance" && (
                <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-blue-50 border border-blue-200">
                  <SortAscending size={16} color="#334d43" />
                  <Text className="text-sm font-medium text-foreground">
                    {t(`search.sort.${sort.sortBy}`)}
                  </Text>
                  <Pressable
                    onPress={() => updateSort({ sortBy: "relevance" })}
                    className="active:opacity-70"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#334d43" weight="bold" />
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Search Results - Grouped Sections */}
      {!hasSearched ? (
        // Initial Empty State
        EmptyComponent
      ) : (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Library Section */}
          <SearchResultSection
            title={t("search.sections.library")}
            recipes={libraryResults}
            isLoading={isSearchingLibrary}
            onSeeAll={libraryResults.length > 0 ? handleSeeAllLibrary : undefined}
            seeAllText={t("common.seeAll")}
            emptyText={t("search.empty.library")}
          />

          {/* Popular Recipes Section */}
          <SearchResultSection
            title={t("search.sections.popular")}
            recipes={publicResults}
            isLoading={isSearchingPublic}
            emptyText={t("search.empty.popular")}
          />

          {/* Both Sections Empty */}
          {!isSearchingLibrary &&
            !isSearchingPublic &&
            libraryResults.length === 0 &&
            publicResults.length === 0 && (
              <View className="flex-1 items-center justify-center p-6 gap-4 mt-12">
                <MagnifyingGlass size={64} color="#8b7a66" weight="duotone" />
                <Text className="text-xl font-playfair-bold text-foreground-heading text-center">
                  {t("search.empty.title")}
                </Text>
                <Text className="text-foreground-secondary text-center">
                  {t("search.empty.description")}
                </Text>
              </View>
            )}

          {/* Error State */}
          {error && (
            <View className="flex-1 items-center justify-center p-6 gap-4">
              <Text className="text-xl font-playfair-bold text-foreground-heading text-center">
                {t("search.error.title")}
              </Text>
              <Text className="text-foreground-secondary text-center">
                {error.message || t("search.error.description")}
              </Text>
              <Pressable
                onPress={() => handleSearch(query)}
                className="bg-primary rounded-lg px-6 py-3 active:opacity-80"
              >
                <Text className="text-white font-semibold">{t("common.tryAgain")}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Bottom Sheet */}
      <SearchFiltersSheet
        ref={filtersSheetRef}
        filters={filters}
        onApplyFilters={(newFilters) => {
          updateFilters(newFilters);
        }}
      />

      {/* Sort Bottom Sheet */}
      <SearchSortSheet
        ref={sortSheetRef}
        currentSort={sort.sortBy}
        onSelectSort={(sortBy) => {
          updateSort({ sortBy });
        }}
      />
    </Animated.View>
  );
}
