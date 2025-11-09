import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PokemonListItem = {
  id: number;
  name: string;
  image: string;
  types: string[];
};

type CachedData = {
  timestamp: number;
  pokemons: PokemonListItem[];
  nextUrl: string | null;
};

const INITIAL_URL = 'https://pokeapi.co/api/v2/pokemon?limit=20';
const CACHE_KEY = 'pokemon_cache_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchPokemonPage(
  url: string
): Promise<{ pokemons: PokemonListItem[]; nextUrl: string | null }> {
  const res = await axios.get(url);
  const { next, results } = res.data as {
    next: string | null;
    results: { name: string; url: string }[];
  };

  const detailed = await Promise.all(
    results.map(async (item) => {
      const d = await axios.get(item.url);
      const data = d.data;
      const image =
        data.sprites?.other?.['official-artwork']?.front_default ||
        data.sprites?.front_default ||
        '';

      return {
        id: data.id,
        name: capitalize(data.name),
        image,
        types: data.types.map((t: any) => t.type.name),
      } as PokemonListItem;
    })
  );

  return { pokemons: detailed, nextUrl: next };
}

const App = () => {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(INITIAL_URL);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState<boolean>(false);

  const saveCache = async (data: {
    pokemons: PokemonListItem[];
    nextUrl: string | null;
  }) => {
    const cache: CachedData = {
      timestamp: Date.now(),
      pokemons: data.pokemons,
      nextUrl: data.nextUrl,
    };
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // ignore cache errors
    }
  };

  const loadFromCacheIfFresh = async (): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return false;

      const cache: CachedData = JSON.parse(raw);
      const isFresh = Date.now() - cache.timestamp < CACHE_TTL;

      if (!isFresh) return false;

      setPokemons(cache.pokemons);
      setNextUrl(cache.nextUrl);
      setOffline(false);
      setLoading(false);
      return true;
    } catch {
      return false;
    }
  };

  const loadInitial = useCallback(
    async (forceRefresh = false) => {
      setError(null);
      setOffline(false);

      if (!forceRefresh) {
        setLoading(true);
        const usedCache = await loadFromCacheIfFresh();
        if (usedCache) return;
      }

      try {
        setLoading(true);
        const data = await fetchPokemonPage(INITIAL_URL);
        setPokemons(data.pokemons);
        setNextUrl(data.nextUrl);
        await saveCache({
          pokemons: data.pokemons,
          nextUrl: data.nextUrl,
        });
      } catch (e) {
        console.log(e);
        setError('Failed to load Pokémon. Check your connection.');
        // try fallback to old cache
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cache: CachedData = JSON.parse(raw);
          setPokemons(cache.pokemons);
          setNextUrl(cache.nextUrl);
          setOffline(true);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadInitial(false);
  }, [loadInitial]);

  const loadMore = async () => {
    if (!nextUrl || loadingMore || loading || refreshing) return;

    try {
      setLoadingMore(true);
      const data = await fetchPokemonPage(nextUrl);
      const merged = [...pokemons, ...data.pokemons];
      setPokemons(merged);
      setNextUrl(data.nextUrl);
      await saveCache({
        pokemons: merged,
        nextUrl: data.nextUrl,
      });
    } catch (e) {
      console.log(e);
      setError('Failed to load more Pokémon.');
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitial(true); // force fresh from API
  };

  const renderPokemon = ({ item }: { item: PokemonListItem }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.typeRow}>
          {item.types.map((t) => (
            <View key={t} style={styles.typeBadge}>
              <Text style={styles.typeText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading && pokemons.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Pokémon…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Pokédex</Text>
      {offline && (
        <Text style={styles.offlineBanner}>
          Offline mode: showing cached data.
        </Text>
      )}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadInitial(true)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={pokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPokemon}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ marginVertical: 12 }}
              size="small"
              color="#3b82f6"
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020817',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020817',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  offlineBanner: {
    color: '#facc15',
    paddingHorizontal: 16,
    marginBottom: 4,
    fontSize: 12,
  },
  loadingText: {
    marginTop: 8,
    color: '#9ca3af',
  },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 6,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  retryText: {
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#1d4ed8',
  },
  typeText: {
    color: '#e5e7eb',
    fontSize: 10,
    textTransform: 'capitalize',
  },
});
