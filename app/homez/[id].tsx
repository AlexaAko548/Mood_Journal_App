// app/homez/playlistDetail/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Define the structure for Playlist object
interface Playlist {
  id: string;
  name: string;
  songs: string[];
}

const PlaylistDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();  // `params` directly from useRouter()

  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (id) {
      // Simulate fetching playlist data based on the id
      setPlaylist({ id, name: `Playlist ${id}`, songs: ['Song 1', 'Song 2', 'Song 3'] });
    }
  }, [id]);

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{playlist.name}</Text>
      {playlist.songs.map((song, index) => (
        <Text key={index}>{song}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 24, marginBottom: 20 },
});

export default PlaylistDetailScreen;
