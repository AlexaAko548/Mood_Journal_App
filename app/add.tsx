import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { EntriesContext } from '../src/context/EntriesContext';

const MOODS = ['😄', '🙂', '😐', '😕', '😢', '😡'];

export default function AddEntryScreen() {
  const [mood, setMood] = useState<string>(MOODS[1]);
  const [note, setNote] = useState<string>('');
  const { addEntry } = useContext(EntriesContext);
  const router = useRouter();

  function onSave() {
    const date = new Date().toISOString();
    addEntry({ date, mood, note });
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you right now?</Text>

      <View style={styles.moodRow}>
        {MOODS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.moodBtn, mood === m && styles.moodBtnActive]}
            onPress={() => setMood(m)}
          >
            <Text style={styles.moodText}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 18 }]}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="a little context…"
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save entry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 8 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  moodBtnActive: { borderColor: '#111', backgroundColor: '#fafafa' },
  moodText: { fontSize: 28 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 8, minHeight: 80, marginTop: 8 },
  saveBtn: { backgroundColor: '#111', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  saveText: { color: '#fff', fontWeight: '600' },
});
