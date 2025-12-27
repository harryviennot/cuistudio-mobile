/**
 * GrillIcon - BBQ grill with food
 * Custom icon matching Phosphor style for the grilled category
 */
import React from "react";
import { Path, Rect, Circle } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Grill body - round kettle style */}
      <Path
        d="M48 128a80 80 0 0 0 160 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Grill rim */}
      <Path
        d="M40 128h176"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Grill grates */}
      <Path
        d="M72 128v32"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M104 128v40"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M152 128v40"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M184 128v32"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Legs */}
      <Path
        d="M80 192v32"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M176 192v32"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Steam/smoke */}
      <Path
        d="M96 96V72c0-8 8-8 8-16"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M128 96V64c0-8 8-8 8-16"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M160 96V72c0-8 8-8 8-16"
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
      {/* Grill body filled */}
      <Path d="M216 120H40a8 8 0 0 0-8 8 88.1 88.1 0 0 0 40 73.57V224a8 8 0 0 0 16 0v-16h80v16a8 8 0 0 0 16 0v-22.43A88.1 88.1 0 0 0 224 128a8 8 0 0 0-8-8Z" />
      {/* Grill grates filled */}
      <Rect x="64" y="120" width="16" height="48" rx="4" />
      <Rect x="96" y="120" width="16" height="56" rx="4" />
      <Rect x="144" y="120" width="16" height="56" rx="4" />
      <Rect x="176" y="120" width="16" height="48" rx="4" />
      {/* Smoke filled */}
      <Path d="M96 104a8 8 0 0 0 8-8V72c0-4.42 4-8 4-12a8 8 0 0 0-16 0c0 4-4 7.58-4 12v24a8 8 0 0 0 8 8Zm32-8V56c0-4.42 4-8 4-12a8 8 0 0 0-16 0c0 4-4 7.58-4 12v40a8 8 0 0 0 16 0Zm32 8a8 8 0 0 0 8-8V72c0-4.42 4-8 4-12a8 8 0 0 0-16 0c0 4-4 7.58-4 12v24a8 8 0 0 0 8 8Z" />
    </>,
  ],
]);

const GrillIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="grill" />
);

export { GrillIcon };
