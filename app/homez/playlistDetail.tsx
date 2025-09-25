// app/homez/playlistDetail.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

// Actions
const ADD_SONG = 'ADD_SONG';
const REMOVE_SONG = 'REMOVE_SONG';
const CLEAR_SONGS = 'CLEAR_SONGS';
const UNDO = 'UNDO';
const REDO = 'REDO';
const SET_SONGS = 'SET_SONGS';

// Reducer (includes SET_SONGS)
const songReducer = (state: any, action: any) => {
  switch (action.type) {
    case ADD_SONG:
      return {
        ...state,
        songs: [...state.songs, action.song],
        history: [...state.history, { type: ADD_SONG, song: action.song }],
        future: [],
      };
    case REMOVE_SONG:
      return {
        ...state,
        songs: state.songs.filter((s: any) => s !== action.song),
        history: [...state.history, { type: REMOVE_SONG, song: action.song }],
        future: [],
      };
    case CLEAR_SONGS:
      return { ...state, songs: [], history: [...state.history, { type: CLEAR_SONGS }], future: [] };
    case UNDO: {
      const previousAction = state.history[state.history.length - 1];
      if (!previousAction) return state;
      const updatedHistory = state.history.slice(0, -1);
      let songs = state.songs.slice();
      if (previousAction.type === ADD_SONG) songs = songs.filter((s: any) => s !== previousAction.song);
      else if (previousAction.type === REMOVE_SONG) songs = [...songs, previousAction.song];
      return { ...state, songs, history: updatedHistory, future: [previousAction, ...state.future] };
    }
    case REDO: {
      const futureAction = state.future[0];
      if (!futureAction) return state;
      const updatedFuture = state.future.slice(1);
      let songs = state.songs.slice();
      if (futureAction.type === ADD_SONG) songs = [...songs, futureAction.song];
      else if (futureAction.type === REMOVE_SONG) songs = songs.filter((s: any) => s !== futureAction.song);
      return { ...state, songs, history: [...state.history, futureAction], future: updatedFuture };
    }
    case SET_SONGS:
      return { ...state, songs: action.songs || [] };
    default:
      return state;
  }
};

const PlaylistDetailScreen = () => {
  // read `playlistId` from route params
  const params = useLocalSearchParams<{ id?: string }>();
  const playlistId = params.id ?? 'default';

  const [song, setSong] = useState('');
  const [state, dispatch] = useReducer(songReducer, {
    songs: [],
    history: [],
    future: [],
  });

  const navigation: any = useNavigation();
  const didLoadRef = useRef(false);
  const router = useRouter();

useLayoutEffect(() => {
  navigation.setOptions({
    headerShown: true,
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            router.replace('/homez/playlist'); // <-- go straight to playlist
          }
        }}
        style={{ marginLeft: 12, padding: 6 }}
        hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    ),
  });
}, [navigation, router]);

  const addSong = () => {
    if (song) {
      dispatch({ type: ADD_SONG, song });
      setSong('');
    }
  };

  const removeSong = (s: string) => dispatch({ type: REMOVE_SONG, song: s });
  const clearSongs = () => dispatch({ type: CLEAR_SONGS });
  const undoAction = () => dispatch({ type: UNDO });
  const redoAction = () => dispatch({ type: REDO });

  // Load songs (runs once for this playlistId)
  useEffect(() => {
    const loadPlaylistSongs = async () => {
      try {
        const songs = await AsyncStorage.getItem(`@playlist_${playlistId}`);
        if (songs) dispatch({ type: SET_SONGS, songs: JSON.parse(songs) });
      } catch (e) {
        console.warn('Failed to load songs', e);
      } finally {
        didLoadRef.current = true;
      }
    };
    loadPlaylistSongs();
  }, [playlistId]);

  // Save songs only after initial load finished
  useEffect(() => {
    if (!didLoadRef.current) return;
    const saveSongs = async () => {
      try {
        await AsyncStorage.setItem(`@playlist_${playlistId}`, JSON.stringify(state.songs));
      } catch (e) {
        console.warn('Failed to save songs', e);
      }
    };
    saveSongs();
  }, [state.songs, playlistId]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={song}
        onChangeText={setSong}
        placeholder="Enter song name"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity onPress={addSong} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Song</Text>
      </TouchableOpacity>

      <FlatList
        data={state.songs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()} style={styles.songItem}>
            <Text style={styles.songText}>{item}</Text>
            <TouchableOpacity onPress={() => removeSong(item)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      <View style={styles.undoRedoRow}>
        <TouchableOpacity onPress={undoAction} style={styles.button}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={redoAction} style={styles.button}>
          <Text style={styles.buttonText}>Redo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={clearSongs} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear Playlist</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000' },
  input: {
    height: 40,
    borderColor: '#1ED760',
    borderWidth: 1,
    color: '#fff',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#1ED760',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontSize: 16 },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1ED760',
  },
  songText: { color: '#fff', fontSize: 18 },
  removeButton: { backgroundColor: '#d9534f', padding: 5, borderRadius: 5 },
  removeButtonText: { color: '#fff', fontSize: 16 },
  undoRedoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { backgroundColor: '#1ED760', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
  clearButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  clearButtonText: { color: '#fff', fontSize: 16 },
});

export default PlaylistDetailScreen;
