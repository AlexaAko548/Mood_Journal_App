import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');

export default function SpotifyLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 🔹 handle login
  function handleLogin() {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    // Mock successful login
    Alert.alert('Success', `Welcome back, ${username}!`);
    router.push('/homez/home'); // go to your home screen
  }

  function handleForgotPassword() {
    Alert.alert('Forgot Password', 'Redirecting to password recovery...');
    // router.push("/forgot"); // create later if you want
  }

  // function handleSignUp() {
  //   router.push('/signup'); // link to signup page
  // }

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
            {/* Top logo */}
            <View style={styles.top}>
              <Image
                source={require('../assets/images/spotify-logo-g.png')}
                style={{ width: 75, height: 75 }}
              />
              <Text style={styles.title}>Spotify</Text>
            </View>

            {/* Inputs */}
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

              <TouchableOpacity style={styles.fg} onPress={handleForgotPassword}>
                <Text style={styles.smallGrey}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign In button */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={{ marginTop: 18 }}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={['#055607ff', '#1ED760']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.signBtn}
                >
                  <Text style={[styles.signText, { color: '#fff' }]}>
                    Sign In
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Social row */}
              <View style={styles.socialRow}>
                <Text style={styles.signupLink}>Be Correct With</Text>

                <View style={styles.iconRow}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => Alert.alert('Facebook Login')}
                  >
                    <FontAwesome name="facebook" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, { marginLeft: 10 }]}
                    onPress={() => Alert.alert('Google Login')}
                  >
                    <AntDesign name="google" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Signup */}
              <View style={styles.signupRow}>
                <Text style={styles.smallGrey}>Don't have an account? </Text>
                <TouchableOpacity>
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
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: CARD_W,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  top: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  form: {
    width: '100%',
    marginTop: 6,
  },
  input: {
    width: '100%',
    backgroundColor: '#121212',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  signBtn: {
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signText: {
    fontSize: 16,
    fontWeight: '700',
  },
  socialRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  smallGrey: {
    color: '#9a9a9a',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  fg: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    color: '#1ED760',
    fontWeight: '600',
  },
});
