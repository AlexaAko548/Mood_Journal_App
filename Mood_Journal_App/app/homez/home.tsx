// app/homez/home.tsx
import { useNavigation, useRouter } from 'expo-router';
import React, { useContext, useLayoutEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedWrapper from '../../components/AnimatedWraper';
import { useTheme } from '../../components/ThemeProvider';
import { EntriesContext, Entry } from '../../src/context/EntriesContext';

function EntryRow({ item, onDelete, theme }: { item: Entry; onDelete: (id: string) => void; theme: any }) {
  // small helper for muted text color
  const muted = theme.text === '#111111' || theme.bg === '#FFFFFF' ? '#444' : '#c4c4c4';

  return (
    <View style={[styles.row, { borderBottomColor: theme.accent + '33' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={[styles.mood, { color: theme.text }]}>{item.mood}</Text>
        <View style={{ marginLeft: 12, flexShrink: 1 }}>
          <Text style={[styles.date, { color: muted }]}>{new Date(item.date).toLocaleString()}</Text>
          {item.note ? <Text style={[styles.note, { color: muted }]}>{item.note}</Text> : null}
        </View>
      </View>

      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Text style={[styles.delete, { color: '#ff6b6b' }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { entries, removeEntry, loading } = useContext(EntriesContext);
  const router = useRouter();
  const theme = useTheme();
  const navigation: any = useNavigation();
  
    useLayoutEffect(() => {
        navigation.setOptions({
          headerShown: true,
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
        });
      }, [navigation, theme.bg, theme.text]);
      
  function handleDelete(id: string) {
    Alert.alert('Delete entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeEntry(id) },
    ]);
  }

  // compute contrasting text for buttons
  const btnTextColor = theme.bg === '#FFFFFF' || theme.text === '#111111' ? '#000' : '#000';
  // If you want header tint to adapt, you can also call navigation.setOptions inside useLayoutEffect.

  return (
    <AnimatedWrapper>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/add')}
          >
            <Text style={[styles.btnText, { color: btnTextColor }]}>+ New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={{ marginTop: 20, color: theme.text }}>Loading…</Text>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.text }]}>No entries yet — add your mood for today.</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={i => i.id}
            renderItem={({ item }) => <EntryRow item={item} onDelete={handleDelete} theme={theme} />}
          />
        )}
      </View>
    </AnimatedWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000000ff' },
  headerRow: { flexDirection: 'row', marginBottom: 12 },
  btn: { backgroundColor: '#ffffffff', padding: 10, borderRadius: 8 },
  btnText: { color: '#000000ff', fontWeight: '600' },
  empty: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#666' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#5b5b5bff',
    alignItems: 'center',
  },
  mood: { fontSize: 28, color: '#fff' },
  date: { fontSize: 12, color: '#c4c4c4ff' },
  note: { fontSize: 14, color: '#c4c4c4ff', marginTop: 4 },
  delete: { color: '#d00' },
});
