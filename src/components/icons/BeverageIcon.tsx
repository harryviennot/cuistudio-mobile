/**
 * BeverageIcon - Smoothie glass with straw
 * Custom icon matching Phosphor style for the beverages category
 */
import React from "react";
import { Path, Circle } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Glass body - tapered */}
      <Path
        d="M64 80l16 128a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16l16-128Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glass rim */}
      <Path
        d="M56 80h144"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Straw */}
      <Path
        d="M152 80V32l24-8"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Liquid level */}
      <Path
        d="M72 120h112"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Decorative fruit */}
      <Circle
        cx="104"
        cy="148"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
      />
    </>,
  ],
  [
    "fill",
    <>
      {/* Glass body - filled with hole for fruit circle */}
      <Path
        fill="currentColor"
        d="M200 72h-40V32.94l18.24-6.08a8 8 0 1 0-5.07-15.17L145.07 21a8 8 0 0 0-5.07 7.52V72H56a8 8 0 0 0-8 8 8 8 0 0 0 .47 2.67l16 128A24 24 0 0 0 88.28 232h79.44a24 24 0 0 0 23.81-21.33l16-128A8 8 0 0 0 208 80a8 8 0 0 0-8-8Zm-96 92a20 20 0 1 1 20-20 20 20 0 0 1-20 20Z"
      />
    </>,
  ],
]);

const BeverageIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="beverage" />
);

export { BeverageIcon };
