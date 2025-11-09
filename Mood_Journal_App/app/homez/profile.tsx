// app/week4/Activity2ProfileForm.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, } from 'react-native-reanimated';
import { useTheme } from '../../components/ThemeProvider';

const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENRES = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop'] as const;
type Genre = (typeof GENRES)[number];
const STORAGE_KEY = '@week4_profile_form_v1';

// Memoized preview so it only rerenders when props change
const ProfilePreview = React.memo(function ProfilePreview({
  username,
  email,
  genre,
  theme,
}: {
  username: string;
  email: string;
  genre?: string | null;
  theme: { bg: string; text: string; accent: string };
}) {
  const hasData = !!(username || email || genre);
  const imageUrl = genre
    ? `https://via.placeholder.com/100?text=${encodeURIComponent(String(genre))}`
    : 'https://via.placeholder.com/100?text=Profile';

  const [imgFailed, setImgFailed] = useState(false);
  const navigation: any = useNavigation();
  
    useLayoutEffect(() => {
        navigation.setOptions({
          headerShown: true,
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
        });
      }, [navigation, theme.bg, theme.text]);

  useEffect(() => {
    // reset on url change
    setImgFailed(false);
  }, [imageUrl]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.previewCard,
        !hasData && styles.previewCardEmpty,
        { backgroundColor: theme.bg, borderColor: `${theme.accent}33` },
      ]}
    >
      {imgFailed ? (
        <View
          style={[
            styles.previewImage,
            { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.accent },
          ]}
        >
          <Text style={{ color: theme.bg, fontSize: 12 }}>{genre ? String(genre) : 'Profile'}</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={styles.previewImage}
          resizeMode="cover"
          onError={() => {
            console.warn('Image failed to load:', imageUrl);
            setImgFailed(true);
          }}
        />
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.previewLabel, { color: theme.text }]}>Username</Text>
        <Text style={[styles.previewText, { color: theme.text }]}>{username || '—'}</Text>

        <Text style={[styles.previewLabel, { color: theme.text }]}>Email</Text>
        <Text style={[styles.previewText, { color: theme.text }]}>{email || '—'}</Text>

        <Text style={[styles.previewLabel, { color: theme.text }]}>Genre</Text>
        <Text style={[styles.previewText, { color: theme.text }]}>{genre || '—'}</Text>
      </View>
    </Animated.View>
  );
});

