/**
 * GrillIcon - BBQ grill with food
 * Custom icon matching Phosphor style for the grilled category
 */
import React from "react";
import { Path } from "react-native-svg";
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
    "bold",
    <>
      {/* Grill body - round kettle style */}
      <Path
        d="M48 128a80 80 0 0 0 160 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Grill rim */}
      <Path
        d="M40 128h176"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Legs */}
      <Path
        d="M80 192v32"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M176 192v32"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Steam/smoke */}
      <Path
        d="M96 96V72c0-8 8-8 8-16"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M128 96V64c0-8 8-8 8-16"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M160 96V72c0-8 8-8 8-16"
        fill="none"
        stroke="currentColor"
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  ],
  [
    "fill",
    <>
      {/* Grill body - filled */}
      <Path
        fill="currentColor"
        d="M216 120H40a8 8 0 0 0-8 8 88.1 88.1 0 0 0 40 73.57V224a8 8 0 0 0 16 0v-16h80v16a8 8 0 0 0 16 0v-22.43A88.1 88.1 0 0 0 224 128a8 8 0 0 0-8-8Z"
      />
      {/* Grill grates - outline for contrast */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M72 128v32M104 128v40M152 128v40M184 128v32"
      />
      {/* Smoke - outline */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M96 96V72c0-8 8-8 8-16"
      />
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M128 96V64c0-8 8-8 8-16"
      />
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M160 96V72c0-8 8-8 8-16"
      />
    </>,
  ],
]);

const GrillIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="grill" />
);

export { GrillIcon };
