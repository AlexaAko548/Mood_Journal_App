// components/DebugThemeViewer.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store'; // adjust path if your store is elsewhere

export default function DebugThemeViewer() {
  const theme = useSelector((s: RootState) => s.theme);
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await AsyncStorage.getItem('@app_theme_v1');
      setRaw(r);
    })();
  }, [theme]);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🔧 DebugThemeViewer</Text>
      <Text style={styles.label}>Redux theme:</Text>
      <Text style={styles.value}>{JSON.stringify(theme)}</Text>
      <Text style={styles.label}>Saved raw:</Text>
      <Text style={styles.value}>{raw ?? 'null'}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={async () => setRaw(await AsyncStorage.getItem('@app_theme_v1'))}
      >
        <Text style={styles.btnText}>Refresh saved</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12, marginTop: 12, borderRadius: 8, backgroundColor: '#222' },
  title: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  label: { color: '#aaa', marginTop: 6, fontSize: 12 },
  value: { color: '#fff', fontSize: 12 },
  btn: { marginTop: 10, padding: 8, backgroundColor: '#1ed760', borderRadius: 6, alignSelf: 'flex-start' },
  btnText: { color: '#000', fontWeight: '700' },
});
