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
          <Stack.Screen
            name="index"
            options={{
              // Render an image (logo) instead of text title
              headerTitle: () => (
                <Image
                  source={require('../assets/images/cat.png')} // small PNG or GIF
                  style={{ width: 120, height: 28, resizeMode: 'cover' }}
                />
              )
            }}
          />
          <Stack.Screen name="add" options={{ title: 'New Entry' }} />
        </Stack>
      </EntriesProvider>
    </GestureHandlerRootView>
  );
}
