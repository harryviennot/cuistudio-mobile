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
import {
  SaladIcon,
  CroissantIcon,
  SidesIcon,
  SauceDipIcon,
  GrillIcon,
  PastaIcon,
} from "@/components/icons";

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
