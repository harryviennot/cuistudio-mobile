/**
 * Recipe service
 */
import { api } from "../api-client"
import type { Recipe } from "@/types/recipe"

export const recipeService = {
  /**
   * Get a recipe by ID
   */
  getRecipe: async (recipeId: string): Promise<Recipe> => {
    const response = await api.get<Recipe>(`/recipes/${recipeId}`)
    return response.data
  },

  /**
   * Get all recipes for the current user
   */
  getRecipes: async (): Promise<Recipe[]> => {
    const response = await api.get<Recipe[]>("/recipes")
    return response.data
  },

  /**
   * Create a new recipe
   */
  createRecipe: async (recipe: Partial<Recipe>): Promise<Recipe> => {
    const response = await api.post<Recipe>("/recipes", recipe)
    return response.data
  },

  /**
   * Update a recipe
   */
  updateRecipe: async (
    recipeId: string,
    recipe: Partial<Recipe>
  ): Promise<Recipe> => {
    const response = await api.put<Recipe>(`/recipes/${recipeId}`, recipe)
    return response.data
  },

  /**
   * Delete a recipe
   */
  deleteRecipe: async (recipeId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/recipes/${recipeId}`
    )
    return response.data
  },
}
