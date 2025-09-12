import { useDrawerProgress } from "@react-navigation/drawer";
import React from "react";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";

export default function AnimatedWrapper({ children }: { children: React.ReactNode }) {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.9]); // shrink to 90%
    const borderRadius = interpolate(progress.value, [0, 1], [0, 20]);
    return {
      transform: [{ scale }],
      borderRadius,
      overflow: "hidden",
    };
  });

  return <Animated.View style={[{ flex: 1, backgroundColor: "#000" }, animatedStyle]}>{children}</Animated.View>;
}
