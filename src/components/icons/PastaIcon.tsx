/**
 * PastaIcon - Pasta/noodles with fork
 * Custom icon matching Phosphor style for the pasta-noodles category
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
        d="M48 152c0 32 36 56 80 56s80-24 80-56"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bowl rim */}
      <Path
        d="M40 152h176"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Noodle strands */}
      <Path
        d="M80 152c0-24 8-48 8-72"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M112 152c0-24-8-48-8-72"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M144 152c0-24 8-48 8-72"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M176 152c0-24-8-48-8-72"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fork handle */}
      <Path
        d="M200 48v80"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fork tines */}
      <Path
        d="M192 48v24"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M208 48v24"
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
      {/* Filled bowl */}
      <Path d="M216 144H40a8 8 0 0 0-8 8c0 35.77 40.34 64 96 64s96-28.23 96-64a8 8 0 0 0-8-8Z" />
      {/* Filled noodles */}
      <Path d="M80 144a8 8 0 0 0 8-8c0-22.69 7.5-45.75 8-72a8 8 0 0 0-16 0c-.5 26.25 8 49.31 8 72a8 8 0 0 0-8 8Z" />
      <Path d="M112 144a8 8 0 0 0 8-8c0-22.69-7.5-45.75-8-72a8 8 0 0 0-16 0c.5 26.25-8 49.31-8 72a8 8 0 0 0 8 8Z" />
      <Path d="M144 144a8 8 0 0 0 8-8c0-22.69 7.5-45.75 8-72a8 8 0 0 0-16 0c-.5 26.25 8 49.31 8 72a8 8 0 0 0-8 8Z" />
      <Path d="M176 144a8 8 0 0 0 8-8c0-22.69-7.5-45.75-8-72a8 8 0 0 0-16 0c.5 26.25-8 49.31-8 72a8 8 0 0 0 8 8Z" />
      {/* Filled fork */}
      <Path d="M208 40h-16a8 8 0 0 0-8 8v80a8 8 0 0 0 16 0V80h8a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Zm-8 24V56h8v8Z" />
    </>,
  ],
]);

const PastaIcon: Icon = (props: IconProps) => (
  <IconBase {...props} weights={weights} name="pasta" />
);

export { PastaIcon };
