import {
  MegaphoneIcon,
  StorefrontIcon,
  ArticleIcon,
  MagnifyingGlassIcon,
  DotsThreeIcon,
  CookingPotIcon,
  TimerIcon,
  CalendarBlankIcon,
  FireIcon,
  TiktokLogoIcon,
  InstagramLogoIcon,
  YoutubeLogoIcon,
  BookOpenIcon,
  BookBookmarkIcon,
  UsersThreeIcon,
} from "phosphor-react-native";

import type { StepId, OptionConfig } from "./types";

export const HEARD_FROM_OPTIONS: OptionConfig[] = [
  { value: "social_media", icon: MegaphoneIcon },
  { value: "friend", icon: UsersThreeIcon },
  { value: "app_store", icon: StorefrontIcon },
  { value: "blog", icon: ArticleIcon },
  { value: "search_engine", icon: MagnifyingGlassIcon },
  { value: "other", icon: DotsThreeIcon },
];

export const COOKING_FREQUENCY_OPTIONS: OptionConfig[] = [
  { value: "rarely", icon: CalendarBlankIcon },
  { value: "occasionally", icon: TimerIcon },
  { value: "regularly", icon: CookingPotIcon },
  { value: "almost_daily", icon: FireIcon },
];

export const RECIPE_SOURCES_OPTIONS: OptionConfig[] = [
  { value: "tiktok", icon: TiktokLogoIcon },
  { value: "instagram", icon: InstagramLogoIcon },
  { value: "youtube", icon: YoutubeLogoIcon },
  { value: "blogs", icon: ArticleIcon },
  { value: "cookbooks", icon: BookBookmarkIcon },
  { value: "family", icon: UsersThreeIcon },
  { value: "other", icon: BookOpenIcon },
];

export const STEPS: StepId[] = [
  "basicInfo",
  "heardFrom",
  "cookingFrequency",
  "recipeSources",
  "referralCode",
  "notifications",
  "completion",
];

export const TOTAL_QUESTION_STEPS = STEPS.length - 1; // Exclude completion step from count
