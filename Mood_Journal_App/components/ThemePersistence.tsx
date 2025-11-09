// components/ThemePersistence.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../store/themeSlice';

const THEME_KEY = '@app_theme_v1';

type SavedTheme = { mode?: string; accent?: string };

export default function ThemePersistence() {
  const theme = useSelector((s: RootState) => s.theme);
  const dispatch = useDispatch();

  // Save theme on change
  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(theme)).catch(console.warn);
  }, [theme]);

  // Load theme once on startup and dispatch
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        console.log('[ThemePersistence] loaded raw:', raw);
        if (!raw) return;
        const parsed: SavedTheme = JSON.parse(raw);

        if ((parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'custom') && typeof parsed.accent === 'string') {
          dispatch(setTheme({ mode: parsed.mode as any, accent: parsed.accent }));
          console.log('[ThemePersistence] dispatched setTheme:', parsed);
        } else {
          console.warn('[ThemePersistence] invalid saved theme, ignoring:', parsed);
        }
      } catch (e) {
        console.warn('[ThemePersistence] error loading theme:', e);
      }
    })();
  }, [dispatch]);

  return null;
}
