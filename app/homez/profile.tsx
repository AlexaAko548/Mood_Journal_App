import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedWrapper from "../../components/AnimatedWraper"; // ✅ fix typo (Wraper → Wrapper)

const LOGIN_FLAG_KEY = '@mood_app_is_logged_in';

export default function ProfileScreen() {
  const router = useRouter();

  async function performLogout() {
    try {
      await AsyncStorage.removeItem(LOGIN_FLAG_KEY);
    } catch (e) {
      console.warn('Failed to clear login flag', e);
    } finally {
      // Replace so the user can't press back and return to a cleared session
      router.replace('/');
    }
  }

  function confirmLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: performLogout },
    ]);
  }

  return (
    <AnimatedWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  card: {
    marginTop: 24,
    width: '100%',
    maxWidth: 520,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', fontWeight: '700' },
});
