// app/homez/playlistDetail.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useTheme } from '../../components/ThemeProvider';

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
      else if (futureAction.type === REMOVE_SONG) songs = state.songs.filter((s: any) => s !== futureAction.song);
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

  // modal input state
  const [songInput, setSongInput] = useState('');
  const [addSongModalVisible, setAddSongModalVisible] = useState(false);

  const [state, dispatch] = useReducer(songReducer, {
    songs: [],
    history: [],
    future: [],
  });

  const navigation: any = useNavigation();
  const didLoadRef = useRef(false);
  const router = useRouter();

  const theme = useTheme(); // <-- read global theme

  // header back button: prefer goBack, fallback to playlist path
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: theme.bg },
      headerTintColor: theme.text,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.replace('/homez/playlist')}
          style={{ marginLeft: 12, padding: 6 }}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, theme.bg, theme.text]);

  // Song actions
  const addSongFromModal = () => {
    const trimmed = songInput.trim();
    if (!trimmed) return; // simple validation
    dispatch({ type: ADD_SONG, song: trimmed });
    setSongInput('');
    setAddSongModalVisible(false);
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
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Add Song button opens modal */}
      <TouchableOpacity
        onPress={() => {
          setSongInput('');
          setAddSongModalVisible(true);
        }}
        style={[styles.addButton, { backgroundColor: theme.accent }]}
      >
        <Text style={[styles.addButtonText, { color: theme.bg === '#FFFFFF' ? '#000' : '#000' }]}>+ Add Song</Text>
      </TouchableOpacity>

      <FlatList
        data={state.songs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            layout={Layout.springify()}
            style={[styles.songItem, { borderBottomColor: `${theme.accent}33` }]}
          >
            <Text style={[styles.songText, { color: theme.text }]}>{item}</Text>
            <TouchableOpacity onPress={() => removeSong(item)} style={[styles.removeButton, { backgroundColor: '#d9534f' }]}>
              <Text style={[styles.removeButtonText, { color: '#fff' }]}>Remove</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      <View style={styles.undoRedoRow}>
        <TouchableOpacity onPress={undoAction} style={[styles.button, { backgroundColor: theme.accent }]}>
          <Text style={[styles.buttonText, { color: '#000' }]}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={redoAction} style={[styles.button, { backgroundColor: theme.accent }]}>
          <Text style={[styles.buttonText, { color: '#000' }]}>Redo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={clearSongs} style={[styles.clearButton, { backgroundColor: '#d9534f' }]}>
        <Text style={[styles.clearButtonText, { color: '#fff' }]}>Clear Playlist</Text>
      </TouchableOpacity>

      {/* -------- Add Song Modal -------- */}
      <Modal visible={addSongModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor: theme.bg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Song</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.accent, color: theme.text, backgroundColor: theme.bg === '#FFFFFF' ? '#fff' : '#111' },
              ]}
              value={songInput}
              onChangeText={setSongInput}
              placeholder="Song name"
              placeholderTextColor="#aaa"
              autoFocus={Platform.OS !== 'web'}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setAddSongModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#666' }]}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addSongFromModal} style={[styles.modalButton, { backgroundColor: theme.accent }]}>
                <Text style={[styles.modalButtonText, { color: '#000' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#111',
  },
  addButton: {
    backgroundColor: '#1ED760',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
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

  /* modal styles */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalButton: {
    backgroundColor: '#1ED760',
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontSize: 16 },
});

export default PlaylistDetailScreen;
