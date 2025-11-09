// store/themeSlice.ts (key parts)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeState = {
  mode: 'light' | 'dark' | 'custom';
  accent: string;
};

const initialState: ThemeState = { mode: 'dark', accent: '#1ED760' };

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ThemeState['mode']>) { state.mode = action.payload; },
    setAccent(state, action: PayloadAction<string>) { state.accent = action.payload; },
    setTheme(_state, action: PayloadAction<ThemeState>) { return action.payload; },
  },
});

export const { setMode, setAccent, setTheme } = slice.actions;
export default slice.reducer;