export default function Activity2ProfileForm() {
  const theme = useTheme();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [genre, setGenre] = useState<string | null>(null);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [genreError, setGenreError] = useState<string | null>(null);

  const didLoadRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // shared values for shake
  const usernameShake = useSharedValue(0);
  const emailShake = useSharedValue(0);
  const genreShake = useSharedValue(0);

  const usernameStyle = useAnimatedStyle(() => ({ transform: [{ translateX: usernameShake.value }] }));
  const emailStyle = useAnimatedStyle(() => ({ transform: [{ translateX: emailShake.value }] }));
  const genreStyle = useAnimatedStyle(() => ({ transform: [{ translateX: genreShake.value }] }));

  const validateUsername = useCallback((v: string) => {
    if (!v) return 'Username is required';
    if (!usernameRegex.test(v)) return '3-20 chars: letters, numbers, underscores only';
    return null;
  }, []);

  const validateEmail = useCallback((v: string) => {
    if (!v) return 'Email is required';
    if (!emailRegex.test(v)) return 'Invalid email format';
    return null;
  }, []);

  const validateGenre = useCallback((g: string | null) => {
    if (!g) return 'Please select a genre';
    if (!GENRES.includes(g as Genre)) return 'Invalid genre';
    return null;
  }, []);

  const shake = (shared: any) => {
    shared.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 80 }),
      withSpring(0, { damping: 8, stiffness: 150 })
    );
  };

  // hydrate cached form
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.genre) setGenre(parsed.genre);
        }
      } catch (e) {
        console.warn('Failed to load cached form', e);
      } finally {
        didLoadRef.current = true;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // debounce save
  useEffect(() => {
    if (!didLoadRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ username, email, genre }));
      } catch (e) {
        console.warn('Failed to save cached form', e);
      }
      saveTimerRef.current = null;
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [username, email, genre]);

  // realtime validation
  useEffect(() => {
    setUsernameError(validateUsername(username));
  }, [username, validateUsername]);

  useEffect(() => {
    setEmailError(validateEmail(email));
  }, [email, validateEmail]);

  useEffect(() => {
    setGenreError(validateGenre(genre));
  }, [genre, validateGenre]);

  const handleSubmit = async () => {
    const ue = validateUsername(username);
    const ee = validateEmail(email);
    const ge = validateGenre(genre);

    setUsernameError(ue);
    setEmailError(ee);
    setGenreError(ge);

    if (ue) shake(usernameShake);
    if (ee) shake(emailShake);
    if (ge) shake(genreShake);

    if (ue || ee || ge) return;

    // success: clear cache and reset (assignment spec)
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear cache on submit', e);
    }
    setUsername('');
    setEmail('');
    setGenre(null);
  };

  const onSelectGenre = (g: string) => setGenre(g);

  const previewProps = useMemo(() => ({ username, email, genre, theme }), [username, email, genre, theme]);

  // contrasting colors for inputs/buttons
  const inputBg = theme.bg === '#FFFFFF' ? '#fff' : '#111';
  const inputTextColor = theme.text;
  const placeholderColor = theme.text === '#111111' ? '#666' : '#999';
  const submitTextColor = theme.bg === '#FFFFFF' ? '#000' : '#000';

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.page, { backgroundColor: theme.bg }]} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Animated.View style={[styles.fieldWrap, usernameStyle]}>
            <Text style={[styles.label, { color: theme.text }]}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={[
                styles.input,
                usernameError ? styles.inputError : null,
                { backgroundColor: inputBg, color: inputTextColor, borderColor: usernameError ? '#d9534f' : theme.accent },
              ]}
              placeholder="3-20 chars, letters/numbers/_"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
            />
            {usernameError ? (
              <Animated.Text entering={FadeIn} style={[styles.errorText, { color: '#ff8b8b' }]}>
                {usernameError}
              </Animated.Text>
            ) : null}
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, emailStyle]}>
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
                emailError ? styles.inputError : null,
                { backgroundColor: inputBg, color: inputTextColor, borderColor: emailError ? '#d9534f' : theme.accent },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Animated.Text entering={FadeIn} style={[styles.errorText, { color: '#ff8b8b' }]}>
                {emailError}
              </Animated.Text>
            ) : null}
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, genreStyle]}>
            <Text style={[styles.label, { color: theme.text }]}>Favorite Genre</Text>
            <View style={styles.genreRow}>
              {GENRES.map(g => {
                const active = genre === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => onSelectGenre(g)}
                    style={[
                      styles.genreBtn,
                      active && styles.genreBtnActive,
                      active && { backgroundColor: theme.accent },
                      { backgroundColor: !active ? (theme.bg === '#FFFFFF' ? '#eee' : '#222') : theme.accent },
                    ]}
                  >
                    <Text style={[styles.genreText, active && styles.genreTextActive, { color: active ? '#000' : theme.text }]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {genreError ? (
              <Animated.Text entering={FadeIn} style={[styles.errorText, { color: '#ff8b8b' }]}>
                {genreError}
              </Animated.Text>
            ) : null}
          </Animated.View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.accent }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.submitText, { color: submitTextColor }]}>Submit (validate & clear)</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.previewHeader, { color: theme.text }]}>Profile Preview</Text>
        <ProfilePreview {...previewProps} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#000',
    minHeight: '100%',
  },
  h1: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 12,
    fontWeight: '700',
  },
  form: {
    marginBottom: 18,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  label: {
    color: '#ddd',
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  inputError: {
    borderColor: '#d9534f',
  },
  errorText: {
    color: '#ff8b8b',
    marginTop: 6,
    fontSize: 12,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#222',
    marginRight: 8,
    marginTop: 6,
  },
  genreBtnActive: {
    backgroundColor: '#1ed760',
  },
  genreText: {
    color: '#ddd',
  },
  genreTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: '#1ed760',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#000',
    fontWeight: '700',
  },
  previewHeader: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  previewCardEmpty: {
    opacity: 0.85,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#333',
  },
  previewLabel: {
    color: '#888',
    fontSize: 12,
  },
  previewText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
  },
});
