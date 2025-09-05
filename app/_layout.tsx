import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EntriesProvider } from '../src/context/EntriesContext';
import { Image, TouchableOpacity } from 'react-native';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EntriesProvider>
        <Stack> 
          <Stack.Screen name="index" options={{ headerShown: false  }} />
          <Stack.Screen name="homez" options={{ headerShown: false  }} />
          <Stack.Screen name="add" options={{ title: 'New Entry' }} />
        </Stack>
      </EntriesProvider>
    </GestureHandlerRootView>
  );
}
