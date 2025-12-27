/**
 * SauceDipIcon - Dip bowl with chip/bread
 * Custom icon matching Phosphor style for the sauces-dips category
 */
import React from "react";
import { Path, Ellipse } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Dip bowl */}
      <Path
        d="M48 144c0 32 36 56 80 56s80-24 80-56"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bowl rim */}
      <Ellipse
        cx="128"
        cy="144"
        rx="80"
        ry="24"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dip surface */}
      <Ellipse
        cx="128"
        cy="160"
        rx="56"
        ry="16"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chip/tortilla dipping */}
      <Path
        d="M160 144l40-80-48 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sauce drip on chip */}
      <Path
        d="M168 128c4 8 8 8 8 16"
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
      {/* Bowl filled */}
      <Path d="M128 112c-48.6 0-88 20.35-88 40v8c0 35.83 43.54 56 88 56s88-20.17 88-56v-8c0-19.65-39.4-40-88-40Z" />
      {/* Dip surface filled */}
      <Ellipse cx="128" cy="160" rx="64" ry="24" fill="currentColor" opacity={0.3} />
      {/* Chip filled */}
      <Path d="M208 56a8 8 0 0 0-9.85-7.79l-48 16a8 8 0 0 0-4.93 4.45l-24 48a8 8 0 0 0 3.56 10.55 8 8 0 0 0 10.55-3.57l22.15-44.3 42.67-14.22A8 8 0 0 0 208 56Z" />
      {/* Drip */}
      <Path d="M176 120a8 8 0 0 0-7.39 4.93c-2.67 6.4-4.61 12-4.61 19.07a8 8 0 0 0 16 0c0-4.27 1.06-7.73 3.61-13.93a8 8 0 0 0-7.61-10.07Z" />
    </>,
  ],
]);

const SauceDipIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="sauce-dip" />
);

export { SauceDipIcon };
