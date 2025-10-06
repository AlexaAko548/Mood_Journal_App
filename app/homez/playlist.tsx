// app/homez/playlist.tsx
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
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
import AnimatedWrapper from '../../components/AnimatedWraper';
import { useTheme } from '../../components/ThemeProvider'; // <-- theme hook

// Define types for actions
const ADD_PLAYLIST = 'ADD_PLAYLIST';
const REMOVE_PLAYLIST = 'REMOVE_PLAYLIST';
const EDIT_PLAYLIST = 'EDIT_PLAYLIST';
const UNDO = 'UNDO';
const REDO = 'REDO';
const SET_PLAYLISTS = 'SET_PLAYLISTS';

// Playlist reducer function
interface Playlist {
  id: string;
  name: string;
}

interface PlaylistState {
  playlists: Playlist[];
  history: any[];
  future: any[];
}

const playlistReducer = (state: PlaylistState, action: any): PlaylistState => {
  switch (action.type) {
    case ADD_PLAYLIST:
      return {
        ...state,
        playlists: [...state.playlists, { id: action.id, name: action.name }],
        history: [...state.history, { type: ADD_PLAYLIST, name: action.name, id: action.id }],
        future: [],
      };

    case REMOVE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.id),
        history: [...state.history, { type: REMOVE_PLAYLIST, id: action.id, name: action.name }],
        future: [],
      };

    case EDIT_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.map(p => (p.id === action.id ? { ...p, name: action.name } : p)),
        history: [...state.history, { type: EDIT_PLAYLIST, id: action.id, name: action.name, prevName: action.prevName }],
        future: [],
      };

    case SET_PLAYLISTS:
      return { ...state, playlists: action.playlists || [] };

    case UNDO: {
      const last = state.history[state.history.length - 1];
      if (!last) return state;
      const history = state.history.slice(0, -1);
      let playlists = state.playlists.slice();

      if (last.type === ADD_PLAYLIST) {
        playlists = playlists.filter(p => p.id !== last.id);
      } else if (last.type === REMOVE_PLAYLIST) {
        playlists = [{ id: last.id, name: last.name || 'Restored' }, ...playlists];
      } else if (last.type === EDIT_PLAYLIST) {
        playlists = playlists.map(p => (p.id === last.id ? { ...p, name: last.prevName ?? p.name } : p));
      }

      return { ...state, playlists, history, future: [last, ...state.future] };
    }

    case REDO: {
      const next = state.future[0];
      if (!next) return state;
      const future = state.future.slice(1);
      let playlists = state.playlists.slice();

      if (next.type === ADD_PLAYLIST) playlists = [...playlists, { id: next.id ?? Date.now().toString(), name: next.name }];
      else if (next.type === REMOVE_PLAYLIST) playlists = playlists.filter(p => p.id !== next.id);
      else if (next.type === EDIT_PLAYLIST) playlists = playlists.map(p => (p.id === next.id ? { ...p, name: next.name } : p));

      return { ...state, playlists, history: [...state.history, next], future };
    }

    default:
      return state;
  }
};

