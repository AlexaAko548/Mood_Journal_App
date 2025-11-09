import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type GeoPoint = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
};

type SearchedPlace = {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
};

const MOCK_POINTS: GeoPoint[] = [
  {
    id: "checkin_spot",
    title: "Daily Mood Check-in",
    description: "Log your mood when you pass this spot.",
    latitude: 10.3157,
    longitude: 123.8854,
    radius: 100,
  },
  {
    id: "relax_spot",
    title: "Calm Corner",
    description: "Take 5 deep breaths here.",
    latitude: 10.3165,
    longitude: 123.8872,
    radius: 100,
  },
  {
    id: "gratitude_spot",
    title: "Gratitude Zone",
    description: "Think of 3 things you're thankful for.",
    latitude: 10.3149,
    longitude: 123.8839,
    radius: 100,
  },
];

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#e0e0e0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#262626" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#111827" }] },
];

const isWeb = Platform.OS === "web";

// Use loose typing for map components to avoid TS prop/ref noise
let MapView: any = View;
let Marker: any = View;
let Circle: any = View;
let PROVIDER_GOOGLE: any = undefined;

if (!isWeb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function distanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function handleGeofencing(
  userLat: number,
  userLon: number,
  insideRegions: Record<string, boolean>,
  setInsideRegions: (v: Record<string, boolean>) => void
) {
  const updated: Record<string, boolean> = { ...insideRegions };

  MOCK_POINTS.forEach((point) => {
    const d = distanceInMeters(
      userLat,
      userLon,
      point.latitude,
      point.longitude
    );
    const isInside = d <= point.radius;
    const wasInside = !!insideRegions[point.id];

    if (isInside && !wasInside) {
      Alert.alert("Mood Map", `You entered "${point.title}". ${point.description}`);
    } else if (!isInside && wasInside) {
      Alert.alert(
        "Mood Map",
        `You left "${point.title}". See you again here soon.`
      );
    }

    updated[point.id] = isInside;
  });

  setInsideRegions(updated);
}

export default function MoodMapScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [insideRegions, setInsideRegions] = useState<Record<string, boolean>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedPlace, setSearchedPlace] = useState<SearchedPlace | null>(null);

  const mapRef = useRef<any>(null);

  useEffect(() => {
    let watcher: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.High,
      });

      setLocation(current);
      setRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      if (!isWeb) {
        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.LocationAccuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (loc) => {
            setLocation(loc);
            setRegion((prev) => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: prev?.latitudeDelta ?? 0.01,
              longitudeDelta: prev?.longitudeDelta ?? 0.01,
            }));
            handleGeofencing(
              loc.coords.latitude,
              loc.coords.longitude,
              insideRegions,
              setInsideRegions
            );
          }
        );
      } else {
        const interval = setInterval(async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            handleGeofencing(
              loc.coords.latitude,
              loc.coords.longitude,
              insideRegions,
              setInsideRegions
            );
          } catch {
            // ignore
          }
        }, 5000);
        (MoodMapScreen as any)._interval = interval;
      }
    })();

    return () => {
      if (watcher) watcher.remove();
      const interval = (MoodMapScreen as any)._interval;
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    try {
      setIsSearching(true);

      // Using OpenStreetMap Nominatim for demo purposes (no key needed for class project-level usage)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=1`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "MoodJournalApp/1.0",
        },
      });

      const data = await res.json();

      if (!data || !data[0]) {
        Alert.alert("Mood Map", "No location found. Try something more specific.");
        return;
      }

      const best = data[0];
      const lat = parseFloat(best.lat);
      const lon = parseFloat(best.lon);

      const newRegion: Region = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      setSearchedPlace({
        name: (best.display_name || query).split(",")[0],
        displayName: best.display_name || query,
        lat,
        lon,
      });

      if (mapRef.current && !isWeb) {
        mapRef.current.animateToRegion(newRegion, 600);
      }
    } catch (e) {
      Alert.alert(
        "Mood Map",
        "There was a problem searching for that place. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location || !region) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading map & location…</Text>
      </View>
    );
  }

  // Web: preview only
  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        {/* Search bar (web too) */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#9ca3af"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a place (e.g. UP Cebu, Ayala Center)…"
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? "…" : "Go"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.labelTitle, { marginTop: 16 }]}>
          Mood Map (Web Preview)
        </Text>
        <Text style={styles.labelSubtitle}>
          Full interactive map runs on Android/iOS. This preview still tracks your
          location and geofence states.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Location</Text>
          <Text style={styles.cardText}>
            Lat: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.cardText}>
            Lon: {location.coords.longitude.toFixed(6)}
          </Text>
        </View>

        {searchedPlace && (
          <View style={styles.searchResultBox}>
            <Text style={styles.searchResultTitle}>{searchedPlace.name}</Text>
            <Text
              style={styles.searchResultSubtitle}
              numberOfLines={2}
            >
              {searchedPlace.displayName}
            </Text>
            <Text style={styles.searchResultCoords}>
              {searchedPlace.lat.toFixed(4)}, {searchedPlace.lon.toFixed(4)}
            </Text>
          </View>
        )}

        <ScrollView style={{ marginTop: 8 }}>
          {MOCK_POINTS.map((p) => (
            <View key={p.id} style={styles.pointItem}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointDesc}>{p.description}</Text>
              <Text style={styles.pointMeta}>
                {insideRegions[p.id]
                  ? "✅ Inside region"
                  : "⬜ Outside region"}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const recenterOnUser = () => {
    if (!location || !mapRef.current) return;
    const newRegion: Region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 500);
  };

  if (!MapView || !Marker || !Circle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Map is not available on this platform.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar overlay */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#9ca3af"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a place (e.g. UP Cebu, Ayala Center)…"
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? "…" : "Go"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={DARK_MAP_STYLE}
        onRegionChangeComplete={(reg: Region) => setRegion(reg)}
      >
        {MOCK_POINTS.map((point) => (
          <React.Fragment key={point.id}>
            <Marker
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={point.title}
              description={point.description}
            />
            <Circle
              center={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              radius={point.radius}
              strokeWidth={1}
              strokeColor="rgba(129, 140, 248, 0.8)"
              fillColor="rgba(129, 140, 248, 0.25)"
            />
          </React.Fragment>
        ))}

        {searchedPlace && (
          <Marker
            coordinate={{
              latitude: searchedPlace.lat,
              longitude: searchedPlace.lon,
            }}
            title={searchedPlace.name}
            description={searchedPlace.displayName}
            pinColor="#a855f7"
          />
        )}
      </MapView>

      {/* Zoom / recenter controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (!region || !mapRef.current) return;
            mapRef.current.animateToRegion(
              {
                ...region,
                latitudeDelta: region.latitudeDelta / 2,
                longitudeDelta: region.longitudeDelta / 2,
              },
              200
            );
          }}
        >
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (!region || !mapRef.current) return;
            mapRef.current.animateToRegion(
              {
                ...region,
                latitudeDelta: region.latitudeDelta * 2,
                longitudeDelta: region.longitudeDelta * 2,
              },
              200
            );
          }}
        >
          <Text style={styles.controlText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={recenterOnUser}>
          <Ionicons name="locate-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Bottom info */}
      <View style={styles.labelBox}>
        <Text style={styles.labelTitle}>Mood Map</Text>
        <Text style={styles.labelSubtitle}>
          Live location, checkpoints, geofencing & place search.
        </Text>
      </View>

      {searchedPlace && (
        <View style={styles.searchResultBoxBottom}>
          <Text style={styles.searchResultTitle}>{searchedPlace.name}</Text>
          <Text
            style={styles.searchResultSubtitle}
            numberOfLines={1}
          >
            {searchedPlace.displayName}
          </Text>
          <Text style={styles.searchResultCoords}>
            {searchedPlace.lat.toFixed(4)}, {searchedPlace.lon.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#020817",
  },
  loadingText: {
    color: "#e5e7eb",
    fontSize: 16,
  },
  errorText: {
    color: "#f97316",
    fontSize: 16,
    textAlign: "center",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#020817",
    padding: 16,
    paddingTop: 40,
  },
  searchBarWrapper: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.96)",
    borderWidth: 1,
    borderColor: "#111827",
  },
  searchInput: {
    flex: 1,
    color: "#e5e7eb",
    fontSize: 13,
  },
  searchButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#4f46e5",
    marginLeft: 6,
  },
  searchButtonText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
  },
  controls: {
    position: "absolute",
    right: 16,
    bottom: 120,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  controlText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  labelBox: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 40,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  labelTitle: {
    color: "#bfdbfe",
    fontSize: 16,
    fontWeight: "700",
  },
  labelSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    marginTop: 12,
  },
  cardTitle: {
    color: "#bfdbfe",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  pointItem: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 8,
  },
  pointTitle: {
    color: "#bfdbfe",
    fontWeight: "600",
    fontSize: 13,
  },
  pointDesc: {
    color: "#9ca3af",
    fontSize: 11,
  },
  pointMeta: {
    marginTop: 4,
    color: "#a5b4fc",
    fontSize: 11,
  },
  searchResultBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#111827",
  },
  searchResultBoxBottom: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 104,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(9,9,11,0.98)",
    borderWidth: 1,
    borderColor: "#111827",
  },
  searchResultTitle: {
    color: "#bfdbfe",
    fontWeight: "600",
    fontSize: 13,
  },
  searchResultSubtitle: {
    color: "#9ca3af",
    fontSize: 11,
  },
  searchResultCoords: {
    marginTop: 2,
    color: "#a5b4fc",
    fontSize: 10,
  },
});
