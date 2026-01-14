import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services";
import type { Recipe } from "@/types/recipe";
import type { SearchFilters, SearchSort, TimeFilter } from "@/types/search";
import { TIME_FILTER_RANGES } from "@/types/search";

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SearchSort;
}

export function useSearch(options: UseSearchOptions = {}) {
  // State management
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters ?? {});
  const [sort, setSort] = useState<SearchSort>(options.initialSort ?? { sortBy: "relevance" });

  const hasQuery = query.trim().length > 0;

  // Convert time filter to min/max values
  const timeRange = useMemo(() => {
    if (!filters.timeFilter) return {};
    return TIME_FILTER_RANGES[filters.timeFilter];
  }, [filters.timeFilter]);

  // Library search query (user's own recipes)
  const libraryQuery = useQuery<Recipe[], Error>({
    queryKey: ["search", "library", query, filters, sort],
    queryFn: () =>
      recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlug: filters.categorySlug,
        minTime: timeRange.min,
        maxTime: timeRange.max,
        sortBy: sort.sortBy === "cook_count" ? "cook_count" : sort.sortBy,
        libraryOnly: true,
        limit: 20,
      }),
    enabled: hasQuery,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Public search query (popular recipes)
  const publicQuery = useQuery<Recipe[], Error>({
    queryKey: ["search", "public", query, filters, sort],
    queryFn: () =>
      recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlug: filters.categorySlug,
        minTime: timeRange.min,
        maxTime: timeRange.max,
        sortBy: sort.sortBy === "cook_count" ? "rating" : sort.sortBy, // Use rating instead of cook_count for public
        libraryOnly: false,
        limit: 20,
      }),
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

  // Derived state
  const hasActiveFilters = useMemo(() => {
    return !!(filters.difficulty || filters.categorySlug || filters.timeFilter);
  }, [filters]);

  const isSearching = libraryQuery.isLoading || publicQuery.isLoading;
  const hasSearched = libraryQuery.isFetched || publicQuery.isFetched;
  const hasError = libraryQuery.isError || publicQuery.isError;

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
    publicResults: publicQuery.data ?? [],

    // Loading states
    isSearchingLibrary: libraryQuery.isLoading,
    isSearchingPublic: publicQuery.isLoading,
    isSearching,
    hasSearched,
    hasError,
    error: libraryQuery.error || publicQuery.error,

    // Actions
    clearSearch,
    refetch: () => {
      libraryQuery.refetch();
      publicQuery.refetch();
    },
  };
}
