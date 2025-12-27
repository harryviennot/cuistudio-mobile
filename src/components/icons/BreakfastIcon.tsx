/**
 * BreakfastIcon - Pancake stack with butter and syrup
 * Custom icon matching Phosphor style for the breakfast category
 */
import React from "react";
import { Path, Ellipse, Rect } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Plate */}
      <Ellipse
        cx="128"
        cy="200"
        rx="96"
        ry="24"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom pancake */}
      <Ellipse
        cx="128"
        cy="168"
        rx="72"
        ry="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle pancake */}
      <Ellipse
        cx="128"
        cy="128"
        rx="64"
        ry="18"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top pancake */}
      <Ellipse
        cx="128"
        cy="92"
        rx="56"
        ry="16"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Butter pat */}
      <Rect
        x="112"
        y="56"
        width="32"
        height="20"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Syrup drip */}
      <Path
        d="M168 92c8 4 16 16 16 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  ],
  [
    "fill",
    <>
      {/* Plate filled */}
      <Ellipse cx="128" cy="200" rx="104" ry="32" />
      {/* Bottom pancake filled */}
      <Ellipse cx="128" cy="168" rx="80" ry="28" />
      {/* Middle pancake filled */}
      <Ellipse cx="128" cy="128" rx="72" ry="26" />
      {/* Top pancake filled */}
      <Ellipse cx="128" cy="92" rx="64" ry="24" />
      {/* Butter filled */}
      <Rect x="108" y="52" width="40" height="28" rx="6" />
      {/* Syrup filled */}
      <Path d="M176 88a8 8 0 0 0-6.93 4c-4.26 7.37-9.07 24.71-9.07 36a8 8 0 0 0 16 0c0-8.5 3.44-21.62 6.93-28a8 8 0 0 0-6.93-12Z" />
    </>,
  ],
]);

const BreakfastIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="breakfast" />
);

export { BreakfastIcon };
