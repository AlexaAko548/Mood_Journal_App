// app/homez/settings.tsx
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemeControls from '../../components/ThemeControls';
import { useTheme } from '../../components/ThemeProvider';

export default function SettingsScreen() {
  const theme = useTheme(); // { bg, text, accent }
  const navigation: any = useNavigation();

  useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.text,
      });
    }, [navigation, theme.bg, theme.text]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Theme & appearance</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Theme Presets</Text>
        <ThemeControls />
      </View>

      <View style={styles.previewSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Live preview</Text>
        <View style={[styles.previewCard, { borderColor: theme.accent }]}>
          <Text style={[styles.previewText, { color: theme.text }]}>This is how the app looks</Text>
          <View style={[styles.accentPill, { backgroundColor: theme.accent }]}>
            <Text style={styles.accentPillText}>Accent</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16,},
  header: { marginBottom: 12 , marginTop: 12},
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  previewSection: { marginTop: 20 },
  previewCard: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  previewText: { fontSize: 16, marginBottom: 8 },
  accentPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  accentPillText: { color: '#000', fontWeight: '700' },
});
