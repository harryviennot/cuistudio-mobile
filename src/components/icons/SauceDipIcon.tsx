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
      <Path
        fill="currentColor"
        d="M128 112c-48.6 0-88 20.35-88 48 0 35.83 43.54 56 88 56s88-20.17 88-56c0-27.65-39.4-48-88-48Z"
      />
      {/* Chip - outline for contrast */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M160 136l40-80-48 16"
      />
      {/* Sauce drip - outline */}
      <Path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        d="M168 120c4 8 8 8 8 16"
      />
    </>,
  ],
]);

const SauceDipIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="sauce-dip" />
);

export { SauceDipIcon };
