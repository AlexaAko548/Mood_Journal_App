// app/homez/cameraPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CameraFilters from '../../components/CameraFilters';

type SavedPhoto = {
  uri: string;
  filter?: 'none' | 'grayscale' | 'sepia';
  intensity?: number;
};

const STORAGE_KEY = '@my_photos_v1';

export default function CameraPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setPhotos(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to load photos', e);
    }
  };

  const savePhotos = async (newPhotos: SavedPhoto[]) => {
    setPhotos(newPhotos);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPhotos));
    } catch (e) {
      console.warn('Failed to save photos', e);
    }
  };

  const handlePhotoTaken = async (photo: SavedPhoto) => {
    const updated = [photo, ...photos];
    await savePhotos(updated);
    setShowCamera(false);
  };

  const handleEditPhoto = async (action: 'rotate' | 'crop' | 'save') => {
    if (!selectedPhoto) return;

    try {
      let result;
      if (action === 'rotate') {
        result = await ImageManipulator.manipulateAsync(selectedPhoto.uri, [{ rotate: 90 }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
      } else if (action === 'crop') {
        result = await ImageManipulator.manipulateAsync(selectedPhoto.uri, [
          { crop: { originX: 0, originY: 0, width: 200, height: 200 } },
        ]);
      } else {
        const updated = photos.map((p) => (p.uri === selectedPhoto.uri ? selectedPhoto : p));
        await savePhotos(updated);
        setSelectedPhoto(null);
        return;
      }

      if (result?.uri) {
        const updated = photos.map((p) => (p.uri === selectedPhoto.uri ? { ...p, uri: result.uri } : p));
        await savePhotos(updated);
        setSelectedPhoto((prev) => (prev ? { ...prev, uri: result.uri } : prev));
      }
    } catch (e) {
      console.warn('Edit failed', e);
    }
  };

  const handleDeleteSaved = async (photoUri: string) => {
    const updated = photos.filter((p) => p.uri !== photoUri);
    await savePhotos(updated);
    setSelectedPhoto(null);
  };

  return (
    <View style={styles.container}>
      {!showCamera ? (
        <>
          <Text style={styles.title}>Gallery</Text>
          <Button title="Open Camera" onPress={() => setShowCamera(true)} />

          {photos.length === 0 ? (
            <Text style={styles.noPhotos}>No photos yet. Take one!</Text>
          ) : (
            <FlatList
              data={photos}
              keyExtractor={(item, index) => item.uri + index}
              numColumns={4}
              contentContainerStyle={styles.gallery}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedPhoto(item)}>
                  <Image source={{ uri: item.uri }} style={styles.galleryPhoto} />
                </TouchableOpacity>
              )}
            />
          )}

          <Modal visible={!!selectedPhoto} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.modalBackground}
                onPress={() => setSelectedPhoto(null)}
                activeOpacity={1}
              >
                <View style={styles.modalContent}>
                  {selectedPhoto && (
                    <>
                      <Image source={{ uri: selectedPhoto.uri }} style={styles.selectedPhoto} />
                      <View style={styles.editButtons}>
                        <TouchableOpacity onPress={() => handleEditPhoto('rotate')} style={styles.editButton}>
                          <Text style={styles.editText}>Rotate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleEditPhoto('crop')} style={styles.editButton}>
                          <Text style={styles.editText}>Crop</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleEditPhoto('save')} style={[styles.editButton, { backgroundColor: '#4a90e2' }]}>
                          <Text style={styles.editText}>Save Edits</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSaved(selectedPhoto.uri)} style={[styles.editButton, { backgroundColor: '#d9534f' }]}>
                          <Text style={styles.editText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      ) : (
        <CameraFilters onPhotoTaken={handlePhotoTaken} onBack={() => setShowCamera(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 10 },
  title: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  gallery: { alignItems: 'center', justifyContent: 'center' },
  noPhotos: { color: '#999', textAlign: 'center', marginTop: 20, fontSize: 16 },
  galleryPhoto: { width: 80, height: 80, margin: 4, borderRadius: 8 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  modalContent: { width: '90%', alignItems: 'center' },
  selectedPhoto: { width: '100%', height: 400, borderRadius: 10, resizeMode: 'contain' },
  editButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, flexWrap: 'wrap' },
  editButton: { backgroundColor: '#1ED760', borderRadius: 6, marginHorizontal: 6, marginVertical: 6, paddingHorizontal: 14, paddingVertical: 10 },
  editText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
