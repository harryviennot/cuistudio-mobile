import { useState, useCallback, useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services";
import type { Recipe } from "@/types/recipe";
import type { SearchFilters, SearchSort } from "@/types/search";

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SearchSort;
}

const PAGE_SIZE = 20;

export function useSearch(options: UseSearchOptions = {}) {
  // State management
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters ?? {});
  const [sort, setSort] = useState<SearchSort>(options.initialSort ?? { sortBy: "relevance" });

  const hasQuery = query.trim().length > 0;

  // Stabilize queryKey by extracting primitive values
  const stableFilterKey = useMemo(() => {
    return JSON.stringify({
      difficulty: filters.difficulty,
      categorySlugs: filters.categorySlugs,
      prepEnabled: filters.timeFilters?.prep?.enabled,
      prepMax: filters.timeFilters?.prep?.maxMinutes,
      cookEnabled: filters.timeFilters?.cook?.enabled,
      cookMax: filters.timeFilters?.cook?.maxMinutes,
      restEnabled: filters.timeFilters?.rest?.enabled,
      restMax: filters.timeFilters?.rest?.maxMinutes,
    });
  }, [filters]);

  const stableSortKey = sort.sortBy;

  // Library search query (user's own recipes)
  const libraryQuery = useQuery<Recipe[], Error>({
    queryKey: ["search", "library", query, stableFilterKey, stableSortKey],
    queryFn: () =>
      recipeService.searchRecipesFiltered(query, {
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
        sortBy: sort.sortBy === "cook_count" ? "cook_count" : sort.sortBy,
        libraryOnly: true,
        limit: PAGE_SIZE,
      }),
    enabled: hasQuery,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Public search query with infinite scroll (popular recipes)
  const publicQuery = useInfiniteQuery<Recipe[], Error>({
    queryKey: ["search", "public", query, stableFilterKey, stableSortKey],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      return recipeService.searchRecipesFiltered(query, {
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
        sortBy: sort.sortBy === "cook_count" ? "rating" : sort.sortBy, // Use rating instead of cook_count for public
        libraryOnly: false,
        limit: PAGE_SIZE,
        offset,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    enabled: hasQuery,
    staleTime: 2 * 60 * 1000,
  });

  // Update functions
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateSort = useCallback((newSort: Partial<SearchSort>) => {
    setSort((prev) => ({ ...prev, ...newSort }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setFilters({});
    setSort({ sortBy: "relevance" });
  }, []);

  // Derived state - check for any active filters (new or legacy)
  const hasActiveFilters = useMemo(() => {
    const hasTimeFilters =
      filters.timeFilters?.prep?.enabled ||
      filters.timeFilters?.cook?.enabled ||
      filters.timeFilters?.rest?.enabled;

    const hasCategories =
      (filters.categorySlugs && filters.categorySlugs.length > 0) || !!filters.categorySlug;

    return !!(filters.difficulty || hasCategories || hasTimeFilters || filters.timeFilter);
  }, [filters]);

  const isSearching = libraryQuery.isLoading || publicQuery.isLoading;
  const hasSearched = libraryQuery.isFetched || publicQuery.isFetched;
  const hasError = libraryQuery.isError || publicQuery.isError;

  // Flatten paginated public results
  const publicResults = useMemo(() => {
    return publicQuery.data?.pages.flat() ?? [];
  }, [publicQuery.data]);

  return {
    // Query state
    query,
    setQuery,
    hasQuery,

    // Filter state
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,

    // Sort state
    sort,
    updateSort,

    // Results
    libraryResults: libraryQuery.data ?? [],
    publicResults,

    // Loading states
    isSearchingLibrary: libraryQuery.isLoading,
    isSearchingPublic: publicQuery.isLoading,
    isSearching,
    hasSearched,
    hasError,
    error: libraryQuery.error || publicQuery.error,

    // Pagination for public results
    fetchNextPublicPage: publicQuery.fetchNextPage,
    hasNextPublicPage: publicQuery.hasNextPage,
    isFetchingNextPublicPage: publicQuery.isFetchingNextPage,

    // Actions
    clearSearch,
    refetch: () => {
      libraryQuery.refetch();
      publicQuery.refetch();
    },
  };
}
