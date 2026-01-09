import "@/global.css";
import { View, Text, Pressable } from "react-native";
import { ChefHatIcon, ClockIcon, UsersThreeIcon } from "phosphor-react-native";
import { DifficultyLevel } from "@/types/recipe";
import { useTranslation } from "react-i18next";
import { ShadowItem } from "@/components/ShadowedSection";
import { formatDuration } from "@/utils/formatDuration";

interface RecipeQuickInfoProps {
  time: number | undefined;
  difficulty: DifficultyLevel | undefined;
  servings: number | undefined;
  onTimePress: () => void;
  enableUpdate: boolean;
}

export function RecipeQuickInfo({
  time,
  difficulty = DifficultyLevel.MEDIUM,
  servings,
  onTimePress,
  enableUpdate = true,
}: RecipeQuickInfoProps) {
  const { t } = useTranslation();

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return t("recipe.difficulty.easy");
      case "medium":
        return t("recipe.difficulty.medium");
      case "hard":
        return t("recipe.difficulty.hard");
      default:
        return null;
    }
  };

  return (
    <ShadowItem className="flex-row p-4 mb-4  justify-around">
      {/* Time - Editable */}
      <Pressable onPress={onTimePress} className="items-center flex-1">
        {!enableUpdate && <ClockIcon size={20} color="#6B6456" weight="regular" />}
        <Text className="text-sm text-[#6B6456] mt-1">{formatDuration(time ?? 0, { t })}</Text>
        {enableUpdate && (
          <Text className="text-xs text-[#334d43] font-medium mt-0.5 text-center">
            {t("recipe.quickInfo.tapToEdit")}
          </Text>
        )}
      </Pressable>

      {/* Difficulty */}
      <View className="items-center flex-1">
        <View className="flex-row items-center gap-1">
          {difficulty === DifficultyLevel.EASY && <ChefHatIcon size={20} color="#6B6456" weight="regular" />}
          {difficulty === DifficultyLevel.MEDIUM && (<>
            <ChefHatIcon size={20} color="#6B6456" weight="regular" style={{ transform: [{ rotate: '-10deg' }] }} />
            <ChefHatIcon size={20} color="#6B6456" weight="regular" style={{ transform: [{ rotate: '10deg' }] }} />
          </>)}
          {difficulty === DifficultyLevel.HARD && (<>
            <ChefHatIcon size={20} color="#6B6456" weight="regular" style={{ transform: [{ rotate: '-15deg' }] }} />
            <ChefHatIcon size={20} color="#6B6456" weight="regular" style={{ transform: [{ translateY: -2 }] }} />
            <ChefHatIcon size={20} color="#6B6456" weight="regular" style={{ transform: [{ rotate: '15deg' }] }} />
          </>)}
        </View>
        <Text className="text-sm text-[#6B6456] mt-0.5">{getDifficultyLabel(difficulty)}</Text>
      </View>

      {/* Servings */}
      <View className="items-center flex-1">
        <UsersThreeIcon size={20} color="#6B6456" weight="regular" />
        <Text className="text-sm text-[#6B6456] mt-1">
          {servings} {t("common.servings")}
        </Text>
      </View>
    </ShadowItem>
  );
}
