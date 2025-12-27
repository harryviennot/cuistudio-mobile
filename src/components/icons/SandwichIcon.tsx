/**
 * SandwichIcon - Layered sandwich (not burger-specific)
 * Custom icon matching Phosphor style for the sandwiches category
 */
import React from "react";
import { Path } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Top bread slice - rounded */}
      <Path
        d="M216 96c0-24-40-48-88-48S40 72 40 96c0 8 8 16 8 16h160s8-8 8-16Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lettuce layer - wavy */}
      <Path
        d="M48 112c16 8 32 0 48 8s32 0 48 8 32-8 48-8 32 8 48 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle filling */}
      <Path
        d="M56 136h144"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cheese/tomato layer */}
      <Path
        d="M48 160h160"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom bread slice */}
      <Path
        d="M40 184h176a8 8 0 0 1 8 8v8a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-8a8 8 0 0 1 8-8Z"
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
      {/* Top bread - filled */}
      <Path
        fill="currentColor"
        d="M128 40c-52.94 0-96 28.65-96 64a24 24 0 0 0 8 17.87V128h176v-6.13A24 24 0 0 0 224 104c0-35.35-43.06-64-96-64Z"
      />
      {/* Middle filling - outline for contrast */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M56 144h144"
      />
      {/* Bottom bread - filled */}
      <Path
        fill="currentColor"
        d="M208 176H48a16 16 0 0 0-16 16v8a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-8a16 16 0 0 0-16-16Z"
      />
    </>,
  ],
]);

const SandwichIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="sandwich" />
);

export { SandwichIcon };
