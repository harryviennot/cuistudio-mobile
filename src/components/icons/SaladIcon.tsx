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
      {/* Filled bowl with leaves */}
      <Path d="M224 112H32a8 8 0 0 0-8 8 104.35 104.35 0 0 0 56 92.28V216a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-3.72A104.35 104.35 0 0 0 232 120a8 8 0 0 0-8-8Z" />
      {/* Left leaf */}
      <Path d="M74.34 24a8 8 0 0 0-6.34 9.42c5.17 25.85-2.54 37.33-14.68 47-14.18 11.33-24.84 26.6-28.81 48.58H96c0-24-6.51-41.64-19.91-53.94C66.54 66.25 65.38 52.91 70.09 29.42A8 8 0 0 0 74.34 24Z" />
      {/* Center leaf */}
      <Path d="M128 16a8 8 0 0 0-8 8v32c0 22.63-1.88 44.51 0 56h16c1.88-11.49 0-33.37 0-56V24a8 8 0 0 0-8-8Z" />
      {/* Right leaf */}
      <Path d="M181.66 24a8 8 0 0 1 6.34 9.42c-5.17 25.85 2.54 37.33 14.68 47 14.18 11.33 24.84 26.6 28.81 48.58H160c0-24 6.51-41.64 19.91-53.94 9.55-8.81 10.71-22.15 6-45.64a8 8 0 0 1 5.75-5.42Z" />
    </>,
  ],
]);

const SaladIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="salad" />
);

export { SaladIcon };
