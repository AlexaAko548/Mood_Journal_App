// app/week4/Activity2ProfileForm.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENRES = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop'] as const;
type Genre = (typeof GENRES)[number];
const STORAGE_KEY = '@week4_profile_form_v1';

// Memoized preview so it only rerenders when props change
// put this in place of your current ProfilePreview component
const ProfilePreview = React.memo(function ProfilePreview({
  username,
  email,
  genre,
}: {
  username: string;
  email: string;
  genre?: string | null;
}) {
  const hasData = !!(username || email || genre);
  const imageUrl = genre
    ? `https://via.placeholder.com/100?text=${encodeURIComponent(String(genre))}`
    : 'https://via.placeholder.com/100?text=Profile';

  const [imgFailed, setImgFailed] = useState(false);

  // optional: helpful debug log so you can copy/paste and inspect the URL in browser
  useEffect(() => {
    console.log('ProfilePreview imageUrl:', imageUrl);
    setImgFailed(false); // reset failure when url changes
  }, [imageUrl]);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.previewCard, !hasData && styles.previewCardEmpty]}>
      {imgFailed ? (
        // fallback box with text if remote image fails
        <View style={[styles.previewImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#444' }]}>
          <Text style={{ color: '#fff', fontSize: 12 }}>{genre ? String(genre) : 'Profile'}</Text>
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
        <Text style={styles.previewLabel}>Username</Text>
        <Text style={styles.previewText}>{username || '—'}</Text>

        <Text style={styles.previewLabel}>Email</Text>
        <Text style={styles.previewText}>{email || '—'}</Text>

        <Text style={styles.previewLabel}>Genre</Text>
        <Text style={styles.previewText}>{genre || '—'}</Text>
      </View>
    </Animated.View>
  );
});

export default function Activity2ProfileForm() {
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

    // success: clear cache and reset
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

  const previewProps = useMemo(() => ({ username, email, genre }), [username, email, genre]);

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">

        <View style={styles.form}>
          <Animated.View style={[styles.fieldWrap, usernameStyle]}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={[styles.input, usernameError ? styles.inputError : null]}
              placeholder="3-20 chars, letters/numbers/_"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            {usernameError ? (
              <Animated.Text entering={FadeIn} style={styles.errorText}>
                {usernameError}
              </Animated.Text>
            ) : null}
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, emailStyle]}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="you@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Animated.Text entering={FadeIn} style={styles.errorText}>
                {emailError}
              </Animated.Text>
            ) : null}
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, genreStyle]}>
            <Text style={styles.label}>Favorite Genre</Text>
            <View style={styles.genreRow}>
              {GENRES.map(g => {
                const active = genre === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => onSelectGenre(g)}
                    style={[styles.genreBtn, active && styles.genreBtnActive]}
                  >
                    <Text style={[styles.genreText, active && styles.genreTextActive]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {genreError ? (
              <Animated.Text entering={FadeIn} style={styles.errorText}>
                {genreError}
              </Animated.Text>
            ) : null}
          </Animated.View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit (validate & clear)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.previewHeader}>Profile Preview</Text>
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
