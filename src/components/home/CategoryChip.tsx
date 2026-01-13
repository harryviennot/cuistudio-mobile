/**
 * CategoryChip - A selectable category pill for the category filter
 */
import React, { useCallback } from "react";
import { Text } from "react-native";
import * as Haptics from "expo-haptics";
import type { Icon } from "phosphor-react-native";
import {
  SquaresFourIcon,
  ForkKnifeIcon,
  BowlSteamIcon,
  ShrimpIcon,
  CheeseIcon,
  IceCreamIcon,
  BreadIcon,
  MartiniIcon,
  PopcornIcon,
  GrainsIcon,
  PintGlassIcon,
  HamburgerIcon,
} from "phosphor-react-native";
import { ShadowItem } from "../ShadowedSection";
import type { TabComponentProps } from "../ui/HorizontalTabBar";
import { SaladIcon, CroissantIcon, SidesIcon, SauceDipIcon, GrillIcon, PastaIcon } from "../icons";

// Map category slugs to icons (Phosphor + custom)
export const CATEGORY_ICONS: Record<string, Icon> = {
  all: SquaresFourIcon,
  "main-dishes": ForkKnifeIcon,
  soups: BowlSteamIcon,
  salads: SaladIcon,
  "pasta-noodles": PastaIcon,
  sandwiches: HamburgerIcon,
  appetizers: ShrimpIcon,
  apero: CheeseIcon,
  desserts: IceCreamIcon,
  "baked-goods": BreadIcon,
  beverages: PintGlassIcon,
  cocktails: MartiniIcon,
  breakfast: CroissantIcon,
  sides: SidesIcon,
  "sauces-dips": SauceDipIcon,
  snacks: PopcornIcon,
  grilled: GrillIcon,
  "bowls-grains": GrainsIcon,
};

/**
 * CategoryIcon - Renders the icon for a category based on its slug
 */
interface CategoryIconProps {
  slug: string;
  size?: number;
  color?: string;
  weight?: "regular" | "bold" | "fill";
}

export function CategoryIcon({
  slug,
  size = 16,
  color = "#334d43",
  weight = "bold",
}: CategoryIconProps) {
  const IconComponent = CATEGORY_ICONS[slug] || ForkKnifeIcon;
  return <IconComponent size={size} color={color} weight={weight} />;
}

/**
 * CategoryTabChip - Adapter for using CategoryChip with HorizontalTabBar
 * The tab.value should contain { slug: string }
 */
export function CategoryTabChip({ tab, isActive, onPress }: TabComponentProps) {
  const slug = tab.value?.slug || tab.id;
  const IconComponent = CATEGORY_ICONS[slug] || ForkKnifeIcon;

  return (
    <ShadowItem
      onPress={onPress}
      className={`flex-row gap-2 py-2.5 px-4 rounded-full ${isActive && "border-primary bg-primary/10"}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <IconComponent
        size={16}
        color={isActive ? "#334d43" : "#8a8177"}
        weight={isActive ? "fill" : "bold"}
      />
      <Text
        className={`text-sm font-semibold  ${isActive ? "text-primary" : "text-foreground-secondary"}`}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </ShadowItem>
  );
}

/**
 * RecipeCategoryBadge - Category badge for recipe detail header
 * Styled like an inactive CategoryTabChip but standalone
 */
interface RecipeCategoryBadgeProps {
  slug: string;
  label: string;
  onPress?: () => void;
}

export function RecipeCategoryBadge({ slug, label, onPress }: RecipeCategoryBadgeProps) {
  const IconComponent = CATEGORY_ICONS[slug] || ForkKnifeIcon;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  return (
    <ShadowItem
      onPress={handlePress}
      className="flex-row gap-2 py-2.5 px-4 rounded-full"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <IconComponent size={16} color="#8a8177" weight="bold" />
      <Text className="text-sm font-semibold text-foreground-secondary" numberOfLines={1}>
        {label}
      </Text>
    </ShadowItem>
  );
}
