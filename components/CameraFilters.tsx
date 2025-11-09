// components/CameraFilters.tsx
import Slider from '@react-native-community/slider';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SavedPhoto = {
  uri: string;
  filter?: 'none' | 'grayscale' | 'sepia';
  intensity?: number;
};

export default function CameraFilters({
  onPhotoTaken,
  onBack,
}: {
  onPhotoTaken: (photo: SavedPhoto) => void;
  onBack: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');
  const [intensity, setIntensity] = useState(1);
  const [cameraRef, setCameraRef] = useState<any>(null);

  if (!permission) {
    return <View style={styles.center}><Text>Loading camera...</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need camera permission</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({ quality: 0.7 });
        setCapturedPhoto(photo.uri);
      } catch (e) {
        console.warn('Capture failed', e);
      }
    }
  };

  const handleFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleSave = () => {
    if (!capturedPhoto) return;
    onPhotoTaken({ uri: capturedPhoto, filter, intensity });
  };

  const handleDeletePreview = () => {
    setCapturedPhoto(null);
    setFilter('none');
    setIntensity(1);
  };

  const filterStyle = () => {
    if (Platform.OS === 'web') {
      if (filter === 'grayscale') return { filter: `grayscale(${intensity})` as any };
      if (filter === 'sepia') return { filter: `sepia(${intensity})` as any };
      return {};
    }
    return {};
  };

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={(ref) => setCameraRef(ref)}
          />
          <View style={styles.topControls}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={handleFlip} style={styles.button}>
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCapture} style={styles.button}>
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={[styles.preview, filterStyle() as any]} />

          <View style={styles.filterRow}>
            <TouchableOpacity onPress={() => setFilter('none')} style={styles.filterButton}>
              <Text>None</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('grayscale')} style={styles.filterButton}>
              <Text>Grayscale</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('sepia')} style={styles.filterButton}>
              <Text>Sepia</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sliderRow}>
            <Text style={{ color: '#fff', marginBottom: 6 }}>Intensity: {intensity.toFixed(1)}</Text>
            <Slider
              style={{ width: '80%' }}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              value={intensity}
              onValueChange={setIntensity}
            />
          </View>

          <View style={{ flexDirection: 'row', marginTop: 18 }}>
            <TouchableOpacity onPress={handleDeletePreview} style={[styles.button, { marginRight: 12, backgroundColor: '#d9534f' }]}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCapturedPhoto(null)} style={[styles.button, { marginLeft: 12, backgroundColor: '#666' }]}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  button: {
    backgroundColor: '#1ED760',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: 12 },
  preview: { width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 10 },
  filterRow: { flexDirection: 'row', marginTop: 20 },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  sliderRow: { marginTop: 10, alignItems: 'center' },
  topControls: { position: 'absolute', top: 40, left: 8, zIndex: 10 },
  backButton: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginTop: -30 },
  backText: { color: '#fff', fontSize: 16 },
});
