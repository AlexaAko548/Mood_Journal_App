// app/index.tsx
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { JSX, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const STORAGE_KEY = '@mood_app_is_logged_in';

export default function SpotifyLogin(): JSX.Element {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // on mount: check persisted login state
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === '1') {
          // already logged in — go straight to drawer home
          router.replace('/homez/home');
        }
      } catch (e) {
        console.warn('Failed reading login flag', e);
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    // TODO: replace with real auth (API / firebase)
    // Mock success:
    try {
      await AsyncStorage.setItem(STORAGE_KEY, '1'); // persist logged-in state
      // Use replace so the user can't navigate back to login with hardware back button
      router.replace('/homez/home');
    } catch (e) {
      console.warn('Failed to save login', e);
      Alert.alert('Error', 'Failed to login right now — try again.');
    }
  }

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#1ED760" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#272727ff', '#000000', '#000000']}
      start={[0, 0]}
      end={[0, 1]}
      style={styles.gradient}
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.outer}>
          <View style={styles.card}>
            <View style={styles.top}>
              <Image source={require('../assets/images/spotify-logo-g.png')} style={{ width: 75, height: 75 }} />
              <Text style={styles.title}>Spotify</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                placeholder="Username"
                placeholderTextColor="#9a9a9a"
                style={styles.input}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9a9a9a"
                style={[styles.input, { marginTop: 12 }]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.fg} onPress={() => Alert.alert('Forgot Password', 'Password recovery placeholder')}>
                <Text style={styles.smallGrey}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 18 }} onPress={handleLogin}>
                <LinearGradient colors={['#055607ff', '#1ED760']} start={[0, 0]} end={[1, 0]} style={styles.signBtn}>
                  <Text style={[styles.signText, { color: '#fff' }]}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.socialRow}>
                <Text style={styles.signupLink}>Be Correct With</Text>

                <View style={styles.iconRow}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Facebook Login')}>
                    <FontAwesome name="facebook" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]} onPress={() => Alert.alert('Google Login')}>
                    <AntDesign name="google" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.signupRow}>
                <Text style={styles.smallGrey}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/homez/signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD_W = Math.min(SCREEN_W - 48, 320);
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  outer: { width: '100%', alignItems: 'center' },
  card: { width: CARD_W, paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  top: { alignItems: 'center', marginBottom: 18 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 12, letterSpacing: 0.3 },
  form: { width: '100%', marginTop: 6 },
  input: { width: '100%', backgroundColor: '#121212', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#1a1a1a' },
  signBtn: { borderRadius: 22, paddingVertical: 12, alignItems: 'center' },
  signText: { fontSize: 16, fontWeight: '700' },
  socialRow: { marginTop: 14, alignItems: 'center' },
  smallGrey: { color: '#9a9a9a', fontSize: 12, textAlign: 'center', marginBottom: 6 },
  fg: { marginTop: 14, alignItems: 'flex-end' },
  iconRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  signupRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupLink: { color: '#1ED760', fontWeight: '600' },
});
