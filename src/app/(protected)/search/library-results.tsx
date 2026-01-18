/**
 * Library Search Results "See All" Screen
 *
 * Displays paginated library search results when user taps "See All"
 * on the library section in the search screen.
 */
import React, { useMemo, useCallback } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MagnifyingGlass, WarningCircle } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { useSharedValue, useAnimatedScrollHandler, useDerivedValue } from "react-native-reanimated";
import { useInfiniteQuery } from "@tanstack/react-query";

import { MasonryGrid } from "@/components/home/MasonryGrid";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { UnifiedStickyHeader } from "@/components/ui/UnifiedStickyHeader";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { recipeService } from "@/api/services";
import type { Recipe } from "@/types/recipe";
import type { SearchFilters } from "@/types/search";

const PAGE_SIZE = 20;

export default function LibraryResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Parse URL parameters from search screen navigation
  const {
    query,
    filters: filtersParam,
    sortBy,
  } = useLocalSearchParams<{
    query: string;
    filters: string;
    sortBy: string;
  }>();

  // Parse filters from JSON string
  const filters = useMemo<SearchFilters>(() => {
    try {
      return filtersParam ? JSON.parse(filtersParam) : {};
    } catch {
      return {};
    }
  }, [filtersParam]);

  const headerTopPadding = insets.top + 60;

  // Scroll handler for sticky header
  const scrollY = useSharedValue(-headerTopPadding);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const adjustedScrollY = useDerivedValue(() => {
    return scrollY.value + headerTopPadding;
  });

  // Infinite query for library search results
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<Recipe[], Error>({
    queryKey: ["search", "library-results", query, JSON.stringify(filters), sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam as number;
      return recipeService.searchRecipesFiltered(query || "", {
        difficulty: filters.difficulty,
        categorySlugs: filters.categorySlugs,
        maxPrepTime: filters.timeFilters?.prep?.enabled
          ? filters.timeFilters.prep.maxMinutes
          : undefined,
        maxCookTime: filters.timeFilters?.cook?.enabled
          ? filters.timeFilters.cook.maxMinutes
          : undefined,
        maxRestTime: filters.timeFilters?.rest?.enabled
          ? filters.timeFilters.rest.maxMinutes
          : undefined,
        sortBy: sortBy as "relevance" | "recent" | "rating" | "cook_count" | "time" | undefined,
        libraryOnly: true,
        limit: PAGE_SIZE,
        offset,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    enabled: !!query,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Flatten pages
  const recipes = data?.pages.flat() ?? [];

  // Handlers
  const handleBack = useCallback(() => router.back(), [router]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Navigate to recipe detail within search stack
  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push({
        pathname: "/search/[id]",
        params: {
          id: recipe.id,
          title: recipe.title,
          ...(recipe.image_url && { imageUrl: recipe.image_url }),
        },
      });
    },
    [router]
  );

  const renderRecipeCard = useCallback(
    (recipe: Recipe, index: number) => {
      return <RecipeCard recipe={recipe} index={index} onPress={() => handleRecipePress(recipe)} />;
    },
    [handleRecipePress]
  );

  const title = t("search.libraryResults.title", "Library Results");
  const subtitle = t("search.libraryResults.subtitle", 'Results for "{{query}}"', { query });

  const ListHeaderComponent = useMemo(
    () => <PageHeader subtitle={subtitle} title={title} topPadding={0} />,
    [subtitle, title]
  );

  // Loading state
  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-surface"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#334d43" />
        <Text className="mt-4 text-foreground-secondary">{t("common.loading")}</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View
        className="flex-1 items-center justify-center bg-surface p-6 gap-4"
        style={{ paddingTop: insets.top }}
      >
        <UnifiedStickyHeader title={title} scrollY={adjustedScrollY} onBackPress={handleBack} />
        <WarningCircle size={64} color="#ef4444" weight="duotone" />
        <Text className="text-xl font-playfair-bold text-foreground-heading text-center">
          {t("search.libraryResults.error.title", "Something went wrong")}
        </Text>
        <Text className="text-foreground-secondary text-center">
          {error?.message ||
            t("search.libraryResults.error.message", "Failed to load library results.")}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-primary rounded-lg px-6 py-3 active:opacity-80"
        >
          <Text className="text-white font-semibold">{t("common.tryAgain")}</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (recipes.length === 0) {
    return (
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <UnifiedStickyHeader title={title} scrollY={adjustedScrollY} onBackPress={handleBack} />
        <View className="flex-1 items-center justify-center p-6">
          <EmptyState
            icon={MagnifyingGlass}
            title={t("search.libraryResults.empty.title", "No recipes found")}
            message={t(
              "search.libraryResults.empty.message",
              "No recipes in your library match this search."
            )}
            ctaLabel={t("common.goBack", "Go back")}
            onCtaPress={handleBack}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <MasonryGrid
        recipes={recipes}
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        onEndReached={handleEndReached}
        showLoadingFooter={isFetchingNextPage}
        ListHeaderComponent={ListHeaderComponent}
        renderRecipeCard={renderRecipeCard}
        onScroll={scrollHandler}
        contentInset={{ top: headerTopPadding }}
        contentOffset={{ x: 0, y: -headerTopPadding }}
        scrollIndicatorInsets={{ top: headerTopPadding }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      />

      <UnifiedStickyHeader title={title} scrollY={adjustedScrollY} onBackPress={handleBack} />
    </View>
  );
}
