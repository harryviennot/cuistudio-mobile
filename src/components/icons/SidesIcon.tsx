/**
 * SidesIcon - Small plate with portion of food
 * Custom icon matching Phosphor style for the sides category
 */
import React from "react";
import { Path, Ellipse, Circle } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Small plate/bowl */}
      <Path
        d="M48 160c0 24 36 48 80 48s80-24 80-48"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plate rim */}
      <Ellipse
        cx="128"
        cy="160"
        rx="80"
        ry="24"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Food portion - rice/grains mound */}
      <Path
        d="M88 160c0-16 16-40 40-40s40 24 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Decorative vegetable pieces */}
      <Circle
        cx="96"
        cy="128"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
      />
      <Circle
        cx="160"
        cy="128"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
      />
      {/* Steam lines */}
      <Path
        d="M112 96v-16c0-8 8-8 8-16"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M144 96v-16c0-8 8-8 8-16"
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
      {/* Plate - filled */}
      <Path
        fill="currentColor"
        d="M128 128c-48.6 0-88 20.35-88 48s39.4 48 88 48 88-20.35 88-48-39.4-48-88-48Z"
      />
      {/* Food mound - filled */}
      <Path
        fill="currentColor"
        d="M128 104c-32 0-56 24-56 48h112c0-24-24-48-56-48Z"
      />
      {/* Decorative vegetables - outline for contrast */}
      <Circle
        cx="96"
        cy="112"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
      />
      <Circle
        cx="160"
        cy="112"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
      />
      {/* Steam - outline */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M112 80V64c0-8 8-8 8-16"
      />
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M144 80V64c0-8 8-8 8-16"
      />
    </>,
  ],
]);

const SidesIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="sides" />
);

export { SidesIcon };
