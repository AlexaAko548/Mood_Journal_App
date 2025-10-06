// components/ThemeControls.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAccent, setMode } from '../store/themeSlice';

export default function ThemeControls() {
  const dispatch = useDispatch();
  const theme = useSelector((s: RootState) => s.theme);

  const presets = [
    { label: 'Light', mode: 'light' as const },
    { label: 'Dark', mode: 'dark' as const },
    { label: 'Neon', mode: 'custom' as const, accent: '#ff4d6d' },
  ];

  return (
    <View style={styles.row}>
      {presets.map(p => (
        <TouchableOpacity
          key={p.label}
          style={[
            styles.preset,
            theme.mode === p.mode && { borderColor: '#fff', borderWidth: 2 },
            p.accent ? { backgroundColor: p.accent } : null,
          ]}
          onPress={() => {
            dispatch(setMode(p.mode));
            if (p.accent) dispatch(setAccent(p.accent));
          }}
        >
          <Text style={styles.presetText}>{p.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Accent quick choices */}
      <TouchableOpacity style={[styles.preset, { backgroundColor: '#1ED760' }]} onPress={() => dispatch(setAccent('#1ED760'))}>
        <Text style={styles.presetText}>Accent 1</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.preset, { backgroundColor: '#ffb86b' }]} onPress={() => dispatch(setAccent('#ffb86b'))}>
        <Text style={styles.presetText}>Accent 2</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, padding: 12 },
  preset: { padding: 8, borderRadius: 8, backgroundColor: '#333' },
  presetText: { color: '#fff' },
});
