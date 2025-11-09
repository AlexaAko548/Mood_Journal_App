// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// redux + theme
import { Provider as ReduxProvider } from 'react-redux';
import ThemePersistence from '../components/ThemePersistence';
import ThemeProvider from '../components/ThemeProvider';
import { store } from '../store';

// existing context
import { EntriesProvider } from '../src/context/EntriesContext';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        {/* load persisted theme into Redux BEFORE ThemeProvider renders children */}
        <ThemePersistence />
        <ThemeProvider>
          <EntriesProvider>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#fff',
                headerShadowVisible: true,
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="homez" options={{ headerShown: false }} />
              <Stack.Screen name="add" options={{ title: 'New Entry' }} />
            </Stack>
          </EntriesProvider>
        </ThemeProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
