/**
 * SidesIcon - Avocado
 * Custom icon matching Phosphor style for the sides category
 */
import React from "react";
import { Circle, Path } from "react-native-svg";
import type { Icon, IconProps, IconWeight } from "phosphor-react-native";
import { IconBase } from "./IconBase";

// From avocado.svg (already 256x256 viewBox)
const bodyPath = "M82.73,48a48,48,0,0,1,90.9,1l29.82,84.28a80,80,0,1,1-150.26-1.74Z";

const weights = new Map<IconWeight, React.ReactElement>([
  [
    "regular",
    <>
      {/* Avocado pit */}
      <Circle
        cx="128"
        cy="160"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Avocado body */}
      <Path
        d={bodyPath}
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
      {/* Avocado pit */}
      <Circle
        cx="128"
        cy="160"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth={28}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Avocado body */}
      <Path
        d={bodyPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={28}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  ],
  [
    "fill",
    <>
      {/* Avocado body with pit cutout - using fill-rule evenodd */}
      <Path
        d={`${bodyPath} M128,120 a40,40 0 1,0 0,80 a40,40 0 1,0 0,-80 Z`}
        fill="currentColor"
        fillRule="evenodd"
      />
    </>,
  ],
]);

const SidesIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="sides" />
);

export { SidesIcon };
