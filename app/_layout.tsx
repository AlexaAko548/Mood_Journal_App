import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EntriesProvider } from '../src/context/EntriesContext';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EntriesProvider>
        <Stack screenOptions={{
          headerStyle: {
            backgroundColor: "#000" },
            headerTintColor: "#fff",
            headerShadowVisible: true,
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="homez" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ title: 'New Entry' }} />
        </Stack>
      </EntriesProvider>
    </GestureHandlerRootView>
  );
}
