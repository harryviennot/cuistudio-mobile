/**
 * Custom hook for fetching recipes with infinite scroll pagination
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services/recipe.service";
import type { Recipe } from "@/types/recipe";

const RECIPES_PER_PAGE = 20;

export function useRecipes() {
  return useInfiniteQuery<Recipe[], Error>({
    queryKey: ["recipes"],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam as number;
      return recipeService.getRecipesPaginated(RECIPES_PER_PAGE, offset);
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than the limit, we've reached the end
      if (lastPage.length < RECIPES_PER_PAGE) {
        return undefined;
      }
      // Calculate the next offset
      const nextOffset = allPages.length * RECIPES_PER_PAGE;
      return nextOffset;
    },
    initialPageParam: 0,
  });
}
