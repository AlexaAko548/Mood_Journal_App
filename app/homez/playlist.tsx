import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlaylistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Playlist 🎶</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "600" },
});
