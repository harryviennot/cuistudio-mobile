/**
 * IconBase - Base component for custom icons matching Phosphor's API
 * Supports regular and fill weights to match app usage
 */
import React, { useContext, type ReactElement } from "react";
import Svg from "react-native-svg";
import { IconContext, type IconProps, type IconWeight } from "phosphor-react-native";

export interface CustomIconProps extends IconProps {
  weights: Map<IconWeight, ReactElement>;
  name: string;
}

export function IconBase({
  weight,
  color,
  size,
  style,
  mirrored,
  name,
  weights,
  ...props
}: CustomIconProps) {
  const {
    color: contextColor = "#000",
    size: contextSize = 24,
    weight: contextWeight = "regular",
    mirrored: contextMirrored = false,
    style: contextStyle,
  } = useContext(IconContext);

  const resolvedWeight = weight ?? contextWeight;
  // Fall back to regular if requested weight isn't available
  const pathContent = weights.get(resolvedWeight) ?? weights.get("regular");

  return (
    <Svg
      style={[
        contextStyle,
        style,
        {
          ...((mirrored ?? contextMirrored) && {
            transform: [{ scaleX: -1 }],
          }),
        },
      ]}
      testID={props.testID ?? `custom-icon-${name}-${resolvedWeight}`}
      fill="currentColor"
      viewBox="0 0 256 256"
      width={size ?? contextSize}
      height={size ?? contextSize}
      color={color ?? contextColor}
      {...props}
    >
      {pathContent}
    </Svg>
  );
}