const PlaylistScreen = () => {
  // states and reducer
  const [nameInput, setNameInput] = useState(''); // used for Add modal
  const [state, dispatch] = useReducer(playlistReducer, {
    playlists: [],
    history: [],
    future: [],
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const router = useRouter();
  const navigation: any = useNavigation();
  const theme = useTheme(); // <-- read global theme

  // hydration guard so we don't overwrite AsyncStorage on mount
  const didLoadRef = useRef(false);

  // Add flow (from modal)
  const openAddModal = () => {
    setNameInput('');
    setAddModalVisible(true);
  };

  const addPlaylistFromModal = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const id = Date.now().toString();
    dispatch({ type: ADD_PLAYLIST, id, name: trimmed });
    setNameInput('');
    setAddModalVisible(false);
  };

  // Remove
  const removePlaylist = (id: string) => {
    const removed = state.playlists.find(p => p.id === id);
    dispatch({ type: REMOVE_PLAYLIST, id, name: removed?.name });
  };

  // Edit flow (uses separate modal)
  const openEditModal = (id: string) => {
    const target = state.playlists.find(p => p.id === id);
    setEditingPlaylistId(id);
    setEditedName(target?.name ?? '');
    setEditModalVisible(true);
  };

  const editPlaylist = () => {
    if (editingPlaylistId && editedName.trim()) {
      const prev = state.playlists.find(p => p.id === editingPlaylistId)?.name;
      dispatch({ type: EDIT_PLAYLIST, id: editingPlaylistId, name: editedName.trim(), prevName: prev });
      setEditModalVisible(false);
      setEditingPlaylistId(null);
      setEditedName('');
    }
  };

  // update navigator header colors when theme changes
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: theme.bg },
      headerTintColor: theme.text,
    });
  }, [navigation, theme.bg, theme.text]);

  // Save playlists only after initial load is done
  useEffect(() => {
    if (!didLoadRef.current) return;
    const savePlaylists = async () => {
      try {
        await AsyncStorage.setItem('@playlists', JSON.stringify(state.playlists));
      } catch (e) {
        console.warn('Failed to save playlists', e);
      }
    };
    savePlaylists();
  }, [state.playlists]);

  // Load initial playlists
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const playlists = await AsyncStorage.getItem('@playlists');
        if (playlists) {
          dispatch({ type: SET_PLAYLISTS, playlists: JSON.parse(playlists) });
        }
      } catch (e) {
        console.warn('Failed to load playlists', e);
      } finally {
        // allow saving now that initial load has completed
        didLoadRef.current = true;
      }
    };
    loadPlaylists();
  }, []);

  // compute contrasting text color for accent pills/buttons (you can tweak this if needed)
  const accentTextColor = '#000';

  return (
    <AnimatedWrapper>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Add button opens modal */}
        <TouchableOpacity onPress={openAddModal} style={[styles.addButton, { backgroundColor: theme.accent }]}>
          <Text style={[styles.addButtonText, { color: accentTextColor }]}>+ Add Playlist</Text>
        </TouchableOpacity>

        <FlatList
          data={state.playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout.springify()}
              style={[styles.playlistItem, { borderBottomColor: `${theme.accent}33` }]}
            >
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/homez/playlistDetail', params: { id: item.id } })}
                style={styles.playlistName}
              >
                <Text style={[styles.playlistText, { color: theme.text }]}>{item.name}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openEditModal(item.id)}
                style={styles.optionsButton}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                accessibilityLabel="Playlist options"
                accessibilityRole="button"
              >
                <MaterialIcons name="more-horiz" size={24} color={theme.accent} />
              </TouchableOpacity>
            </Animated.View>
          )}
        />

        <View style={styles.undoRedoRow}>
          <TouchableOpacity onPress={() => dispatch({ type: UNDO })} style={[styles.button, { backgroundColor: theme.accent }]}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dispatch({ type: REDO })} style={[styles.button, { backgroundColor: theme.accent }]}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Redo</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- Add Playlist Modal ---------- */}
        <Modal visible={addModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={[styles.modal, { backgroundColor: theme.bg }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Playlist</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.accent, color: theme.text, backgroundColor: theme.bg === '#FFFFFF' ? '#fff' : '#111' },
                ]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Playlist name"
                placeholderTextColor="#999"
                autoFocus={Platform.OS !== 'web'}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setAddModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#666' }]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addPlaylistFromModal} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ---------- Edit Playlist Modal ---------- */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={[styles.modal, { backgroundColor: theme.bg }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Playlist</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.accent, color: theme.text, backgroundColor: theme.bg === '#FFFFFF' ? '#fff' : '#111' },
                ]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="New playlist name"
                placeholderTextColor="#999"
                autoFocus={Platform.OS !== 'web'}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#666' }]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={editPlaylist} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (editingPlaylistId) removePlaylist(editingPlaylistId);
                  setEditModalVisible(false);
                }}
                style={[styles.modalButton, { marginTop: 10, backgroundColor: '#d9534f' }]}
              >
                <Text style={styles.modalButtonText}>Remove Playlist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </AnimatedWrapper>
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1ED760',
  },
  playlistName: { flex: 1 },
  playlistText: { color: '#fff', fontSize: 18 },
  optionsButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  optionsButtonText: { color: '#1ED760', fontSize: 18 },
  undoRedoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { backgroundColor: '#1ED760', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
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

export default PlaylistScreen;
