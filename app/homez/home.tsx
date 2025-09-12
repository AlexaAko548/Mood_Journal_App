import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedWrapper from "../../components/AnimatedWraper"; // 👈 import it
import { EntriesContext, Entry } from '../../src/context/EntriesContext';

function EntryRow({ item, onDelete }: { item: Entry; onDelete: (id: string) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={styles.mood}>{item.mood}</Text>
        <View style={{ marginLeft: 12, flexShrink: 1 }}>
          <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
          {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        </View>
      </View>

      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Text style={styles.delete}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { entries, removeEntry, loading } = useContext(EntriesContext);
  const router = useRouter();

  function handleDelete(id: string) {
    Alert.alert('Delete entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeEntry(id) },
    ]);
  }

  return (
    <AnimatedWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/add')}>
            <Text style={styles.btnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={{ marginTop: 20, color: "#fff" }}>Loading…</Text>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries yet — add your mood for today.</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={i => i.id}
            renderItem={({ item }) => <EntryRow item={item} onDelete={handleDelete} />}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#5b5b5bff', alignItems: 'center' },
  mood: { fontSize: 28, color: "#fff" },
  date: { fontSize: 12, color: '#c4c4c4ff' },
  note: { fontSize: 14, color: '#c4c4c4ff', marginTop: 4 },
  delete: { color: '#d00' },
});
