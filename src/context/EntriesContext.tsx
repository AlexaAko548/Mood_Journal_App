import React, { createContext, useEffect, useState, ReactNode, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Entry = {
  id: string;
  date: string; // ISO string
  mood: string; // emoji
  note?: string;
};

type EntriesContextType = {
  entries: Entry[];
  addEntry: (e: Omit<Entry, 'id'>) => void;
  removeEntry: (id: string) => void;
  loading: boolean;
};

export const EntriesContext = createContext<EntriesContextType>({
  entries: [],
  addEntry: () => {},
  removeEntry: () => {},
  loading: true,
});

const STORAGE_KEY = '@mood_entries_v1';

export function EntriesProvider({ children }: { children: ReactNode }): JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setEntries(JSON.parse(raw) as Entry[]);
      } catch (e) {
        console.warn('Failed to load entries', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // persist on every change
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (e) {
        console.warn('Failed to save entries', e);
      }
    })();
  }, [entries]);

  function addEntry(e: Omit<Entry, 'id'>) {
    const newEntry: Entry = { id: Date.now().toString(), ...e };
    setEntries(prev => [newEntry, ...prev]);
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(x => x.id !== id));
  }

  return (
    <EntriesContext.Provider value={{ entries, addEntry, removeEntry, loading }}>
      {children}
    </EntriesContext.Provider>
  );
}
