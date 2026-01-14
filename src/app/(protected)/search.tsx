import { View, Text, Pressable, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Faders } from "phosphor-react-native";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { SearchBar } from "@/components/home/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { useSearchContext } from "@/contexts/SearchContext";
import { SearchResultSection } from "@/components/search/SearchResultSection";
import { SearchFiltersSheet } from "@/components/search/SearchFiltersSheet";
import { SearchSortSheet } from "@/components/search/SearchSortSheet";
import { SearchStartView } from "@/components/search/SearchStartView";
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
    // error,
    clearSearch,
  } = useSearch({ initialQuery: contextQuery });

  // Auto-search when query changes from context
  useEffect(() => {
    if (contextQuery && contextQuery !== query) {
      setQuery(contextQuery);
      setLocalQuery(contextQuery);
    }
  }, [contextQuery, query, setQuery]);

  const handleClose = useCallback(() => {
    clearSearch();
    clearContextSearch();
    router.back();
  }, [clearSearch, clearContextSearch]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setContextQuery(q);
    },
    [setQuery, setContextQuery]
  );

  const handleSelectCategory = (category: string) => {
    setQuery(category);
    setLocalQuery(category);
    // You might want to also set a filter instead of just searching the text
    // For now searching the text is fine, or:
    // updateFilters({ categorySlug: category });
  };

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

  const handleScroll = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Calculate header height for scroll padding
  const headerBaseHeight = insets.top + 8 + 40 + 12; // top padding + search row + bottom padding
  const hasFiltersRow = hasActiveFilters || sort.sortBy !== "relevance";
  const headerHeight = hasFiltersRow ? headerBaseHeight + 40 : headerBaseHeight; // +40 for filters row

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-surface">
        {/* Header Area - Floating with blur */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          {/* Blur Background */}
          <BlurView
            tint="light"
            intensity={90}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Color Overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(244, 241, 232, 0.2)",
            }}
          />

          {/* Header Content */}
          <View style={{ paddingTop: insets.top + 8, paddingBottom: 12 }} className="px-4">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={handleClose}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-elevated"
                hitSlop={10}
              >
                <X size={24} color="#334d43" weight="bold" />
              </Pressable>

              <View className="flex-1">
                <SearchBar
                  value={localQuery}
                  onChangeText={setLocalQuery}
                  onSearch={handleSearch}
                  placeholder={t("search.placeholder", "Search recipes...")}
                  autoFocus={!contextQuery}
                />
              </View>

              {/* Filter Button */}
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  filtersSheetRef.current?.present();
                }}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-elevated"
                hitSlop={10}
              >
                <Faders size={24} color="#334d43" weight="bold" />
              </Pressable>
            </View>

            {/* Active Filters Row */}
            {hasFiltersRow && (
              <View className="mt-3">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {/* Reset All */}
                  <Pressable
                    onPress={() => {
                      clearFilters();
                      updateSort({ sortBy: "relevance" });
                    }}
                    className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border"
                  >
                    <Text className="text-xs font-bold text-foreground-secondary">Reset</Text>
                  </Pressable>

                  {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <View
                        key={key}
                        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                      >
                        <Text className="text-xs font-bold text-primary capitalize">
                          {String(value)}
                        </Text>
                        <Pressable onPress={() => updateFilters({ [key]: undefined })}>
                          <X size={12} color="#334d43" weight="bold" />
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Main Content Area */}
        <View className="flex-1">
          {!hasSearched && !localQuery ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              className="flex-1"
            >
              <SearchStartView
                onSelectCategory={handleSelectCategory}
                onSelectTerm={(term) => {
                  setLocalQuery(term);
                  handleSearch(term);
                }}
                contentPaddingTop={headerHeight}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(300)} className="flex-1">
              <ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={16}
                className="flex-1"
                contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Results */}
                <SearchResultSection
                  title={t("search.sections.library")}
                  recipes={libraryResults}
                  isLoading={isSearchingLibrary}
                  onSeeAll={libraryResults.length > 0 ? handleSeeAllLibrary : undefined}
                />

                <SearchResultSection
                  title={t("search.sections.popular")}
                  recipes={publicResults}
                  isLoading={isSearchingPublic}
                />

                {/* Empty Search Results State */}
                {!isSearchingLibrary &&
                  !isSearchingPublic &&
                  libraryResults.length === 0 &&
                  publicResults.length === 0 && (
                    <View className="items-center justify-center py-20 px-6">
                      <Text className="text-lg font-playfair-bold text-foreground-heading text-center mb-2">
                        {t("search.empty.title", "No recipes found")}
                      </Text>
                      <Text className="text-foreground-secondary text-center">
                        {t(
                          "search.empty.description",
                          "Try searching for a different ingredient or category."
                        )}
                      </Text>
                    </View>
                  )}
              </ScrollView>
            </Animated.View>
          )}
        </View>

        <SearchFiltersSheet
          ref={filtersSheetRef}
          filters={filters}
          onApplyFilters={updateFilters}
        />

        <SearchSortSheet
          ref={sortSheetRef}
          currentSort={sort.sortBy}
          onSelectSort={(sortBy) => updateSort({ sortBy })}
        />
      </View>
    </BottomSheetModalProvider>
  );
}
