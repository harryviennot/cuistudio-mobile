/**
 * SaladIcon - Salad bowl with lettuce leaves
 * Custom icon matching Phosphor style for the salads category
 */
import React from "react";
import { Path } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Bowl */}
      <Path
        d="M224 120a96 96 0 0 1-56 87.3v8.7a8 8 0 0 1-8 8H96a8 8 0 0 1-8-8v-8.7A96 96 0 0 1 32 120h192Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left lettuce leaf */}
      <Path
        d="M80 120c0-24 8-40 24-52s20-32 8-48"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center lettuce leaf */}
      <Path
        d="M128 120c0-28 0-48 0-72s8-28 0-28"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right lettuce leaf */}
      <Path
        d="M176 120c0-24-8-40-24-52s-20-32-8-48"
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
      <Path
        fill="currentColor"
        d="M232 120a8 8 0 0 0-8-8H32a8 8 0 0 0-8 8 104.35 104.35 0 0 0 56 92.28V216a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-3.72A104.35 104.35 0 0 0 232 120Z"
      />
      {/* Leaves - kept as outlines for contrast like IceCream cone */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M72 112c0-20 12-40 28-52s16-28 8-44"
      />
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M128 112V48c0-8-4-16-8-24"
      />
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M184 112c0-20-12-40-28-52s-16-28-8-44"
      />
    </>,
  ],
]);

const SaladIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="salad" />
);

export { SaladIcon };
