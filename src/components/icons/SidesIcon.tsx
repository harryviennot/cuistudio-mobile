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
      {/* Filled plate with food */}
      <Path d="M128 128c-28.72 0-88 17.91-88 48 0 30.93 59.28 40 88 40s88-9.07 88-40c0-30.09-59.28-48-88-48Z" />
      {/* Filled food mound */}
      <Path d="M128 112c-28 0-48 20-48 40h96c0-20-20-40-48-40Z" />
      {/* Decorative elements */}
      <Circle cx="96" cy="120" r="16" />
      <Circle cx="160" cy="120" r="16" />
      {/* Steam */}
      <Path d="M104 88V72a8 8 0 0 1 16 0v16a8 8 0 0 1-16 0Zm32-24v8a8 8 0 0 1 16 0v-8c0-8-8-16-8-24a8 8 0 0 0-16 0c0 8-8 16-8 24v8a8 8 0 0 0 16 0v-8Z" />
    </>,
  ],
]);

const SidesIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="sides" />
);

export { SidesIcon };
