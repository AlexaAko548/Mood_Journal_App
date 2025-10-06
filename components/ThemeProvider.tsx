// components/ThemeProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type ThemeContextValue = {
  bg: string;
  text: string;
  accent: string;
};

const ThemeContext = createContext<ThemeContextValue>({ bg: '#000', text: '#fff', accent: '#1ED760' });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector((s: RootState) => s.theme);
  const t = useSharedValue(theme.mode === 'light' ? 1 : 0);
  const accent = theme.accent;

  // animate t between 0 and 1 when mode changes
  useEffect(() => {
    t.value = withTiming(theme.mode === 'light' ? 1 : 0, { duration: 400 });
  }, [theme.mode]);

  // derived animated style for background color
  const animatedStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(t.value, [0, 1], ['#000000', '#FFFFFF']);
    const text = interpolateColor(t.value, [0, 1], ['#FFFFFF', '#111111']);
    // we can't pass these from JS inside an animated view, so we'll set CSS vars? simpler: set a static container and provide values via context by reading theme.mode
    return {
      backgroundColor: bg,
    };
  }, [accent]);

  // Provide simple values via context for components to use synchronously
  const ctx = {
    bg: theme.mode === 'light' ? '#FFFFFF' : '#000000',
    text: theme.mode === 'light' ? '#111111' : '#FFFFFF',
    accent,
  };

  return (
    <ThemeContext.Provider value={ctx}>
      <Animated.View style={[styles.root, animatedStyle]}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
